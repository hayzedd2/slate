import type { ReactNode } from "react";

type Props = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Section({ title, action, children, className = "" }: Props) {
  return (
    <section className={`space-y-3 ${className}`}>
      <div className="flex min-h-5 items-center justify-between gap-3">
        <h3 className="text-[9.5px] font-semibold uppercase tracking-[0.16em] text-white/35">
          {title}
        </h3>
        {action}
      </div>
      <div className="space-y-3.5">{children}</div>
    </section>
  );
}
