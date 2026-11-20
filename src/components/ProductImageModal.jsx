import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ProductImage from "./ProductImage";

export default function ProductImageModal({ images, title, initialIndex = 0, onClose }) {
  const dialogRef = useRef(null);
  const touchStart = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const currentIndex = Math.min(index, images.length - 1);
  const move = (direction) => {
    setIndex((previous) => (Math.min(previous, images.length - 1) + direction + images.length) % images.length);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-label={`Imágenes de ${title}`}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
      className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none border-0 bg-transparent p-4 text-white backdrop:bg-black/80 backdrop:backdrop-blur-md open:flex open:items-center open:justify-center"
    >
      <div className="relative w-full max-w-3xl">
        <button
          type="button"
          autoFocus
          aria-label="Cerrar imagen ampliada"
          onClick={onClose}
          className="absolute right-0 top-0 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-3xl hover:bg-purple-700 focus-visible:outline focus-visible:outline-2"
        >×</button>
        <div
          onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }}
          onTouchCancel={() => { touchStart.current = null; }}
          onTouchEnd={(event) => {
            if (touchStart.current === null) return;
            const distance = touchStart.current - event.changedTouches[0].clientX;
            if (Math.abs(distance) > 60) move(distance > 0 ? 1 : -1);
            touchStart.current = null;
          }}
        >
          <ProductImage
            src={images[currentIndex]?.src}
            alt={`${title} - imagen ${currentIndex + 1} de ${images.length}`}
            className="h-[70dvh] w-full rounded-lg object-contain shadow-2xl"
            eager
          />
        </div>
        {images.length > 1 && (
          <>
            <button type="button" aria-label="Imagen anterior" onClick={() => move(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl hover:bg-purple-700">‹</button>
            <button type="button" aria-label="Imagen siguiente" onClick={() => move(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-4 py-3 text-2xl hover:bg-purple-700">›</button>
          </>
        )}
        <p className="mt-4 text-center text-lg font-semibold">{title}</p>
        <p aria-live="polite" className="mt-1 text-center text-sm text-gray-300">{currentIndex + 1} / {images.length}</p>
      </div>
    </dialog>,
    document.body
  );
}