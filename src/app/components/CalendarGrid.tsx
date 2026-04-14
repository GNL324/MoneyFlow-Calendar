"use client";

interface Props {
  days: { date: string; day: number; income: number; expenses: number; balance: number; fillPct: number }[];
  today: string;
  onDayClick: (date: string) => void;
}

export default function CalendarGrid({ days, today, onDayClick }: Props) {
  const firstDay = new Date(days[0]?.date + "T12:00:00");
  const startDow = firstDay.getDay(); // 0=Sun

  // Fill empty cells before month starts
  const blanks = Array.from({ length: startDow }, (_, i) => (
    <div key={`blank-${i}`} className="aspect-square" />
  ));

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {dayNames.map((d) => (
          <div key={d} className="text-center text-xs text-gray-500 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div className="grid grid-cols-7 gap-1">
        {blanks}
        {days.map((d) => {
          const isToday = d.date === today;
          const hasActivity = d.income > 0 || d.expenses > 0;

          // Color based on fill level
          let fillColor = "from-emerald-500/60 to-emerald-500/20";
          let textColor = "text-emerald-400";
          let bgColor = "bg-gray-800/50";

          if (d.fillPct <= 0) {
            fillColor = "from-red-500/60 to-red-500/20";
            textColor = "text-red-400";
            bgColor = "bg-red-950/30";
          } else if (d.fillPct < 25) {
            fillColor = "from-amber-500/60 to-amber-500/20";
            textColor = "text-amber-400";
            bgColor = "bg-amber-950/20";
          } else if (d.fillPct < 50) {
            fillColor = "from-yellow-500/50 to-yellow-500/20";
            textColor = "text-yellow-400";
          }

          return (
            <button
              key={d.date}
              onClick={() => onDayClick(d.date)}
              className={`
                relative aspect-square rounded-lg overflow-hidden border transition-all
                hover:scale-105 hover:border-gray-500 active:scale-95
                ${isToday ? "border-emerald-500 ring-1 ring-emerald-500/50" : "border-gray-700/50"}
                ${bgColor}
              `}
            >
              {/* Fill level — bottom-aligned liquid effect */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${fillColor} transition-all duration-500`}
                style={{ height: `${Math.max(0, Math.min(100, d.fillPct))}%` }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-0.5">
                <span className={`text-sm font-bold ${isToday ? "text-white" : textColor}`}>
                  {d.day}
                </span>
                {hasActivity && (
                  <div className="flex gap-0.5 mt-0.5">
                    {d.income > 0 && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {d.expenses > 0 && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
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
