export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-4xl font-black uppercase italic tracking-tighter mb-4">404 - Not Found</h2>
      <p className="text-gray-500 font-bold">Could not find requested resource</p>
    </div>
  );
}
