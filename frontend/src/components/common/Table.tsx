import * as React from "react";
import {
    Table as UiTable,
    TableHeader as UiTableHeader,
    TableBody as UiBody,
    TableFooter as UiFooter,
    TableHead as UiHead,
    TableRow as UiRow,
    TableCell as UiCell,
    TableCaption as UiCaption,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// We wrap the Shadcn Table to enforce our "Premium" design system consistently.

const TableContainer = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/40 bg-white",
                className
            )}
            {...props}
        />
    )
);
TableContainer.displayName = "TableContainer";

const Table = React.forwardRef<HTMLTableElement, React.ComponentProps<typeof UiTable>>(
    ({ className, ...props }, ref) => (
        <div className="relative w-full overflow-x-auto">
            <UiTable ref={ref} className={cn("w-full", className)} {...props} />
        </div>
    )
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.ComponentProps<typeof UiTableHeader>>(
    ({ className, ...props }, ref) => (
        <UiTableHeader ref={ref} className={cn("bg-gray-50/30", className)} {...props} />
    )
);
TableHeader.displayName = "TableHeader";

const TableBody = UiBody;

const TableFooter = UiFooter;

const TableRow = React.forwardRef<HTMLTableRowElement, React.ComponentProps<typeof UiRow>>(
    ({ className, ...props }, ref) => (
        <UiRow
            ref={ref}
            className={cn(
                "border-b border-gray-50 hover:bg-gray-50/50 transition-colors data-[state=selected]:bg-gray-50",
                className
            )}
            {...props}
        />
    )
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ComponentProps<typeof UiHead>>(
    ({ className, ...props }, ref) => (
        <UiHead
            ref={ref}
            className={cn(
                "h-12 px-6 text-xs uppercase tracking-wider text-gray-500 font-semibold bg-transparent",
                className
            )}
            {...props}
        />
    )
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.ComponentProps<typeof UiCell>>(
    ({ className, ...props }, ref) => (
        <UiCell ref={ref} className={cn("p-4 px-6 align-middle", className)} {...props} />
    )
);
TableCell.displayName = "TableCell";

const TableCaption = UiCaption;

export {
    TableContainer,
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
};
