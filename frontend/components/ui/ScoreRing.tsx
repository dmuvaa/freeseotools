interface ScoreRingProps {
    score: number;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    label?: string;
}

export default function ScoreRing({
    score,
    size = "md",
    showLabel = true,
    label = "Score",
}: ScoreRingProps) {
    // Clamp score between 0 and 100
    const clampedScore = Math.min(100, Math.max(0, score));

    // Calculate stroke properties
    const sizes = {
        sm: { width: 80, strokeWidth: 6, fontSize: "text-lg" },
        md: { width: 120, strokeWidth: 8, fontSize: "text-2xl" },
        lg: { width: 160, strokeWidth: 10, fontSize: "text-4xl" },
    };

    const { width, strokeWidth, fontSize } = sizes[size];
    const radius = (width - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

    // Determine color based on score
    const getColor = () => {
        if (clampedScore >= 80) return "var(--success)";
        if (clampedScore >= 50) return "var(--warning)";
        return "var(--error)";
    };

    const getGlowColor = () => {
        if (clampedScore >= 80) return "var(--success-muted)";
        if (clampedScore >= 50) return "var(--warning-muted)";
        return "var(--error-muted)";
    };

    return (
        <div className="relative inline-flex flex-col items-center">
            <svg
                width={width}
                height={width}
                className="transform -rotate-90"
                style={{
                    filter: `drop-shadow(0 0 10px ${getGlowColor()})`,
                }}
            >
                {/* Background circle */}
                <circle
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                    fill="none"
                    stroke="var(--surface-2)"
                    strokeWidth={strokeWidth}
                />
                {/* Progress circle */}
                <circle
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`${fontSize} font-bold`} style={{ color: getColor() }}>
                    {clampedScore}
                </span>
                {showLabel && (
                    <span className="text-xs text-[var(--text-subtle)] uppercase tracking-wider">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}
