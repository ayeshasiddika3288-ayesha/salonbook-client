import Link from "next/link";

export default function Footer() {
  return (
    <footer id="contact" className="mt-auto bg-[#29231f] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Salon<span className="text-[#c6a36b]">Book.</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-[#c7bbb0]">
            Your beauty, our passion. Discover salon services and enjoy a
            simpler way to manage your appointments.
          </p>
          <div className="mt-5 flex gap-4 text-sm text-[#c7bbb0]">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Facebook
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Instagram
            </a>
            <a
              href="https://www.tiktok.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              TikTok
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3 text-sm text-[#c7bbb0]">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/services" className="hover:text-white">
              Browse Services
            </Link>
            <Link href="/auth/login" className="hover:text-white">
              Login
            </Link>
            <Link href="/auth/register" className="hover:text-white">
              Register
            </Link>
          </div>
        </div>

        <div>
          <h3 className="font-semibold">Salon Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-[#c7bbb0]">
            <p>Email: support@salonbook.com</p>
            <p>Phone: +880 1700 000000</p>
            <p>House 12, Road 5, Dhanmondi, Dhaka 1205</p>
            <p>Sat – Thu: 9:00 AM – 8:00 PM</p>
            <p>Friday: Closed</p>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-[#c7bbb0]">
        © 2026 SalonBook. All rights reserved.
      </div>
    </footer>
  );
}
