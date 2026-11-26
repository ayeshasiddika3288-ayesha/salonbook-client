
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface Service {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  duration: number;
  price: number;
  image: string;
  status: "active" | "inactive";
}

const categories = ["All Categories"];

function ServicesContent({ categoryParam }: { categoryParam: string }) {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categoryParam);
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = () => {
    if (!API_URL) {
      return Promise.reject(new Error("API URL is not configured."));
    }

    return fetch(`${API_URL}/api/services`).then(async (response) => {
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load services.");
      }

      return (result.data || []) as Service[];
    });
  };

  const showError = (err: unknown) => {
    const message =
      err instanceof Error
        ? err.message
        : "Something went wrong while loading services.";

    setError(message);
    toast.error(message);
  };

  useEffect(() => {
    loadServices()
      .then((data) => {
        setError("");
        setServices(data);
      })
      .catch(showError)
      .finally(() => setLoading(false));
  }, []);

  const availableCategories = useMemo(() => {
    const dynamicCategories = Array.from(
      new Set(
        services
          .map((service) => service.category)
          .filter((item): item is string => Boolean(item))
      )
    );

    const allCategories = [...categories, ...dynamicCategories];

    if (
      categoryParam !== "All Categories" &&
      !allCategories.includes(categoryParam)
    ) {
      allCategories.push(categoryParam);
    }

    return allCategories;
  }, [services, categoryParam]);

  const filteredServices = useMemo(() => {
    let result = services.filter((service) => {
      const matchesSearch =
        service.serviceName.toLowerCase().includes(search.toLowerCase()) ||
        service.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" || service.category === category;

      return matchesSearch && matchesCategory;
    });

    if (sort === "low-high") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sort === "high-low") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [services, search, category, sort]);

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setSort("default");
  };

  return (
    <main className="min-h-screen flex-1 bg-[#faf7f2]">
      <Navbar />

      {/* Page Intro */}
      <section className="bg-[#eee5da] px-5 py-16 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#a17a50]">
          Discover Your Beauty
        </p>

        <h1 className="mt-3 text-4xl font-semibold text-[#29231f] sm:text-5xl">
          Our Salon Services
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[#766e67]">
          Explore our range of professional beauty and self-care services.
          Find the right service and book your appointment with ease.
        </p>
      </section>

      {/* Service Listing */}
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-10 rounded-2xl border border-[#eee5da] bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1fr_220px_220px]">
            <div>
              <label
                htmlFor="service-search"
                className="mb-2 block text-sm font-semibold text-[#51453b]"
              >
                Search Services
              </label>

              <input
                id="service-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by service name..."
                className="w-full rounded-xl border border-[#e5dbcf] bg-[#faf7f2] px-4 py-3 text-sm outline-none transition placeholder:text-[#a69a8e] focus:border-[#8b5e3c] focus:ring-2 focus:ring-[#8b5e3c]/10"
              />
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="mb-2 block text-sm font-semibold text-[#51453b]"
              >
                Category
              </label>

              <select
                id="category-filter"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-xl border border-[#e5dbcf] bg-[#faf7f2] px-4 py-3 text-sm outline-none focus:border-[#8b5e3c]"
              >
                {availableCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="price-sort"
                className="mb-2 block text-sm font-semibold text-[#51453b]"
              >
                Sort by Price
              </label>

              <select
                id="price-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="w-full rounded-xl border border-[#e5dbcf] bg-[#faf7f2] px-4 py-3 text-sm outline-none focus:border-[#8b5e3c]"
              >
                <option value="default">Default</option>
                <option value="low-high">Low to High</option>
                <option value="high-low">High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#766e67]">
              Showing{" "}
              <span className="font-bold text-[#684329]">
                {filteredServices.length}
              </span>{" "}
              services
            </p>

            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-[#8b5e3c] hover:text-[#684329]"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e5dbcf] border-t-[#8b5e3c]" />
            <p className="mt-4 text-sm text-[#766e67]">
              Loading salon services...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-12 text-center">
            <h2 className="text-xl font-semibold text-red-700">
              Unable to Load Services
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#684329]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Service Cards */}
        {!loading && !error && filteredServices.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className="group overflow-hidden rounded-2xl border border-[#eee5da] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.serviceName}
                    className="h-60 w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="p-6">
                  <span className="rounded-full bg-[#f4ede4] px-3 py-1.5 text-xs font-semibold text-[#8b5e3c]">
                    {service.category}
                  </span>

                  <h2 className="mt-4 text-xl font-semibold text-[#29231f]">
                    {service.serviceName}
                  </h2>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-[#766e67]">
                    {service.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#eee5da] pt-4">
                    <div>
                      <p className="text-xs text-[#96897d]">Duration</p>
                      <p className="mt-1 text-sm font-medium text-[#51453b]">
                        {service.duration} minutes
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-[#96897d]">Price</p>
                      <p className="mt-1 text-xl font-bold text-[#8b5e3c]">
                        ৳{service.price.toLocaleString("en-BD")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/services/${service._id}`}
                    className="mt-6 block rounded-full bg-[#8b5e3c] py-3 text-center text-sm font-semibold text-white transition hover:bg-[#684329]"
                  >
                    View Details →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredServices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#d9cabb] bg-white px-5 py-16 text-center">
            <div className="text-4xl">🔎</div>

            <h2 className="mt-4 text-xl font-semibold text-[#29231f]">
              No services found
            </h2>

            <p className="mt-2 text-sm text-[#766e67]">
              Try another search term or select a different category.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#8b5e3c] px-6 py-3 text-sm font-semibold text-white hover:bg-[#684329]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </main>
  );
}

function ServicesRoute() {
  const searchParams = useSearchParams();
  const categoryParam =
    searchParams.get("category") || "All Categories";

  return <ServicesContent key={categoryParam} categoryParam={categoryParam} />;
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
          <p className="text-lg font-medium text-[#684329]">
            Loading salon services...
          </p>
        </div>
      }
    >
      <ServicesRoute />
    </Suspense>
  );
}
