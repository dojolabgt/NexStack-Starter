import * as React from "react";
import {
    Select as UiSelect,
    SelectGroup,
    SelectValue,
    SelectTrigger as UiSelectTrigger,
    SelectContent as UiSelectContent,
    SelectLabel,
    SelectItem as UiSelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Wrapper for Shadcn Select to enforce Premium styling

const Select = UiSelect;
const SelectGroupCommon = SelectGroup;
const SelectValueCommon = SelectValue;

const SelectTrigger = React.forwardRef<
    React.ElementRef<typeof UiSelectTrigger>,
    React.ComponentPropsWithoutRef<typeof UiSelectTrigger>
>(({ className, children, ...props }, ref) => (
    <UiSelectTrigger
        ref={ref}
        className={cn(
            "h-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-indigo-500 transition-all font-medium text-zinc-800",
            className
        )}
        {...props}
    >
        {children}
    </UiSelectTrigger>
));
SelectTrigger.displayName = UiSelectTrigger.displayName;

const SelectContent = React.forwardRef<
    React.ElementRef<typeof UiSelectContent>,
    React.ComponentPropsWithoutRef<typeof UiSelectContent>
>(({ className, children, position = "popper", ...props }, ref) => (
    <UiSelectContent
        ref={ref}
        className={cn(
            "rounded-xl border-gray-100 shadow-xl bg-white",
            className
        )}
        position={position}
        {...props}
    >
        {children}
    </UiSelectContent>
));
SelectContent.displayName = UiSelectContent.displayName;

const SelectItem = React.forwardRef<
    React.ElementRef<typeof UiSelectItem>,
    React.ComponentPropsWithoutRef<typeof UiSelectItem>
>(({ className, children, ...props }, ref) => (
    <UiSelectItem
        ref={ref}
        className={cn("cursor-pointer focus:bg-indigo-50 focus:text-indigo-900 rounded-lg my-0.5", className)}
        {...props}
    >
        {children}
    </UiSelectItem>
));
SelectItem.displayName = UiSelectItem.displayName;

export {
    Select,
    SelectGroupCommon as SelectGroup,
    SelectValueCommon as SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
    SelectScrollUpButton,
    SelectScrollDownButton,
};
