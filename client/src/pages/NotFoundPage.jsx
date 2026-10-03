import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-dvh max-w-content flex-col items-center justify-center px-edge text-center">
      <h1 className="font-handwritten text-display text-mithila-text">Page not found</h1>
      <p className="mt-2 text-body text-mithila-textSecondary">
        We could not find what you were looking for.
      </p>
      <Link
        to="/"
        className="press mt-6 inline-flex min-h-[44px] items-center justify-center rounded-pill border border-mithila-border px-6 text-button text-mithila-text"
      >
        Back to the map
      </Link>
    </section>
  );
}
