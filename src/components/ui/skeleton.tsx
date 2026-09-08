import { cn } from "@/lib/utils";

export const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("animate-pulse motion-reduce:animate-none rounded-md bg-wareongo-blue/10", className)}
    {...props}
  />
);
