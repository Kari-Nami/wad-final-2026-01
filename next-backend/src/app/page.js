export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">
          CourseSpace
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Backend API is running
        </h1>
        <p className="mt-4 text-slate-500">
          This Next.js application provides authentication, course management,
          and enrollment APIs for the React frontend.
        </p>
      </section>
    </main>
  );
}
