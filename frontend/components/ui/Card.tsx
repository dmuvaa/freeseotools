import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", hover = false, padding = "md", children, ...props }, ref) => {
        const baseStyles = "bg-surface-1 border border-border rounded-lg";

        const hoverStyles = hover
            ? "transition-all hover:border-[var(--border-hover)] hover:shadow-md cursor-pointer"
            : "";

        const paddings = {
            none: "",
            sm: "p-4",
            md: "p-6",
            lg: "p-8",
        };

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${hoverStyles} ${paddings[padding]} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

export default Card;
