"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
}

const benefits = [
  {
    number: "01",
    title: "Easy Online Booking",
    description:
      "Choose your preferred service, date and time without waiting in a queue.",
  },
  {
    number: "02",
    title: "Professional Services",
    description:
      "Explore salon services designed to make your beauty experience special.",
  },
  {
    number: "03",
    title: "Manage Appointments",
    description:
      "Keep track of your bookings and appointment status from your dashboard.",
  },
];

const categoryIcons: Record<string, string> = {
  hair: "✂️",
  color: "🎨",
  treatment: "🧴",
  facial: "🧖",
  skin: "✨",
  makeup: "💄",
  nail: "💅",
  manicure: "💅",
  pedicure: "💅",
  spa: "🌿",
  massage: "🌿",
};

const iconFor = (categoryName: string) => {
  const normalized = categoryName.toLowerCase();

  for (const [keyword, icon] of Object.entries(categoryIcons)) {
    if (normalized.includes(keyword)) {
      return icon;
    }
  }

  return "💫";
};

const formatPrice = (price: number) =>
  `৳${price.toLocaleString("en-BD")}`;

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        if (!API_URL) {
          throw new Error("API URL is not configured.");
        }

        const response = await fetch(`${API_URL}/api/services`, {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to load services.");
        }

        setServices(result.data || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load salon services right now."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [reloadKey]);

  const featuredServices = useMemo(
    () => services.slice(0, 6),
    [services]
  );

  const categories = useMemo(() => {
    const counts = new Map<string, number>();

    services.forEach((service) => {
      if (!service.category) return;
      counts.set(
        service.category,
        (counts.get(service.category) || 0) + 1
      );
    });

    return Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
    }));
  }, [services]);

  return (
    <main className="flex-1">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#eee5da]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24 lg:px-8">
          <div className="relative z-10">
            <p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-[#8b5e3c]">
              Your Beauty, Our Passion
            </p>

            <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-[#29231f] sm:text-5xl lg:text-6xl">
              Beauty begins with
              <span className="block font-serif italic text-[#8b5e3c]">
                a little self-care.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-[#766e67]">
              Take a moment for yourself. Discover professional salon services
              and book your next beauty appointment with ease.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                href="/services"
                className="rounded-full bg-[#8b5e3c] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#8b5e3c]/15 transition hover:-translate-y-0.5 hover:bg-[#684329]"
              >
                Explore Salon Services →
              </Link>
              <a
                href="#about"
                className="rounded-full border border-[#bda991] px-7 py-3.5 text-sm font-semibold text-[#684329] transition hover:bg-white/60"
              >
                Discover More
              </a>
            </div>

            <div className="mt-12 flex flex-wrap gap-8 border-t border-[#d9cabb] pt-7">
              <div>
                <p className="text-2xl font-bold text-[#684329]">Easy</p>
                <p className="mt-1 text-xs text-[#766e67]">Online Booking</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#684329]">Flexible</p>
                <p className="mt-1 text-xs text-[#766e67]">
                  Appointment Slots
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#684329]">Secure</p>
                <p className="mt-1 text-xs text-[#766e67]">Online Payment</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -right-5 -top-5 h-40 w-40 rounded-full bg-[#c6a36b]/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[45%_45%_12px_12px] border-[10px] border-white/70 shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1000&q=90"
                alt="Elegant salon interior"
                className="h-[430px] w-full object-cover sm:h-[520px]"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 rounded-2xl bg-white p-5 shadow-xl sm:-left-8">
              <p className="text-xs font-medium uppercase tracking-wider text-[#8b5e3c]">
                Make time for you
              </p>
              <p className="mt-1 font-serif text-xl text-[#29231f]">
                Feel beautiful. Feel confident.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="bg-[#f1ebe3] py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a17a50]">
              A Little Something for You
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#29231f] sm:text-4xl">
              Featured Salon Services
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#766e67]">
              Discover some of the services available at SalonBook and find
              the perfect treatment for your next visit.
            </p>
          </div>

          {loading && (
            <div className="py-16 text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e5dbcf] border-t-[#8b5e3c]" />
              <p className="mt-4 text-sm text-[#766e67]">
                Loading featured services...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
              <h3 className="text-xl font-semibold text-red-700">
                Unable to load services
              </h3>
              <p className="mt-2 text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="mt-5 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#684329]"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && featuredServices.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white px-5 py-16 text-center">
              <p className="text-lg font-semibold text-[#29231f]">
                No services available yet
              </p>
              <p className="mt-2 text-sm text-[#766e67]">
                Please check back soon for new salon services.
              </p>
            </div>
          )}

          {!loading && !error && featuredServices.length > 0 && (
            <>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {featuredServices.map((service) => (
                  <article
                    key={service._id}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#a17a50]">
                        {service.category}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-[#29231f]">
                        {service.serviceName}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#766e67]">
                        {service.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-[#eee5da] pt-4">
                        <span className="text-sm text-[#766e67]">
                          {service.duration} minutes
                        </span>
                        <span className="text-lg font-bold text-[#8b5e3c]">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                      <Link
                        href={`/services/${service._id}`}
                        className="mt-5 block rounded-full border border-[#8b5e3c] py-3 text-center text-sm font-semibold text-[#8b5e3c] transition hover:bg-[#8b5e3c] hover:text-white"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-10 text-center">
                <Link
                  href="/services"
                  className="inline-block rounded-full bg-[#8b5e3c] px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-[#684329]"
                >
                  View All Services →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a17a50]">
              Explore Our World
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-[#29231f] sm:text-4xl">
              Browse by Category
            </h2>
          </div>
          <Link
            href="/services"
            className="text-sm font-semibold text-[#8b5e3c] hover:text-[#684329]"
          >
            View all services →
          </Link>
        </div>

        {!loading && !error && categories.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[#d9cabb] bg-white px-5 py-10 text-center text-sm text-[#766e67]">
            Categories will appear here once services are added.
          </p>
        )}

        {categories.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.name}
                href={`/services?category=${encodeURIComponent(category.name)}`}
                className="group rounded-2xl border border-[#eee5da] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#c6a36b] hover:shadow-xl hover:shadow-[#684329]/5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4ede4] text-3xl transition group-hover:bg-[#eee0ce]">
                  {iconFor(category.name)}
                </span>
                <h3 className="mt-6 text-lg font-semibold text-[#29231f]">
                  {category.name}
                </h3>
                <p className="mt-2 text-sm text-[#766e67]">
                  {category.count}{" "}
                  {category.count === 1 ? "service" : "services"} available
                </p>
                <p className="mt-5 text-sm font-semibold text-[#8b5e3c]">
                  Explore →
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About / Benefits */}
      <section id="about" className="mx-auto max-w-7xl px-5 pb-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a17a50]">
              Why SalonBook
            </p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight text-[#29231f] sm:text-4xl">
              Your salon experience, made simple.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-8 text-[#766e67]">
              We make it easier to discover salon services and manage your
              appointments. Spend less time planning and more time enjoying
              your self-care moments.
            </p>
            <Link
              href="/services"
              className="mt-8 inline-block rounded-full bg-[#8b5e3c] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#684329]"
            >
              Book Your Appointment →
            </Link>
          </div>

          <div className="space-y-7">
            {benefits.map((benefit) => (
              <div key={benefit.number} className="flex gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eee5da] font-semibold text-[#8b5e3c]">
                  {benefit.number}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-[#29231f]">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[#766e67]">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking CTA */}
      <section className="px-5 pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#684329] px-7 py-14 text-center sm:px-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#e6c99f]">
            Your Next Self-Care Moment
          </p>
          <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl leading-tight text-white sm:text-5xl">
            Ready to feel your best?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#eadfd3]">
            Find a service you love and book your appointment in just a few
            simple steps.
          </p>
          <Link
            href="/services"
            className="mt-8 inline-block rounded-full bg-[#e6c99f] px-8 py-3.5 text-sm font-bold text-[#50341f] transition hover:bg-white"
          >
            Get Started →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-[#29231f] text-white">
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
                Sign In
              </Link>
              <Link href="/auth/register" className="hover:text-white">
                Sign Up
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
    </main>
  );
}
