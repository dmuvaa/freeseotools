import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
                },
            },
        }
    )

    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getClaims() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const { data } = await supabase.auth.getClaims()

    const user = data?.claims
    const path = request.nextUrl.pathname

    // Public routes that don't need auth
    const isPublic =
        path === '/' ||
        path.startsWith('/login') ||
        path.startsWith('/auth') ||
        path.startsWith('/about') ||
        path.startsWith('/features') ||
        path.startsWith('/pricing') ||
        path.startsWith('/docs') ||
        path.startsWith('/blog') ||
        path.startsWith('/contact') ||
        path.startsWith('/terms') ||
        path.startsWith('/privacy')

    // Protected routes prefixes
    const isProtected =
        path.startsWith('/dashboard') ||
        path.startsWith('/project') ||
        path.startsWith('/job') ||
        path.startsWith('/chat') ||
        path.startsWith('/settings')

    // If user is not signed in and tries to access a protected route
    if (!user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // If user is signed in and tries to access login page
    if (user && path.startsWith('/login')) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
