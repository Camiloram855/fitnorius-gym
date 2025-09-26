import { useState, useEffect } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    minutes: 30,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return {
            ...prev,
            days: prev.days - 1,
            hours: 23,
            minutes: 59,
            seconds: 59,
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-r from-purple-50 to-purple-100">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
          Oferta Limitada
        </h2>
        <p className="text-xl text-purple-700 mb-12 font-light">
          ¡Aprovecha este descuento exclusivo antes de que termine!
        </p>

        <div className="flex justify-center gap-4 md:gap-8 mb-8">
          {Object.entries(timeLeft).map(([unit, value]) => (
            <div
              key={unit}
              className="p-6 md:p-8 rounded-xl bg-white shadow-xl border border-purple-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="text-4xl md:text-6xl font-bold text-purple-900 mb-2">
                {value.toString().padStart(2, "0")}
              </div>
              <div className="text-sm md:text-base text-purple-600 uppercase tracking-wider font-medium">
                {unit === "days"
                  ? "Días"
                  : unit === "hours"
                  ? "Horas"
                  : unit === "minutes"
                  ? "Minutos"
                  : "Segundos"}
              </div>
            </div>
          ))}
        </div>

        <div className="text-3xl md:text-4xl font-bold text-purple-900">
          <span className="line-through text-purple-400 mr-4">$89.99</span>
          <span className="text-purple-600">$59.99</span>
        </div>
      </div>
    </section>
  );
}
