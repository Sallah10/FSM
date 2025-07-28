import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "circle";
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "animate-pulse bg-gray-200 dark:bg-gray-800", // Base styles
                    variant === "default" ? "rounded-md" : "rounded-full", // Variants
                    className // Custom classes
                )}
                {...props}
            />
        );
    }
);

Skeleton.displayName = "Skeleton";

export { Skeleton };