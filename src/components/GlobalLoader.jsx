import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  beginLoading,
  endLoading,
  subscribeToLoading,
} from "../api/loadingBus";

const LoadingContext = createContext(null);

// Anti-parpadeo mínimo: si la petición termina antes, el loader no se ve.
const SHOW_DELAY_MS = 60;

// Tope de permanencia: aunque queden peticiones secundarias pendientes, el
// loader se retira para no retrasar la interacción del usuario.
const MAX_VISIBLE_MS = 700;

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
  const [mounted, setMounted] = useState(false);
  const delayRef = useRef(null);
  const capRef = useRef(null);
  const suppressedRef = useRef(false);

  useEffect(() => subscribeToLoading(setActiveCount), []);

  useEffect(() => {
    if (activeCount > 0) {
      // Ya se mostró en esta tanda: una petición secundaria lenta no debe
      // volver a tapar la página.
      if (suppressedRef.current) return;

      if (delayRef.current === null) {
        delayRef.current = window.setTimeout(() => {
          delayRef.current = null;
          setVisible(true);
          capRef.current = window.setTimeout(() => {
            capRef.current = null;
            suppressedRef.current = true;
            setVisible(false);
          }, MAX_VISIBLE_MS);
        }, SHOW_DELAY_MS);
      }
      return;
    }

    suppressedRef.current = false;
    if (delayRef.current !== null) {
      window.clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    if (capRef.current !== null) {
      window.clearTimeout(capRef.current);
      capRef.current = null;
    }
    setVisible(false);
  }, [activeCount]);

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }
  }, [visible]);

  useEffect(() => () => {
    if (delayRef.current !== null) window.clearTimeout(delayRef.current);
    if (capRef.current !== null) window.clearTimeout(capRef.current);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading: visible }}>
      {children}

      {mounted && createPortal(
        <div
          role="status"
          aria-live="polite"
          aria-label="Cargando FitnoriosGYM"
          aria-hidden={!visible}
          onTransitionEnd={(event) => {
            if (event.target === event.currentTarget && !visible) {
              setMounted(false);
            }
          }}
          className={`pointer-events-none fixed inset-0 z-[10000] flex items-center justify-center bg-gradient-to-br from-black via-gray-950 to-purple-950 backdrop-blur-sm transition-opacity duration-150 ease-out motion-reduce:transition-none motion-reduce:duration-0 ${
            visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <LoaderLogo />
        </div>,
        document.body
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
