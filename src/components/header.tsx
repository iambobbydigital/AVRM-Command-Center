export function Header() {
  return (
    <header className="h-14 border-b bg-white px-6 flex items-center justify-between">
      <div className="text-sm text-slate-500">
        Active Vacation Rental Management
      </div>
      <div className="text-sm text-slate-500">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </header>
  );
}
