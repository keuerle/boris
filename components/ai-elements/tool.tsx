"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ChevronDownIcon,
  WrenchIcon,
  LoaderIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react";
import type { ComponentProps } from "react";
import { CodeBlock, CodeBlockCopyButton } from "./code-block";

export type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error";

export type ToolProps = ComponentProps<typeof Collapsible>;

export const Tool = ({ className, defaultOpen, ...props }: ToolProps) => {
  // Auto-open if state is output-available or output-error
  const shouldDefaultOpen = defaultOpen ?? false;

  return (
    <Collapsible
      className={cn("not-prose mb-4", className)}
      defaultOpen={shouldDefaultOpen}
      {...props}
    />
  );
};

export type ToolHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  type: string;
  state: ToolState;
};

export const ToolHeader = ({
  className,
  type,
  state,
  children,
  ...props
}: ToolHeaderProps) => {
  // Extract tool name from type (e.g., "tool-weather" -> "weather")
  const toolName = type.startsWith("tool-") ? type.slice(5) : type;

  // Get icon and badge based on state
  const { icon: Icon, badge, iconClass } = getStateDisplay(state);

  return (
    <CollapsibleTrigger
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-md border bg-muted/50 px-3 py-2 text-sm hover:bg-muted/80 transition-colors",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <div className="flex items-center gap-2">
            <Icon className={cn("h-4 w-4", iconClass)} />
            <span className="font-medium">{toolName.replace(/_/g, " ")}</span>
          </div>
          <div className="flex items-center gap-2">
            {badge}
            <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </div>
        </>
      )}
    </CollapsibleTrigger>
  );
};

export type ToolContentProps = ComponentProps<typeof CollapsibleContent>;

export const ToolContent = ({
  className,
  ...props
}: ToolContentProps) => (
  <CollapsibleContent
    className={cn(
      "mt-2 rounded-md border bg-background p-3",
      "data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-top-2 data-[state=open]:slide-in-from-top-2 outline-none data-[state=closed]:animate-out data-[state=open]:animate-in",
      className
    )}
    {...props}
  />
);

export type ToolInputProps = ComponentProps<"div"> & {
  input: unknown;
};

export const ToolInput = ({ className, input, ...props }: ToolInputProps) => {
  const formattedInput = JSON.stringify(input, null, 2);

  return (
    <div className={cn("space-y-2", className)} {...props}>
      <p className="text-xs font-semibold text-muted-foreground uppercase">
        Input
      </p>
      <CodeBlock code={formattedInput} language="json">
        <CodeBlockCopyButton />
      </CodeBlock>
    </div>
  );
};

export type ToolOutputProps = ComponentProps<"div"> & {
  output?: React.ReactNode;
  errorText?: string;
};

export const ToolOutput = ({
  className,
  output,
  errorText,
  ...props
}: ToolOutputProps) => {
  if (!output && !errorText) return null;

  return (
    <div className={cn("mt-3 space-y-2", className)} {...props}>
      <p className="text-xs font-semibold text-muted-foreground uppercase">
        {errorText ? "Error" : "Output"}
      </p>
      {errorText ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {errorText}
        </div>
      ) : typeof output === "string" || typeof output === "number" ? (
        <div className="rounded-md border bg-muted/50 p-3 text-sm">
          {String(output)}
        </div>
      ) : (
        <div className="text-sm">{output}</div>
      )}
    </div>
  );
};

// Helper function to get icon and badge based on state
function getStateDisplay(state: ToolState): {
  icon: typeof WrenchIcon;
  badge: React.ReactNode;
  iconClass: string;
} {
  switch (state) {
    case "input-streaming":
      return {
        icon: WrenchIcon,
        badge: (
          <Badge variant="secondary" className="gap-1">
            <LoaderIcon className="h-3 w-3 animate-spin" />
            Pending
          </Badge>
        ),
        iconClass: "text-muted-foreground",
      };
    case "input-available":
      return {
        icon: LoaderIcon,
        badge: (
          <Badge variant="default" className="gap-1">
            <LoaderIcon className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        ),
        iconClass: "text-primary animate-pulse",
      };
    case "output-available":
      return {
        icon: CheckCircleIcon,
        badge: (
          <Badge variant="secondary" className="gap-1">
            <CheckCircleIcon className="h-3 w-3" />
            Completed
          </Badge>
        ),
        iconClass: "text-green-600 dark:text-green-400",
      };
    case "output-error":
      return {
        icon: XCircleIcon,
        badge: (
          <Badge variant="destructive" className="gap-1">
            <XCircleIcon className="h-3 w-3" />
            Error
          </Badge>
        ),
        iconClass: "text-destructive",
      };
  }
}

