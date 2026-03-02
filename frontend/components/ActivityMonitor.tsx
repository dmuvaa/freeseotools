'use client'

import { useState, useEffect, useRef } from 'react'
import type { SystemStatus, LogEntry } from '@/lib/types'

export function ActivityMonitor() {
    const [status, setStatus] = useState<SystemStatus | null>(null)
    const [recentLogs, setRecentLogs] = useState<LogEntry[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [backendAvailable, setBackendAvailable] = useState(true)
    const failCountRef = useRef(0)

    // Unified polling logic
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        let isMounted = true;

        const fetchData = async () => {
            // Don't poll if tab is hidden
            if (document.hidden) {
                timeoutId = setTimeout(fetchData, 5000);
                return;
            }

            try {
                // Parallel fetch for efficiency
                const [statusRes, logsRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/status`),
                    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/logs/recent?count=5`)
                ]);

                if (isMounted) {
                    if (statusRes.ok) {
                        const statusData = await statusRes.json();
                        setStatus(statusData);
                        setBackendAvailable(true);
                        setIsConnected(true);
                    } else {
                        setBackendAvailable(false);
                        setIsConnected(false);
                    }

                    if (logsRes.ok) {
                        const logsData = await logsRes.json();
                        setRecentLogs(logsData.logs);
                    }
                }
            } catch (error) {
                if (isMounted) {
                    setBackendAvailable(false);
                    setIsConnected(false);
                }
            }

            // Poll every 10 seconds normally, or 30s if offline/error to save resources
            const nextInterval = backendAvailable ? 10000 : 30000;
            if (isMounted) {
                timeoutId = setTimeout(fetchData, nextInterval);
            }
        };

        fetchData();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [backendAvailable]);

    // Show offline state when backend unavailable
    if (!backendAvailable) return (
        <div className="p-4 rounded-xl bg-surface-2 border border-border">
            <div className="flex items-center gap-2 text-text-muted text-sm">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                Backend Offline
            </div>
            <p className="text-xs text-text-muted mt-2">Start the backend to see system status</p>
        </div>
    )

    if (!status) return (
        <div className="p-4 rounded-xl bg-surface-2 animate-pulse">
            <div className="h-4 bg-surface-3 rounded w-2/3 mb-3"></div>
            <div className="h-12 bg-surface-3 rounded mb-3"></div>
            <div className="h-20 bg-surface-3 rounded"></div>
        </div>
    )

    return (
        <div className="rounded-xl bg-surface-2 border border-border overflow-hidden text-sm">
            {/* Header / Status */}
            <div className="p-3 border-b border-border bg-surface-3/30">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground">System Status</span>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${isConnected ? 'bg-success-muted text-success' : 'bg-error-muted text-error'
                        }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                        {isConnected ? 'Online' : 'Offline'}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-surface-1">
                        <span className="text-text-muted block mb-0.5">Worker</span>
                        <span className={`font-medium ${status.worker_active ? 'text-success' : 'text-warning'}`}>
                            {status.worker_active ? 'Active' : 'Idle'}
                        </span>
                    </div>
                    <div className="p-2 rounded-lg bg-surface-1">
                        <span className="text-text-muted block mb-0.5">Queue</span>
                        <span className={`font-medium ${status.queue_depth > 0 ? 'text-accent' : 'text-text-subtle'}`}>
                            {status.queue_depth} jobs
                        </span>
                    </div>
                </div>
            </div>

            {/* Recent Logs (Mini) */}
            <div className="p-3 bg-black/5">
                <p className="text-xs font-medium text-text-muted mb-2">Recent Activity</p>
                <div className="space-y-1.5 font-mono text-[10px]">
                    {recentLogs.length === 0 ? (
                        <p className="text-text-muted italic">No recent logs</p>
                    ) : (
                        recentLogs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                                <span className={`shrink-0 ${log.level === 'ERROR' ? 'text-error' :
                                    log.level === 'WARN' ? 'text-warning' :
                                        log.level === 'INFO' ? 'text-success' :
                                            'text-text-muted'
                                    }`}>
                                    {log.level[0]}
                                </span>
                                <span className="text-text-subtle truncate">
                                    {log.message}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="p-2 text-[10px] text-text-muted bg-surface-1 border-t border-border flex justify-between">
                <span>Conn: {status.redis_connected ? 'OK' : 'ERR'}</span>
                <span>Up: {Math.floor(status.uptime_seconds / 60)}m</span>
            </div>
        </div>
    )
}
