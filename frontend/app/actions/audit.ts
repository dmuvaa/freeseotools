'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { pushToQueue, QUEUE_NAME } from '@/lib/redis'
import { z } from 'zod'

const CreateAuditJobSchema = z.object({
    projectId: z.string().uuid(),
    queryPhrase: z.string().min(1).max(500),
    models: z.array(z.string()).min(1).max(5),
    jobType: z.enum(['STANDARD', 'KNOWLEDGE_GRAPH', 'INDEX_GRAPH']).optional().default('STANDARD'),
})

export async function createAuditJob(formData: FormData) {
    try {
        // Parse and validate input
        const projectId = formData.get('projectId') as string
        const queryPhrase = formData.get('queryPhrase') as string
        const modelsRaw = formData.get('models') as string
        const models = modelsRaw ? modelsRaw.split(',').filter(m => m.trim()) : []
        const jobType = (formData.get('jobType') as 'STANDARD' | 'KNOWLEDGE_GRAPH' | 'INDEX_GRAPH') || 'STANDARD'

        const validated = CreateAuditJobSchema.parse({
            projectId,
            queryPhrase,
            models,
            jobType,
        })

        const supabase = await createClient()

        // Get project details for brand aliases
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', validated.projectId)
            .single()

        if (projectError || !project) {
            return { success: false, error: 'Project not found' }
        }

        // Create the audit job in Supabase
        const { data: job, error: jobError } = await supabase
            .from('audit_jobs')
            .insert({
                project_id: validated.projectId,
                query_phrase: validated.queryPhrase,
                status: 'QUEUED',
                models_selected: validated.models,
                job_type: validated.jobType,
            })
            .select()
            .single()

        if (jobError || !job) {
            console.error('Failed to create job:', jobError)
            return { success: false, error: 'Failed to create audit job' }
        }

        // Push to Redis queue
        const payload = {
            job_id: job.id,
            project_id: project.id,
            query_phrase: validated.queryPhrase,
            brand_aliases: project.brand_aliases || [],
            primary_domain: project.primary_domain || '',
            models: validated.models,
            job_type: validated.jobType,
        }

        await pushToQueue(QUEUE_NAME, payload)

        // Revalidate the project page to show new job
        revalidatePath(`/project/${validated.projectId}`)

        return { success: true, jobId: job.id }

    } catch (error) {
        console.error('createAuditJob error:', error)

        if (error instanceof z.ZodError) {
            return { success: false, error: 'Invalid input: ' + error.issues[0].message }
        }

        return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
    }
}
