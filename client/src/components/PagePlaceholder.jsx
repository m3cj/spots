// Stand-in until each surface is built (Phase 4). Delete once every page is real.
export default function PagePlaceholder({ title, detail }) {
  return (
    <section className="mx-auto max-w-content px-edge py-10">
      <h1 className="font-handwritten text-display text-mithila-text">{title}</h1>
      {detail && <p className="mt-2 text-body text-mithila-textSecondary">{detail}</p>}
    </section>
  );
}
