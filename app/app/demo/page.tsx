import { redirect } from "next/navigation";

export default function DemoRedirectPage() {
  const demoUrl = process.env.DEMO_REDIRECT_URL;

  if (demoUrl) {
    redirect(demoUrl);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-center text-white">
      <div>
        <h1 className="text-xl font-semibold">Demo link is not configured</h1>
        <p className="mt-2 text-sm text-slate-400">
          Set the DEMO_REDIRECT_URL environment variable in Render.
        </p>
      </div>
    </main>
  );
}
