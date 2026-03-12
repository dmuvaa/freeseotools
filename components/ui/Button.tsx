import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary:
                "bg-accent-blue text-white hover:bg-[var(--accent-blue-muted)] hover:shadow-[var(--shadow-glow-blue)]",
            secondary:
                "bg-surface-2 text-foreground border border-border hover:bg-surface-3 hover:border-[var(--border-hover)]",
            ghost:
                "bg-transparent text-foreground-muted hover:bg-surface-2 hover:text-foreground",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2 text-sm",
            lg: "px-6 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
