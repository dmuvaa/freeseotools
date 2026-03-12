'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type AuthMode = 'signin' | 'signup'
type SignInMethod = 'password' | 'magic'

export default function LoginPage() {
    // Mode State
    const [mode, setMode] = useState<AuthMode>('signin')
    const [signInMethod, setSignInMethod] = useState<SignInMethod>('password')

    // Form State
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')

    // UI State
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const router = useRouter()

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const supabase = createClient()

        // STRICT REGISTRATION: Collect Names + Password
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    full_name: `${firstName} ${lastName}`.trim(),
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({
                type: 'success',
                text: 'Account created! Please check your email to confirm your registration.'
            })
        }
        setIsLoading(false)
    }

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        const supabase = createClient()

        if (signInMethod === 'password') {
            // OPTION A: Password Login
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                setMessage({ type: 'error', text: 'Invalid email or password' })
                setIsLoading(false)
            } else {
                router.push('/dashboard')
                router.refresh()
            }
        } else {
            // OPTION B: Magic Link Login
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    // Prevent accidental account creation via Magic Link login
                    shouldCreateUser: false,
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })
            if (error) {
                setMessage({ type: 'error', text: error.message })
            } else {
                setMessage({
                    type: 'success',
                    text: `Magic link sent to ${email}. Check your inbox!`
                })
            }
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-white font-bold text-2xl">⚡</span>
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Free SEO Tools</h1>
                </div>

                {/* Main Card */}
                <div className="bg-surface-1 border border-border rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">

                    {/* Mode Tabs */}
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => { setMode('signin'); setMessage(null); }}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'signin'
                                    ? 'bg-surface-2 text-primary border-b-2 border-primary'
                                    : 'text-text-muted hover:text-foreground hover:bg-surface-2/50'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setMode('signup'); setMessage(null); }}
                            className={`flex-1 py-4 text-sm font-medium transition-colors ${mode === 'signup'
                                    ? 'bg-surface-2 text-primary border-b-2 border-primary'
                                    : 'text-text-muted hover:text-foreground hover:bg-surface-2/50'
                                }`}
                        >
                            Create Account
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="mb-6 text-center">
                            <h2 className="text-xl font-semibold text-foreground">
                                {mode === 'signin' ? 'Welcome Back' : 'Start Your Journey'}
                            </h2>
                            <p className="text-sm text-text-muted mt-2">
                                {mode === 'signin'
                                    ? 'Access the intelligence platform'
                                    : 'Create your account to get started'}
                            </p>
                        </div>

                        {message && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`mb-6 p-4 rounded-xl text-sm ${message.type === 'success'
                                        ? 'bg-success/10 text-success border border-success/20'
                                        : 'bg-error/10 text-error border border-error/20'
                                    }`}
                            >
                                {message.text}
                            </motion.div>
                        )}

                        <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">

                            {/* REGISTER FIELDS */}
                            {mode === 'signup' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none transition-all"
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
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* EMAIL (Always visible) */}
                            <div>
                                <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            {/* SIGN IN METHOD SELECTION */}
                            {mode === 'signin' && (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setSignInMethod('password')}
                                        className={`p-3 rounded-xl text-sm font-medium border transition-all ${signInMethod === 'password'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-surface-2 border-transparent text-text-muted hover:text-foreground'
                                            }`}
                                    >
                                        🔑 Password
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSignInMethod('magic')}
                                        className={`p-3 rounded-xl text-sm font-medium border transition-all ${signInMethod === 'magic'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-surface-2 border-transparent text-text-muted hover:text-foreground'
                                            }`}
                                    >
                                        ✨ Magic Link
                                    </button>
                                </div>
                            )}

                            {/* PASSWORD FIELD (Sign Up OR Sign In + Password) */}
                            {(mode === 'signup' || (mode === 'signin' && signInMethod === 'password')) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                >
                                    <label className="block text-xs font-medium text-text-muted uppercase tracking-wider mb-2">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full px-4 py-3 rounded-xl bg-surface-2 border border-border text-foreground focus:border-primary focus:outline-none transition-all"
                                    />
                                </motion.div>
                            )}

                            {/* SUBMIT BUTTON */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    mode === 'signup'
                                        ? 'Create Account'
                                        : signInMethod === 'password'
                                            ? 'Sign In with Password'
                                            : 'Send Login Link'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-border">
                            <p className="text-xs text-center text-text-muted">
                                By continuing, you agree to our{' '}
                                <a href="/terms" className="underline hover:text-foreground">Terms</a>
                                {' '}and{' '}
                                <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
