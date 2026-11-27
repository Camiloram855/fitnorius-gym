import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  beginLoading,
  endLoading,
  subscribeToLoading,
} from "../api/loadingBus";

const LoadingContext = createContext(null);

/**
 * Vista del loader. Se usa a pantalla completa y también dentro de una
 * sección (compact), sin duplicar el logo ni sus animaciones.
 */
export function LoaderLogo({ compact = false }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "gap-3 py-8" : "gap-5"}`}>
      <img
        src="/img/Logo.png"
        alt="FitnoriosGYM"
        className={`${compact ? "h-14 w-14 sm:h-16 sm:w-16" : "h-20 w-20 sm:h-24 sm:w-24"} object-contain fitnorios-loader-logo`}
      />

      <div className={`${compact ? "w-24" : "w-32"} h-1 overflow-hidden rounded-full bg-white/10`}>
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-300 fitnorios-loader-bar" />
      </div>

      <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-purple-200/80">
        Cargando...
      </span>
    </div>
  );
}

/**
 * Provider global: cuenta las peticiones de contenido en vuelo y muestra el
 * loader mientras haya trabajo pendiente. Se monta una sola vez, dentro del
 * Router, para que cubra la carga inicial y cada transición de ruta.
 */
export function LoadingProvider({ children }) {
  const [activeCount, setActiveCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const busy = activeCount > 0;
  useEffect(() => subscribeToLoading(setActiveCount), []);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(busy), busy ? 180 : 120);
    return () => window.clearTimeout(timer);
  }, [busy]);
  return (
    <LoadingContext.Provider value={{ isLoading: busy }}>
      {children}
      {visible && (
        <div role="status" aria-label="Cargando contenido" className="pointer-events-none fixed inset-x-0 top-0 z-[10000] h-1 overflow-hidden bg-purple-950/30">
          <div className="h-full w-1/3 rounded-full bg-purple-400 fitnorios-loader-bar motion-reduce:animate-none" />
        </div>
      )}
    </LoadingContext.Provider>
  );
}

/**
 * Para estados de carga que no vienen de apiFetch (por ejemplo, una librería
 * que cargue datos por su cuenta): registra la operación con el mismo loader.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useGlobalLoader() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useGlobalLoader debe utilizarse dentro de LoadingProvider");
  }

  const track = async (promise) => {
    beginLoading();
    try {
      return await promise;
    } finally {
      endLoading();
    }
  };

  return { isLoading: context.isLoading, track };
}
