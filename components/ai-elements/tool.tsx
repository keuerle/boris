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
  return (
    <Collapsible
      className={cn("not-prose mb-4", className)}
      defaultOpen={defaultOpen ?? false}
      {...props}
    />
  );
};

export type ToolHeaderProps = ComponentProps<typeof CollapsibleTrigger> & {
  state: ToolState;
  customDescriptions?: {
    workingDescription?: string;
    completedDescription?: string;
    errorDescription?: string;
  };
};

export const ToolHeader = ({
  className,
  state,
  customDescriptions,
  children,
  ...props
}: ToolHeaderProps) => {
  // Get badge based on state
  const { badge } = getStateDisplay(state, customDescriptions);

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
            {badge}
          </div>
          <div className="flex items-center gap-2">
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

const renderOutput = (output: unknown): React.ReactNode => {
  if (typeof output === "string" || typeof output === "number") {
    return (
      <CodeBlock code={String(output)} language="text">
        <CodeBlockCopyButton />
      </CodeBlock>
    );
  }
  
  if (typeof output === "object" && output !== null) {
    try {
      const serialized = JSON.stringify(output, null, 2);
      return (
        <CodeBlock code={serialized} language="json">
          <CodeBlockCopyButton />
        </CodeBlock>
      );
    } catch {
      // If JSON.stringify fails, render the object directly as React content
      // This handles objects with symbols, functions, or circular references
      return <div className="text-sm">{output as React.ReactNode}</div>;
    }
  }
  
  // For other types (boolean, undefined, etc.), render directly
  return <div className="text-sm">{output as React.ReactNode}</div>;
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
        <CodeBlock code={errorText} language="text">
          <CodeBlockCopyButton />
        </CodeBlock>
      ) : (
        renderOutput(output)
      )}
    </div>
  );
};

// Helper function to get icon and badge based on state
function getStateDisplay(
  state: ToolState, 
  customDescriptions?: {
    workingDescription?: string;
    completedDescription?: string;
    errorDescription?: string;
  }
): {
  icon: typeof WrenchIcon;
  badge: React.ReactNode;
  iconClass: string;
} {
  const createBadge = (Icon: typeof LoaderIcon, text: string, iconClass?: string) => (
    <p className="gap-2 flex items-center">
      <Icon className={cn("h-3 w-3", iconClass)} />
      {text}
    </p>
  );

  switch (state) {
    case "input-streaming":
      return {
        icon: WrenchIcon,
        badge: createBadge(LoaderIcon, customDescriptions?.workingDescription || "Pending", "animate-spin"),
        iconClass: "text-muted-foreground",
      };
    case "input-available":
      return {
        icon: LoaderIcon,
        badge: createBadge(LoaderIcon, customDescriptions?.workingDescription || "Running", "animate-spin"),
        iconClass: "text-primary animate-pulse",
      };
    case "output-available":
      return {
        icon: CheckCircleIcon,
        badge: createBadge(CheckCircleIcon, customDescriptions?.completedDescription || "Completed"),
        iconClass: "text-green-600 dark:text-green-400",
      };
    case "output-error":
      return {
        icon: XCircleIcon,
        badge: createBadge(XCircleIcon, customDescriptions?.errorDescription || "Error"),
        iconClass: "text-destructive",
      };
  }
}

