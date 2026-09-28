export function ComingSoon({ title, description }: { title: string; description?: string }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold mb-3">{title}</h1>
      <p className="text-foreground/60">{description ?? "This page is coming soon."}</p>
    </div>
  );
}
