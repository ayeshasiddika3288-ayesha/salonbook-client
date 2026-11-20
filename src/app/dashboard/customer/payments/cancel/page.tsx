
import Link from "next/link";

export default function PaymentCancelPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-5">
      <div className="w-full max-w-lg rounded-3xl border border-[#e9dfd4] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl text-orange-600">
          !
        </div>

        <h1 className="mt-6 text-3xl font-bold text-[#684329]">
          Payment Cancelled
        </h1>

        <p className="mt-4 leading-7 text-[#8b8178]">
          Your checkout process was cancelled. No successful payment has been
          recorded for this attempt. You can return to your payments and try
          again.
        </p>

        <Link
          href="/dashboard/customer/payments"
          className="mt-7 inline-block rounded-lg bg-[#8b5e3c] px-6 py-3 font-semibold text-white hover:bg-[#684329]"
        >
          Back to Payments
        </Link>
      </div>
    </main>
  );
}
