import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return <div className={cn("mx-auto w-full max-w-[1500px] px-4 sm:px-5 lg:px-6", className)}>{children}</div>;
}
