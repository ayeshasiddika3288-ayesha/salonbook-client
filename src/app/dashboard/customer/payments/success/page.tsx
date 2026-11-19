
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-5">
      <div className="w-full max-w-lg rounded-3xl border border-[#e9dfd4] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
          ✓
        </div>

        <h1 className="mt-6 text-3xl font-bold text-[#684329]">
          Payment Submitted!
        </h1>

        <p className="mt-4 leading-7 text-[#8b8178]">
          Thank you for your payment. Stripe has returned you to SalonBook.
          Your payment status will update after our secure webhook verifies
          the transaction.
        </p>

        <p className="mt-3 text-sm text-[#8b8178]">
          Please check your payment history in a moment.
        </p>

        <Link
          href="/dashboard/customer/payments"
          className="mt-7 inline-block rounded-lg bg-[#8b5e3c] px-6 py-3 font-semibold text-white hover:bg-[#684329]"
        >
          View Payment History
        </Link>
      </div>
    </main>
  );
}
