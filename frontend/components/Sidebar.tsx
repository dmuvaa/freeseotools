'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ActivityMonitor } from './ActivityMonitor'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { LogOut } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Projects', icon: FolderIcon },
    { href: '/dashboard/tracking', label: 'Tracking', icon: SatelliteIcon },
    { href: '/dashboard/content', label: 'Content Strategy', icon: FileTextIcon },
    { href: '/chat', label: 'GEO Chat', icon: ChatIcon },
    { href: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isSigningOut, setIsSigningOut] = useState(false)
    const [userProfile, setUserProfile] = useState<{
        full_name: string | null,
        email: string | null,
        plan_tier: string
    } | null>(null)

    useEffect(() => {
        const fetchUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                // Fetch profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('first_name, last_name, org_id')
                    .eq('id', user.id)
                    .maybeSingle()

                let planTier = 'free'

                // Fetch org subscription
                if (profile?.org_id) {
                    const { data: org } = await supabase
                        .from('organizations')
                        .select('plan_tier')
                        .eq('id', profile.org_id)
                        .maybeSingle()
                    if (org) planTier = org.plan_tier
                }

                const fullName = profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email?.split('@')[0]
                    : 'User'

                setUserProfile({
                    full_name: fullName || 'User',
                    email: user.email || '',
                    plan_tier: planTier
                })
            }
        }
        fetchUser()
    }, [])

    const handleSignOut = async () => {
        setIsSigningOut(true)
        const supabase = createClient()
        await supabase.auth.signOut()
        router.refresh()
        router.push('/login')
    }

    return (
        <aside className="w-64 h-screen fixed left-0 top-0 bg-surface-1 border-r border-border flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-bold text-lg">⚡</span>
                    </div>
                    <span className="text-xl font-bold gradient-text">BlitzGeo</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href)

                        const Icon = item.icon

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${isActive
                                            ? 'bg-primary-muted text-primary'
                                            : 'text-text-subtle hover:bg-surface-2 hover:text-foreground'}
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border space-y-4">


                {/* User Profile */}
                {userProfile && (
                    <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-2 transition-colors cursor-default">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {userProfile.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-medium text-foreground truncate">{userProfile.full_name}</p>
                            <p className="text-[10px] text-text-muted truncate">{userProfile.email}</p>
                        </div>
                    </div>
                )}

                <div className="px-4 py-3 rounded-xl bg-surface-2">
                    <p className="text-xs text-text-muted">Current Plan</p>
                    <p className="text-sm font-medium text-foreground capitalize">
                        {userProfile?.plan_tier || 'Free'} Tier
                    </p>
                </div>

                <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-text-subtle hover:text-error transition-colors w-full disabled:opacity-50"
                >
                    <LogOut className="w-5 h-5" />
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </button>
            </div>
        </aside>
    )
}

function FolderIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
        </svg>
    )
}

function ChatIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
    )
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072 1.076-.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    )
}

function SatelliteIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
    )
}

function FileTextIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zM12 2.25a.75.75 0 01.75.75v2.25a3 3 0 01-3 3H7.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75z" />
        </svg>
    )
}
