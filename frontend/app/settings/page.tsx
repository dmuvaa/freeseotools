'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

export default function SettingsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    // Form fields
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [orgName, setOrgName] = useState('')
    const [plan, setPlan] = useState('free')

    useEffect(() => {
        const getProfile = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUser(user)

                // Fetch profile and organization linked to it
                const { data: profile } = await supabase
                    .from('profiles')
                    .select(`
                        first_name, 
                        last_name,
                        organizations (
                            id,
                            name,
                            plan_tier
                        )
                    `)
                    .eq('id', user.id)
                    .maybeSingle()

                if (profile) {
                    setFirstName(profile.first_name || '')
                    setLastName(profile.last_name || '')

                    // Supabase returns an array for joins, or object if one-to-one?
                    // With foreign key it usually returns object if single relation, but usually array.
                    // profiles.org_id -> organizations.id is many-to-one (many profiles to one org).
                    // So fetching profile -> organizations gets ONE org.
                    const org = Array.isArray(profile.organizations) ? profile.organizations[0] : profile.organizations

                    if (org) {
                        setOrgName(org.name || '')
                        setPlan(org.plan_tier || 'free')
                    }
                }
            }
            setLoading(false)
        }
        getProfile()
    }, [])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setUpdating(true)
        setMessage(null)

        const supabase = createClient()

        // 1. Update Profile
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                first_name: firstName,
                last_name: lastName
            })
            .eq('id', user.id)

        if (profileError) {
            setMessage({ type: 'error', text: 'Failed to update user profile' })
            setUpdating(false)
            return
        }

        // 2. Update Organization Name (if changed)
        // Need to get org_id first or rely on RLS policy that allows updating OWN org?
        // My migration policy: "Owners can update their organization" using subquery on profiles.
        // So we can update organizations where id IN ...

        // However, from the client, easier if we have the ID.
        // I didn't store orgId in state, let's just do it via subquery logic or fetch it.
        // Actually, easier to just update profile for now. Updating Org name requires ensuring permission.

        // Fetch org id to be safe
        const { data: profile } = await supabase
            .from('profiles')
            .select('org_id')
            .eq('id', user.id)
            .single()

        if (profile?.org_id) {
            const { error: orgError } = await supabase
                .from('organizations')
                .update({ name: orgName })
                .eq('id', profile.org_id)

            if (orgError) console.error('Org update failed', orgError)
        }

        setMessage({ type: 'success', text: 'Settings saved successfully' })
        setUpdating(false)
    }

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />

            <main className="flex-1 ml-64 p-8">
                <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

                <div className="max-w-2xl space-y-8">
                    {/* Account Section */}
                    <section className="p-6 rounded-2xl bg-surface-2 border border-border">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Account Settings</h2>

                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-10 bg-surface-3 rounded w-full"></div>
                                <div className="h-10 bg-surface-3 rounded w-full"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="Jane"
                                            className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Doe"
                                            className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="text"
                                        value={user?.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-border text-text-muted cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                                        Organization Name
                                    </label>
                                    <input
                                        type="text"
                                        value={orgName}
                                        onChange={(e) => setOrgName(e.target.value)}
                                        placeholder="Acme Inc."
                                        className="w-full px-4 py-3 rounded-xl bg-surface-1 border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                                    />
                                    <p className="text-xs text-text-muted mt-2">
                                        Changing this updates the organization name for all members.
                                    </p>
                                </div>

                                {message && (
                                    <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                                        }`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="px-6 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors"
                                    >
                                        {updating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>

                    {/* Plan Section */}
                    <section className="p-6 rounded-2xl bg-surface-2 border border-border">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Current Plan</h2>

                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-2xl font-bold gradient-text capitalize">{plan} Tier</p>
                                <p className="text-sm text-text-muted mt-1">Basic brand monitoring</p>
                            </div>
                            <button className="px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors">
                                Upgrade
                            </button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-surface-3 text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {plan === 'free' ? '3' : plan === 'pro' ? '15' : '∞'}
                                </p>
                                <p className="text-xs text-text-muted">Projects</p>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-3 text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {plan === 'free' ? '10' : plan === 'pro' ? '500' : '∞'}
                                </p>
                                <p className="text-xs text-text-muted">Audits/mo</p>
                            </div>
                            <div className="p-4 rounded-xl bg-surface-3 text-center">
                                <p className="text-2xl font-bold text-foreground">
                                    {plan === 'free' ? '3' : 'All'}
                                </p>
                                <p className="text-xs text-text-muted">Models</p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}
