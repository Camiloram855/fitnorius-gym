/**
 * Contador de peticiones de contenido en vuelo.
 *
 * Vive fuera de React para que el cliente HTTP pueda avisar sin depender del
 * árbol de componentes. El provider de GlobalLoader se suscribe y refleja el
 * estado real: mientras haya lecturas pendientes, hay loading.
 */

let activeRequests = 0;
const listeners = new Set();

function notify() {
  listeners.forEach((listener) => listener(activeRequests));
}

export function beginLoading() {
  activeRequests += 1;
  notify();
}

export function endLoading() {
  activeRequests = Math.max(0, activeRequests - 1);
  notify();
}

/** Suscripción inmediata: devuelve el estado actual y una función de baja. */
export function subscribeToLoading(listener) {
  listeners.add(listener);
  listener(activeRequests);
  return () => listeners.delete(listener);
}
