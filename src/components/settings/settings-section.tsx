type SettingsSectionProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

/** One box on the Settings page with a title and a short explanation. */
export function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 md:p-6">
      <h2 className="font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5">{children}</div>
    </section>
  );
}