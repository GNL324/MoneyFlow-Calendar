"use client";

interface Props {
  days: { date: string; day: number; income: number; plannedExpenses: number; unplannedExpenses: number; expenses: number; balance: number; fillPct: number }[];
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

          // Green zones: 100% = fully funded for planned expenses
          // As money is spent, bar drains down through color zones
          let fillColor = "bg-emerald-500";
          let bgTint = "";
          let dayTextColor = "text-gray-700";

          if (pct <= 0) {
            // No funds — red
            fillColor = "";
            bgTint = "bg-rose-100/70";
            dayTextColor = "text-rose-600";
          } else if (pct < 15) {
            // Almost empty — danger red
            fillColor = "bg-red-500";
            bgTint = "bg-red-50/40";
            dayTextColor = "text-red-700";
          } else if (pct < 35) {
            // Low — amber warning
            fillColor = "bg-amber-500";
            bgTint = "bg-amber-50/30";
            dayTextColor = "text-amber-800";
          } else if (pct < 65) {
            // Moderate — yellow-green
            fillColor = "bg-emerald-500";
            bgTint = "bg-emerald-50/20";
            dayTextColor = "text-gray-800";
          } else if (pct < 90) {
            // Good — solid green
            fillColor = "bg-green-500";
            bgTint = "bg-green-50/20";
            dayTextColor = "text-gray-800";
          } else {
            // Flush — rich green, fully funded
            fillColor = "bg-green-600";
            bgTint = "bg-green-50/30";
            dayTextColor = "text-white";
          }

          // Fill height: the bar rises from bottom proportional to coverage
          // 100% = full tile, drains as money is spent
          const fillHeight = pct > 0 ? Math.max(8, pct) : 0;

          // Planned expense marker: subtle line showing where planned expenses hit this day
          const hasPlanned = d.plannedExpenses > 0;
          const hasUnplanned = d.unplannedExpenses > 0;

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
              {/* Green fill bar — rises from bottom, drains as funds are spent */}
              {fillHeight > 0 && (
                <div
                  className={`absolute bottom-0 left-0 right-0 ${fillColor} transition-all duration-500 ease-out`}
                  style={{ height: `${fillHeight}%` }}
                >
                  {/* Subtle light gradient at top of fill for liquid effect */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-white/15 to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-0.5">
                <span className={`text-sm font-bold ${isToday ? "text-teal-700" : dayTextColor}`}>
                  {d.day}
                </span>
                {(hasPlanned || hasUnplanned || d.income > 0) && (
                  <div className="flex gap-0.5 mt-0.5">
                    {d.income > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ring-1 ring-white/40" />}
                    {hasPlanned && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 ring-1 ring-white/40" />}
                    {hasUnplanned && <span className="w-1.5 h-1.5 rounded-full bg-rose-400 ring-1 ring-white/40" />}
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