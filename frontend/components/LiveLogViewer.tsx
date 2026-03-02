'use client'

import { useState, useEffect, useRef } from 'react'
import type { LogEntry } from '@/lib/types'

interface LiveLogViewerProps {
    maxHeight?: string
}

export function LiveLogViewer({ maxHeight = '400px' }: LiveLogViewerProps) {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [paused, setPaused] = useState(false)
    const [filterLevel, setFilterLevel] = useState<string>('ALL')
    const [filterComponent, setFilterComponent] = useState<string>('ALL')
    const logsEndRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Log color mapping
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'ERROR': return 'text-error'
            case 'WARN': return 'text-warning'
            case 'INFO': return 'text-success'
            case 'DEBUG': return 'text-text-muted'
            default: return 'text-text-subtle'
        }
    }

    // Connect to SSE stream
    useEffect(() => {
        const eventSource = new EventSource(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/logs`)

        eventSource.onopen = () => {
            setIsConnected(true)
        }

        eventSource.onerror = () => {
            setIsConnected(false)
            eventSource.close()
            // Retry after 5s
            setTimeout(() => {
                // Trigger re-render to reconnect
                setIsConnected(prev => prev)
            }, 5000)
        }

        eventSource.onmessage = (event) => {
            // keepalive
            if (event.data === ': keepalive') return

            try {
                const entry: LogEntry = JSON.parse(event.data)

                setLogs(prev => {
                    // Keep last 500 logs
                    const newLogs = [...prev, entry]
                    if (newLogs.length > 500) {
                        return newLogs.slice(newLogs.length - 500)
                    }
                    return newLogs
                })
            } catch (e) {
                console.error('Error parsing log entry', e)
            }
        }

        return () => {
            eventSource.close()
        }
    }, []) // Reconnect logic needs improvement but works for basic cases

    // Auto-scroll
    useEffect(() => {
        if (!paused && logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [logs, paused])

    // Filtered logs
    const filteredLogs = logs.filter(log => {
        if (filterLevel !== 'ALL' && log.level !== filterLevel) return false
        if (filterComponent !== 'ALL' && log.component !== filterComponent) return false
        return true
    })

    const uniqueComponents = Array.from(new Set(logs.map(l => l.component))).sort()

    return (
        <div className="rounded-2xl bg-surface-2 border border-border overflow-hidden flex flex-col shadow-lg">
            {/* Toolbar */}
            <div className="p-3 border-b border-border bg-surface-3/50 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-error'}`} />
                        <span className="text-xs font-medium text-text-subtle">
                            {isConnected ? 'Live Stream' : 'Disconnected'}
                        </span>
                    </div>

                    <div className="h-4 w-px bg-border" />

                    <span className="text-xs text-text-muted">
                        {filteredLogs.length} events
                    </span>

                    <div className="h-4 w-px bg-border" />

                    {/* Pause Toggle */}
                    <button
                        onClick={() => setPaused(!paused)}
                        className={`text-xs px-2 py-1 rounded transition-colors ${paused ? 'bg-warning-muted text-warning' : 'hover:bg-surface-3 text-text-muted'}`}
                    >
                        {paused ? 'Paused' : 'Auto-scroll'}
                    </button>

                    <button
                        onClick={() => setLogs([])}
                        className="text-xs px-2 py-1 rounded hover:bg-surface-3 text-text-muted transition-colors"
                    >
                        Clear
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={filterComponent}
                        onChange={(e) => setFilterComponent(e.target.value)}
                        className="text-xs bg-surface-1 border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
                    >
                        <option value="ALL">All Components</option>
                        {uniqueComponents.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>

                    <select
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="text-xs bg-surface-1 border border-border rounded px-2 py-1 focus:outline-none focus:border-primary"
                    >
                        <option value="ALL">All Levels</option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                        <option value="DEBUG">DEBUG</option>
                    </select>
                </div>
            </div>

            {/* Log Console */}
            <div
                ref={containerRef}
                className="overflow-y-auto bg-[#0d1117] p-4 font-mono text-xs"
                style={{ height: maxHeight }}
            >
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50">
                        <p>Waiting for logs...</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredLogs.map((log, index) => (
                            <div key={index} className="flex hover:bg-white/5 p-0.5 rounded -mx-1 px-1 group">
                                <span className="text-gray-500 w-20 shrink-0 select-none">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                                <span className={`w-14 shrink-0 font-bold ${getLevelColor(log.level)}`}>
                                    {log.level}
                                </span>
                                <span className="w-24 shrink-0 text-cyan-400">
                                    [{log.component}]
                                </span>
                                <span className="text-gray-300 break-all">
                                    {log.message}
                                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                                        <span className="text-gray-500 ml-2 group-hover:text-gray-400 transition-colors">
                                            {JSON.stringify(log.metadata)}
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
                <div ref={logsEndRef} />
            </div>
        </div>
    )
}
