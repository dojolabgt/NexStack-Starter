import * as React from "react";
import { Input as UiInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Wrapper for Shadcn Input to enforce Premium styling
// Features: Rounded-xl, taller height (h-11), soft background, focus transitions

export type InputProps = React.ComponentProps<typeof UiInput>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, ...props }, ref) => {
        return (
            <UiInput
                ref={ref}
                className={cn(
                    "h-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 transition-all font-medium text-zinc-800 placeholder:text-gray-400",
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
