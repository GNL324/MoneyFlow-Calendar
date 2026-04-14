"use client";

interface Props {
  days: { date: string; day: number; income: number; expenses: number; balance: number; fillPct: number }[];
  today: string;
  onDayClick: (date: string) => void;
}

export default function CalendarGrid({ days, today, onDayClick }: Props) {
  const firstDay = new Date(days[0]?.date + "T12:00:00");
  const startDow = firstDay.getDay();

  const blanks = Array.from({ length: startDow }, (_, i) => (
    <div key={`blank-${i}`} className="aspect-square" />
  ));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1.5">
        {blanks}
        {days.map((d) => {
          const isToday = d.date === today;
          const hasActivity = d.income > 0 || d.expenses > 0;
          const pct = Math.max(0, Math.min(100, d.fillPct));

          // Color zones: green when full, drains to amber, then red
          // 50-100%: rich green (well-funded)
          // 25-50%: amber/yellow (caution — funds depleting)
          // 0-25%: red/orange (danger — running low)
          // 0%: solid red tint (out of funds)
          let fillColor = "bg-emerald-500";
          let bgTint = "bg-emerald-50/30";

          if (pct <= 0) {
            fillColor = "bg-rose-500";
            bgTint = "bg-rose-100/60";
          } else if (pct < 15) {
            fillColor = "bg-red-500";
            bgTint = "bg-red-50/50";
          } else if (pct < 30) {
            fillColor = "bg-amber-500";
            bgTint = "bg-amber-50/40";
          } else if (pct < 50) {
            fillColor = "bg-yellow-500";
            bgTint = "bg-yellow-50/30";
          } else if (pct < 75) {
            fillColor = "bg-emerald-500";
            bgTint = "bg-emerald-50/30";
          } else {
            fillColor = "bg-green-600";
            bgTint = "bg-green-50/30";
          }

          // Fill height: minimum 6% when there's any money, so it's always visible
          // 0% means out of funds — no green bar at all, just red tint
          const fillHeight = pct > 0 ? Math.max(6, pct) : 0;

          return (
            <button
              key={d.date}
              onClick={() => onDayClick(d.date)}
              className={`
                relative aspect-square rounded-lg overflow-hidden border transition-all
                hover:scale-105 hover:border-gray-300 active:scale-95
                ${isToday ? "border-teal-400 ring-1 ring-teal-400/40" : "border-gray-200/80"}
                ${bgTint}
              `}
            >
              {/* Liquid fill — rises from bottom */}
              <div
                className={`absolute bottom-0 left-0 right-0 ${fillColor} transition-all duration-500 ease-out`}
                style={{ height: `${fillHeight}%` }}
              >
                {/* Subtle wave/gradient effect at top of fill */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-b from-white/20 to-transparent" />
              </div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-0.5">
                <span className={`text-sm font-bold ${isToday ? "text-teal-700" : pct <= 0 ? "text-rose-700" : pct < 30 ? "text-amber-700" : "text-white"}`}>
                  {d.day}
                </span>
                {hasActivity && (
                  <div className="flex gap-0.5 mt-0.5">
                    {d.income > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 ring-1 ring-emerald-400/50" />}
                    {d.expenses > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-300 ring-1 ring-rose-400/50" />}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}