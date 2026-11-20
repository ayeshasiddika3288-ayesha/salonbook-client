export default function Loading() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-[#faf7f2]">
      <div className="text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#e5dbcf] border-t-[#8b5e3c]" />
        <p className="mt-4 text-sm font-medium text-[#8b5e3c]">
          Loading SalonBook...
        </p>
      </div>
    </div>
  );
}
