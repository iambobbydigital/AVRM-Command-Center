export function Header() {
  return (
    <header className="h-14 border-b border-neutral-800 bg-black px-6 flex items-center justify-between">
      <div className="text-sm text-neutral-400">
        Active Vacation Rental Management
      </div>
      <div className="text-sm text-neutral-400">
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
