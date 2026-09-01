import Link from 'next/link';

export default function Home() {
  return (
    <main
      id="main-content"
      className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center"
    >
      <h1 className="text-3xl font-bold">Ada Course Finder</h1>
      <p className="max-w-md text-neutral-600 dark:text-neutral-400">
        Find Your Path — a short quiz matching Year 10-11 students to Ada courses and T-Levels. No
        account needed.
      </p>
      <Link
        href="/q"
        className="rounded-lg bg-neutral-900 px-6 py-3 font-semibold text-white focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-neutral-100 dark:text-neutral-900"
      >
        Take the quiz
      </Link>
    </main>
  );
}
