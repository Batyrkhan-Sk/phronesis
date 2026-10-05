export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="pb-10 pt-12 sm:pt-16">
      {eyebrow && <div className="label mb-3">{eyebrow}</div>}
      <div className="flex flex-wrap items-end gap-6">
        <h1 className="min-w-0 flex-1 text-[44px] font-medium leading-[1.04] tracking-[-0.025em] sm:text-[64px]">{title}</h1>
        {actions}
      </div>
      {subtitle && <p className="mt-4 max-w-2xl text-[21px] italic leading-[1.45] text-ink-2">{subtitle}</p>}
    </header>
  );
}

export function SectionTitle({ title, action, numeral }: { title: string; action?: React.ReactNode; numeral?: string }) {
  return (
    <div className="mb-6 mt-20 flex items-baseline gap-4 border-b border-ink pb-3">
      {numeral && <span className="label">{numeral}</span>}
      <h2 className="flex-1 text-[28px] font-medium leading-tight tracking-[-0.01em]">{title}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="border-y border-rule py-16 text-center">
      <h3 className="text-[26px] font-medium">{title}</h3>
      {children && <div className="mx-auto mt-3 max-w-md text-[17px] italic leading-relaxed text-ink-2">{children}</div>}
    </div>
  );
}
