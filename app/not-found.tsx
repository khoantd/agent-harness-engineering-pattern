import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="cover">
      <h1>Not found</h1>
      <p className="lede">That pattern or chapter is not in this field manual.</p>
      <p>
        <Link href="/">Return home</Link>
      </p>
    </section>
  );
}
