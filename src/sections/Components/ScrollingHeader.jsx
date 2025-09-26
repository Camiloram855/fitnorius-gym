import { useState, useEffect } from "react";

const ScrollingHeader = () => {
  const messages = [
    " ENVÍOS GRATIS DESDE 580,900 A Todo Colombia*",
    " OFERTAS EXCLUSIVAS EN PRODUCTOS DESTACADOS",
    " NUEVAS COLECCIONES DISPONIBLES YA",
  ];

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("enter"); // "enter" | "stay" | "exit"

  useEffect(() => {
    let timer;

    if (phase === "enter") {
      timer = setTimeout(() => setPhase("stay"), 500); // animación de entrada
    } else if (phase === "stay") {
      timer = setTimeout(() => setPhase("exit"), 3000); // pausa en el centro
    } else if (phase === "exit") {
      timer = setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setPhase("enter");
      }, 500); // salida y cambio de mensaje
    }

    return () => clearTimeout(timer);
  }, [phase, messages.length]);

  return (
    <div className="w-full bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-800 text-white font-bold text-sm md:text-base overflow-hidden h-10 flex items-center relative">
      <div
        key={index}
        className={`absolute w-full text-center transition-transform duration-500`}
        style={{
            textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000",
          transform:
            phase === "enter"
              ? "translateX(0)" // entra al centro
              : phase === "stay"
              ? "translateX(0)" // permanece en centro
              : "translateX(-100%)", // sale a la izquierda
          // posición inicial a la derecha fuera de pantalla
          ...(phase === "enter" && { transform: "translateX(100%)" }),
        }}
      >
        {messages[index]}
      </div>
    </div>
  );
};

export default ScrollingHeader;
