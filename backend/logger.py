"""
Structured Logging Module for BlitzGeo
Provides centralized logging with in-memory ring buffer for real-time streaming
"""
import asyncio
from collections import deque
from datetime import datetime
from typing import Literal, Optional, Any
from pydantic import BaseModel, Field
import json


# Log levels
LogLevel = Literal["DEBUG", "INFO", "WARN", "ERROR"]

# Component identifiers
Component = Literal["worker", "openrouter", "analyzer", "api", "supabase"]


class LogEntry(BaseModel):
    """Structured log entry"""
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: LogLevel
    component: str
    message: str
    metadata: dict = Field(default_factory=dict)
    
    def to_console(self) -> str:
        """Format for console output"""
        level_colors = {
            "DEBUG": "\033[90m",  # Gray
            "INFO": "\033[32m",   # Green
            "WARN": "\033[33m",   # Yellow
            "ERROR": "\033[31m",  # Red
        }
        reset = "\033[0m"
        color = level_colors.get(self.level, "")
        
        meta_str = ""
        if self.metadata:
            meta_str = f" | {json.dumps(self.metadata)}"
        
        return f"{color}[{self.timestamp.strftime('%H:%M:%S')}] [{self.level:5}] [{self.component:10}] {self.message}{meta_str}{reset}"
    
    def to_sse(self) -> str:
        """Format for SSE streaming"""
        return json.dumps({
            "timestamp": self.timestamp.isoformat(),
            "level": self.level,
            "component": self.component,
            "message": self.message,
            "metadata": self.metadata
        })


class LogBuffer:
    """Thread-safe ring buffer for log entries"""
    
    def __init__(self, maxlen: int = 500):
        self._buffer: deque[LogEntry] = deque(maxlen=maxlen)
        self._subscribers: list[asyncio.Queue] = []
        self._lock = asyncio.Lock()
    
    async def add(self, entry: LogEntry):
        """Add a log entry and notify subscribers"""
        async with self._lock:
            self._buffer.append(entry)
            
            # Notify all subscribers
            dead_subscribers = []
            for queue in self._subscribers:
                try:
                    queue.put_nowait(entry)
                except asyncio.QueueFull:
                    dead_subscribers.append(queue)
            
            # Remove dead subscribers
            for queue in dead_subscribers:
                self._subscribers.remove(queue)
    
    def add_sync(self, entry: LogEntry):
        """Synchronous add for non-async contexts"""
        self._buffer.append(entry)
        print(entry.to_console())
    
    async def subscribe(self) -> asyncio.Queue:
        """Subscribe to log updates"""
        queue: asyncio.Queue = asyncio.Queue(maxsize=100)
        async with self._lock:
            self._subscribers.append(queue)
        return queue
    
    async def unsubscribe(self, queue: asyncio.Queue):
        """Unsubscribe from log updates"""
        async with self._lock:
            if queue in self._subscribers:
                self._subscribers.remove(queue)
    
    def get_recent(self, count: int = 50) -> list[LogEntry]:
        """Get most recent log entries"""
        return list(self._buffer)[-count:]
    
    def get_by_level(self, level: LogLevel, count: int = 50) -> list[LogEntry]:
        """Get entries filtered by level"""
        return [e for e in self._buffer if e.level == level][-count:]
    
    def get_by_component(self, component: str, count: int = 50) -> list[LogEntry]:
        """Get entries filtered by component"""
        return [e for e in self._buffer if e.component == component][-count:]


# Global log buffer instance
log_buffer = LogBuffer(maxlen=500)


def _log(level: LogLevel, component: str, message: str, metadata: Optional[dict] = None):
    """Internal log function"""
    entry = LogEntry(
        level=level,
        component=component,
        message=message,
        metadata=metadata or {}
    )
    
    # Print to console
    print(entry.to_console())
    
    # Add to buffer (sync for now, async contexts should use log_async)
    log_buffer.add_sync(entry)
    
    return entry


async def _log_async(level: LogLevel, component: str, message: str, metadata: Optional[dict] = None):
    """Async internal log function"""
    entry = LogEntry(
        level=level,
        component=component,
        message=message,
        metadata=metadata or {}
    )
    
    # Print to console
    print(entry.to_console())
    
    # Add to buffer
    await log_buffer.add(entry)
    
    return entry


# Convenience functions
def log_debug(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log a debug message"""
    return _log("DEBUG", component, message, metadata)


def log_info(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log an info message"""
    return _log("INFO", component, message, metadata)


def log_warn(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log a warning message"""
    return _log("WARN", component, message, metadata)


def log_error(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log an error message"""
    return _log("ERROR", component, message, metadata)


# Async versions
async def log_debug_async(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log a debug message (async)"""
    return await _log_async("DEBUG", component, message, metadata)


async def log_info_async(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log an info message (async)"""
    return await _log_async("INFO", component, message, metadata)


async def log_warn_async(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log a warning message (async)"""
    return await _log_async("WARN", component, message, metadata)


async def log_error_async(component: str, message: str, metadata: Optional[dict] = None) -> LogEntry:
    """Log an error message (async)"""
    return await _log_async("ERROR", component, message, metadata)
