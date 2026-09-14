import { cn } from "@/lib/utils";

export function StatPill({
  label,
  value,
  mono = true,
  className,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn("text-[13px] text-foreground/90", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}
