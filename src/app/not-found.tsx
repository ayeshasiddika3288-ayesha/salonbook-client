import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-[#faf7f2]">
      <Navbar />

      <section className="flex flex-1 items-center justify-center px-5 py-20">
        <div className="w-full max-w-xl rounded-3xl border border-[#e9dfd4] bg-white p-8 text-center shadow-sm sm:p-12">
          <p className="text-7xl font-bold text-[#e8d7c0]">404</p>

          <h1 className="mt-4 text-3xl font-bold text-[#684329]">
            Page not found
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#766e67]">
            The page you are looking for may have been moved, deleted, or the
            link is incorrect.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#684329]"
            >
              Go Home
            </Link>

            <Link
              href="/services"
              className="rounded-full border border-[#d8c8b8] px-6 py-3 text-sm font-semibold text-[#684329] transition hover:bg-[#faf7f2]"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
