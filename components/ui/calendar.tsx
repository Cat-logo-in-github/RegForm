"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months:
          "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 justify-center",
        month: "space-y-4",
        caption:
          "flex justify-center pt-1 relative items-center text-center mb-2",
        caption_label: "text-sm font-medium",
        nav: "absolute right-2 flex items-center space-x-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-70 hover:opacity-100 rounded-md"
        ),
        nav_button_previous: "absolute left-2",
        nav_button_next: "absolute right-2",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between",
        head_cell:
          "text-muted-foreground font-medium text-[0.8rem] text-center w-9",
        row: "flex w-full justify-between mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
          "[&:has([aria-selected])]:bg-accent/10",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 flex items-center justify-center p-0 font-normal text-sm rounded-md transition-colors " +
            "hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-offset-2 " +
            "aria-selected:bg-primary aria-selected:text-primary-foreground"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary focus:text-primary-foreground",
        day_today:
          "bg-accent text-accent-foreground font-semibold border border-primary/40",
        day_outside:
          "day-outside text-muted-foreground opacity-60 aria-selected:bg-accent/50",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({
          orientation,
          ...props
        }: {
          className?: string;
          size?: number;
          disabled?: boolean;
          orientation?: "left" | "right";
        }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="h-4 w-4" {...props} />;
        },
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
