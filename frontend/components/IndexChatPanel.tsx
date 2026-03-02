'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatResponse } from './ChatResponse'
import type { IndexAudit } from '@/lib/types'

interface IndexChatPanelProps {
    audit: IndexAudit
    onClose: () => void
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function IndexChatPanel({ audit, onClose }: IndexChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingSession, setIsLoadingSession] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [expiresAt, setExpiresAt] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Starter prompts based on audit data
    const starterPrompts = [
        audit.dominant_domain
            ? `Why is ${audit.dominant_domain} dominating my index?`
            : "What's my biggest AI visibility risk?",
        "Which gaps should I fix first?",
        audit.index_stability_score < 0.7
            ? "How do I improve my stability score?"
            : "What content should I publish next?",
        audit.conflicts.length > 0
            ? "How do I resolve these conflicts?"
            : "How can I increase my brand's AI presence?"
    ]

    // Load existing session on mount
    useEffect(() => {
        async function loadSession() {
            try {
                const response = await fetch(`${API_URL}/api/chat/sessions/${audit.id}`)
                if (response.ok) {
                    const data = await response.json()
                    if (data.exists && data.messages.length > 0) {
                        setMessages(data.messages)
                        setExpiresAt(data.expires_at)
                    }
                }
            } catch (err) {
                console.error('Failed to load chat session:', err)
            } finally {
                setIsLoadingSession(false)
            }
        }

        loadSession()
    }, [audit.id])

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const sendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        // Add user message
        const userMessage: Message = { role: 'user', content }
        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch(`${API_URL}/api/chat/index`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    index_audit_id: audit.id,
                    message: content
                })
            })

            if (!response.ok) {
                throw new Error('Failed to get response')
            }

            const data = await response.json()

            // Add assistant message
            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response
            }
            setMessages(prev => [...prev, assistantMessage])

        } catch (err) {
            setError('Failed to get a response. Please try again.')
            console.error('Chat error:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
    }

    const handleStarterClick = (prompt: string) => {
        sendMessage(prompt)
    }

    // Calculate time remaining
    const getTimeRemaining = () => {
        if (!expiresAt) return null
        const expires = new Date(expiresAt)
        const now = new Date()
        const hoursLeft = Math.max(0, Math.round((expires.getTime() - now.getTime()) / (1000 * 60 * 60)))
        if (hoursLeft === 0) return 'Expiring soon'
        if (hoursLeft === 1) return '1 hour left'
        return `${hoursLeft} hours left`
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex justify-end"
            >
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Panel */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="relative w-full max-w-lg h-full bg-surface-1 border-l border-border flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-surface-2">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <span>💬</span> Ask About This Index
                            </h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-text-muted">
                                    {audit.model} • Stability: {Math.round(audit.index_stability_score * 100)}%
                                </p>
                                {expiresAt && (
                                    <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {getTimeRemaining()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-text-muted hover:text-foreground"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {isLoadingSession ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        ) : messages.length === 0 ? (
                            // Show starter prompts when empty
                            <div className="space-y-4">
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                        <span className="text-3xl">🔍</span>
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-2">
                                        Ask anything about your AI Index
                                    </h3>
                                    <p className="text-sm text-text-muted max-w-sm mx-auto">
                                        Get actionable insights based on your audit data. I&apos;ll only answer using information from this snapshot.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs text-text-muted uppercase tracking-wider px-1">
                                        Suggested questions
                                    </p>
                                    {starterPrompts.map((prompt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleStarterClick(prompt)}
                                            className="w-full text-left p-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border hover:border-primary/30 transition-all text-sm text-text-subtle hover:text-foreground"
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // Show messages
                            <>
                                {/* Session restored indicator */}
                                {expiresAt && messages.length > 0 && (
                                    <div className="text-center py-2">
                                        <span className="text-xs text-text-muted bg-surface-2 px-3 py-1 rounded-full">
                                            Chat session restored
                                        </span>
                                    </div>
                                )}

                                {messages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                                ? 'bg-primary text-white'
                                                : 'bg-surface-2 border border-border'
                                                }`}
                                        >
                                            {msg.role === 'assistant' ? (
                                                <ChatResponse content={msg.content} />
                                            ) : (
                                                <p className="text-sm">{msg.content}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {/* Loading indicator */}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-surface-2 border border-border rounded-2xl px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                                <span className="text-sm text-text-muted">Analyzing index...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="px-4 py-2 bg-error/10 border-t border-error/20">
                            <p className="text-sm text-error">{error}</p>
                        </div>
                    )}

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-surface-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your AI visibility..."
                                disabled={isLoading || isLoadingSession}
                                className="flex-1 px-4 py-3 rounded-xl bg-surface-3 border border-border text-foreground placeholder:text-text-muted focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading || isLoadingSession}
                                className="px-4 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-text-muted mt-2 text-center">
                            Chat saved for 72 hours • Responses grounded in audit data
                        </p>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
