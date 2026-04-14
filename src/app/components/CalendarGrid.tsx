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
      <div className="grid grid-cols-7 gap-1">
        {blanks}
        {days.map((d) => {
          const isToday = d.date === today;
          const hasActivity = d.income > 0 || d.expenses > 0;

          // Fill colors — light pastels
          let fillColor = "from-emerald-300/50 to-emerald-200/20";
          let textColor = "text-emerald-600";
          let bgColor = "bg-emerald-50/60";

          if (d.fillPct <= 0) {
            fillColor = "from-rose-300/50 to-rose-200/20";
            textColor = "text-rose-500";
            bgColor = "bg-rose-50/50";
          } else if (d.fillPct < 25) {
            fillColor = "from-amber-300/50 to-amber-200/20";
            textColor = "text-amber-600";
            bgColor = "bg-amber-50/50";
          } else if (d.fillPct < 50) {
            fillColor = "from-yellow-300/40 to-yellow-200/20";
            textColor = "text-yellow-600";
            bgColor = "bg-yellow-50/40";
          }

          return (
            <button
              key={d.date}
              onClick={() => onDayClick(d.date)}
              className={`
                relative aspect-square rounded-lg overflow-hidden border transition-all
                hover:scale-105 hover:border-gray-300 active:scale-95
                ${isToday ? "border-teal-400 ring-1 ring-teal-400/40" : "border-gray-200/80"}
                ${bgColor}
              `}
            >
              {/* Fill level */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${fillColor} transition-all duration-500`}
                style={{ height: `${Math.max(0, Math.min(100, d.fillPct))}%` }}
              />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-0.5">
                <span className={`text-sm font-bold ${isToday ? "text-teal-700" : textColor}`}>
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
