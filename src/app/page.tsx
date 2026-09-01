import Link from 'next/link';

export default function Home() {
  return (
    <main
      id="main-content"
      className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-5 p-8 text-center"
    >
      <div className="inline-flex items-center text-[22px] leading-none font-extrabold tracking-tight">
        ada
        <span className="bg-ada-green ml-[3px] inline-block h-1.5 w-1.5 rounded-full" />
      </div>
      <h1 className="text-4xl leading-[1.05] font-extrabold tracking-tight">
        Find <span className="text-ada-green">Your Path</span>.
      </h1>
      <p className="text-ada-light-grey max-w-xs text-base leading-relaxed">
        A short quiz matching Year 10-11 students to Ada Manchester courses and T-Levels. No
        account, no time pressure.
      </p>
      <Link
        href="/q"
        className="bg-ada-green text-ada-black hover:bg-ada-green-dark focus-visible:ring-ada-green focus-visible:ring-offset-ada-black mt-2 min-h-[52px] w-full rounded-lg px-6 py-4 font-bold transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        Take the quiz
      </Link>
    </main>
  );
}
