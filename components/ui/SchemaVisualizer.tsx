"use client";

import React, { useState } from "react";
import { MdExpandMore, MdExpandLess, MdErrorOutline, MdWarningAmber } from "react-icons/md";

interface SchemaVisualizerProps {
  data: any;
  errors?: string[];
  warnings?: string[];
  title?: string;
  defaultExpanded?: boolean;
}

const SchemaItem = ({ label, value, depth = 0 }: { label: string; value: any; depth: number }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (value === null || value === undefined) return null;

  const isObject = typeof value === "object" && !Array.isArray(value);
  const isArray = Array.isArray(value);

  if (isObject || isArray) {
    const type = isObject ? value["@type"] : null;
    const name = isObject ? (value.name || value.serviceType) : null;

    return (
      <div className={`border-l-2 border-blue-500/20 ml-${depth > 0 ? 4 : 0} my-2`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center w-full px-3 py-2 text-left hover:bg-blue-600/5 transition-colors rounded-r-lg group"
        >
          <div className="flex-1 flex items-baseline gap-2 overflow-hidden">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] shrink-0">
              {label}
            </span>
            {type && (
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                {type}
              </span>
            )}
            {name && (
              <span className="text-[11px] text-[var(--text-muted)] truncate italic">
                {String(name)}
              </span>
            )}
          </div>
          {isExpanded ? (
            <MdExpandLess className="size-4 text-[var(--text-muted)] group-hover:text-blue-600" />
          ) : (
            <MdExpandMore className="size-4 text-[var(--text-muted)] group-hover:text-blue-600" />
          )}
        </button>

        {isExpanded && (
          <div className="pl-4 pb-2 space-y-1">
            {isObject
              ? Object.entries(value).map(([k, v]) => (
                  <SchemaItem key={k} label={k} value={v} depth={depth + 1} />
                ))
              : value.map((v: any, i: number) => (
                  <SchemaItem key={i} label={`${label} [${i + 1}]`} value={v} depth={depth + 1} />
                ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-baseline gap-4 px-3 py-1.5 hover:bg-[var(--surface-3)] transition-colors rounded-lg group">
      <span className="text-[10px] font-bold text-[var(--text-muted)] min-w-[100px] shrink-0 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xs font-medium text-[var(--text-foreground)] break-all">
        {String(value)}
      </span>
    </div>
  );
};

export default function SchemaVisualizer({
  data,
  errors = [],
  warnings = [],
  title,
  defaultExpanded = true,
}: SchemaVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const mainType = data?.["@type"] || "Thing";
  const numErrors = errors.length;
  // For now, let's treat some errors as warnings if they pattern match, 
  // or just use the props if passed. If no warnings passed, we skip.
  const numWarnings = warnings.length;

  return (
    <div className="bg-[var(--surface-2)]/30 rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm transition-all">
      <div 
        className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-[var(--surface-3)]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-black text-blue-600 dark:text-blue-400">
              {mainType}
            </h4>
            {title && (
              <span className="text-xs text-[var(--text-muted)] font-medium">
                — {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${numErrors > 0 ? "text-error" : "text-success"}`}>
                <MdErrorOutline className="size-3.5" />
                {numErrors} ERRORS
            </span>
            {numWarnings > 0 && (
                <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">
                    <MdWarningAmber className="size-3.5" />
                    {numWarnings} WARNINGS
                </span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <MdExpandLess className="size-6 text-[var(--text-muted)]" />
        ) : (
          <MdExpandMore className="size-6 text-[var(--text-muted)]" />
        )}
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="mt-4 space-y-1 p-2 bg-[var(--surface-1)] border border-[var(--border)] rounded-xl shadow-inner">
            {Object.entries(data).map(([k, v]) => (
              <SchemaItem key={k} label={k} value={v} depth={0} />
            ))}
          </div>

          {errors.length > 0 && (
            <div className="mt-6 space-y-3">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-error flex items-center gap-2">
                <MdErrorOutline className="size-4" /> Error Log
              </h5>
              <div className="space-y-2">
                {errors.map((err, i) => (
                  <div key={i} className="p-3 rounded-xl bg-error/5 border border-error/10 text-error text-[11px] font-bold">
                    {err}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
