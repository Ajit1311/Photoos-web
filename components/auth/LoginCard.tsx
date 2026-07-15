import { ReactNode } from "react";

type LoginCardProps = {
  children: ReactNode;
};

export function LoginCard({
  children,
}: LoginCardProps) {
  return (
    <div
      className="
        w-full
        max-w-md
        rounded-3xl
        border
        border-border/50
        bg-background/80
        p-8
        shadow-2xl
        backdrop-blur-xl
      "
    >
      {children}
    </div>
  );
}