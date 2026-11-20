
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { useSession, authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const timeSlots = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceId = searchParams.get("service");

  const { data: session, isPending } = useSession();
  const user = session?.user as { role?: string } | undefined;

  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      router.replace(
        serviceId
          ? `/auth/login?service=${serviceId}`
          : "/auth/login"
      );
      return;
    }

    if (user?.role !== "customer") {
      router.replace("/dashboard/admin");
    }
  }, [session, isPending, user?.role, router, serviceId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!serviceId) {
      setError("Service information is missing. Please select a service first.");
      toast.error("Service information is missing.");
      return;
    }

    if (!date || !timeSlot) {
      setError("Please select an appointment date and time.");
      toast.error("Please select an appointment date and time.");
      return;
    }

    if (new Date(`${date}T00:00:00`) < new Date(new Date().toDateString())) {
      setError("Please select today or a future date.");
      toast.error("Please select today or a future date.");
      return;
    }

    try {
      setLoading(true);

      const tokenResponse = await authClient.token();
      const token = tokenResponse.data?.token;

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId,
          appointmentDate: date,
          timeSlot,
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Could not create appointment.");
      }

      setSuccess(
        result.message || "Your appointment request has been submitted successfully!"
      );
      toast.success("Appointment request submitted successfully.");

      setDate("");
      setTimeSlot("");
      setMessage("");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || !session || user?.role !== "customer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <p className="text-[#684329]">Checking account access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] text-[#29231f]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-5 py-12">
        <Link
          href="/services"
          className="mb-6 inline-block text-sm font-medium text-[#8b5e3c] hover:underline"
        >
          ← Back to Services
        </Link>

        <div className="rounded-2xl border border-[#e9dfd4] bg-white p-6 shadow-sm sm:p-10">
          <h1 className="text-3xl font-bold text-[#684329]">
            Book an Appointment
          </h1>

          <p className="mt-2 text-sm text-[#8b8178]">
            Choose your preferred date and time to request an appointment.
          </p>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
              <Link
                href="/dashboard/customer/appointments"
                className="mt-2 block font-semibold underline"
              >
                View My Appointments
              </Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label
                htmlFor="appointmentDate"
                className="mb-2 block text-sm font-semibold"
              >
                Appointment Date
              </label>
              <input
                id="appointmentDate"
                type="date"
                value={date}
                min={new Date().toLocaleDateString("en-CA")}
                onChange={(event) => setDate(event.target.value)}
                required
                className="w-full rounded-lg border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
              />
            </div>

            <div>
              <label
                htmlFor="timeSlot"
                className="mb-2 block text-sm font-semibold"
              >
                Preferred Time Slot
              </label>
              <select
                id="timeSlot"
                value={timeSlot}
                onChange={(event) => setTimeSlot(event.target.value)}
                required
                className="w-full rounded-lg border border-[#e9dfd4] bg-white px-4 py-3 outline-none focus:border-[#8b5e3c]"
              >
                <option value="">Select a time slot</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold"
              >
                Additional Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Write any special request..."
                className="w-full rounded-lg border border-[#e9dfd4] px-4 py-3 outline-none focus:border-[#8b5e3c]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#684329] px-6 py-4 font-semibold text-white transition hover:bg-[#8b5e3c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting Request..." : "Confirm Appointment Request"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
          Loading booking page...
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
