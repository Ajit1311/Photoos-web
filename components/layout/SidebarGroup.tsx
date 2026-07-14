type Props = {
  title: string;
  children: React.ReactNode;
};

export default function SidebarGroup({
  title,
  children,
}: Props) {
  return (
    <div className="mt-8">

      <p className="mb-3 px-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>

    </div>
  );
}