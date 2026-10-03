import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { apiFetch } from "../api/client";
import API_URL from "../config";
import ProductImage from "../components/ProductImage";
import { buildImageUrl } from "../utils/images";

const BANNER_UPDATED_EVENT = "fitnorius:promo-banner-updated";

/**
 * Panel de administración del banner de promociones. Se usa el mismo
 * almacenamiento de imágenes del proyecto (Cloudinary vía el backend), con
 * validación de archivo en el servidor.
 *
 * Solo se monta cuando isAdmin es true y el backend exige ROLE_ADMIN.
 */
export default function AdminPromoBanner() {
  const [current, setCurrent] = useState(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await apiFetch(`${API_URL}/api/promo-banner`);
      if (!response.ok) return;
      const data = await response.json();
      setCurrent(data || null);
    } catch {
      setCurrent(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // La previsualización se revoca para no filtrar memoria.
  useEffect(() => {
    if (!file) {
      setPreview("");
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const notifyStore = () => window.dispatchEvent(new Event(BANNER_UPDATED_EVENT));

  const handleSave = async () => {
    setError("");
    setMessage("");

    if (!file && !current?.imageUrl) {
      setError("Sube una imagen para el banner.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("active", "true");

      const response = await apiFetch(`${API_URL}/api/promo-banner`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("No se pudo guardar el banner");

      setFile(null);
      await load();
      notifyStore();
      setMessage("Banner guardado. Ya aparece en la portada.");
    } catch (saveError) {
      console.error(saveError);
      setError("No se pudo guardar el banner. Revisa que la imagen sea válida.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async () => {
    setError("");
    setMessage("");
    try {
      const response = await apiFetch(
        `${API_URL}/api/promo-banner/visibility?active=${!current?.active}`,
        { method: "PATCH" }
      );
      if (!response.ok) throw new Error("No se pudo cambiar la visibilidad");
      await load();
      notifyStore();
      setMessage(
        current?.active ? "Banner oculto en la portada." : "Banner visible en la portada."
      );
    } catch (toggleError) {
      console.error(toggleError);
      setError("No se pudo cambiar la visibilidad del banner.");
    }
  };

  const handleDelete = async () => {
    setError("");
    setMessage("");
    setIsDeleting(true);
    try {
      const response = await apiFetch(`${API_URL}/api/promo-banner`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar");
      setCurrent(null);
      setFile(null);
      notifyStore();
      setMessage("Banner eliminado.");
    } catch (deleteError) {
      console.error(deleteError);
      setError("No se pudo eliminar el banner.");
    } finally {
      setIsDeleting(false);
    }
  };

  const previewSrc = preview || (current?.imageUrl ? buildImageUrl(current.imageUrl, API_URL) : null);

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-800/70 p-4">
      <h3 className="text-sm font-bold text-gray-100">Banner de promociones</h3>
      <p className="mt-1 text-xs text-gray-400">
        La tarjeta toma las medidas de tu imagen, así que siempre se ve completa y
        nunca queda cortada.
      </p>

      <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[11px] leading-relaxed text-amber-200">
        <strong className="font-bold">Recomendado:</strong> 1920 × 640 px (3:1).
        <br />
        Puedes subir cualquier proporción: si es más ancha, la tarjeta sale más
        delgada; si es más alta, más grande. Mínimo 1200 px de ancho.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-purple-600/60 px-4 py-4 text-sm font-semibold text-purple-200 transition hover:border-purple-500 hover:bg-purple-800/20">
          {previewSrc ? "Cambiar imagen" : "Seleccionar imagen"}
          <input
            id="promo-banner-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            className="hidden"
            onChange={(event) => {
              setError("");
              setFile(event.target.files?.[0] || null);
              event.target.value = "";
            }}
          />
        </label>

        {previewSrc && (
          <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
            <ProductImage
              src={previewSrc}
              alt="Vista previa del banner"
              className="h-auto w-full object-contain"
            />
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-gray-300">
              Así se verá en la portada
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-purple-700 disabled:cursor-wait disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar banner"}
        </button>

        {current && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleToggle}
              className="rounded-lg bg-gray-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-gray-600"
            >
              {current.active ? "Ocultar en la portada" : "Mostrar en la portada"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              <Trash2 size={13} />
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        )}

        {current && (
          <p className="text-xs text-gray-400">
            {current.active ? "Visible para los usuarios." : "Oculto para los usuarios."}
          </p>
        )}

        {error && (
          <p role="alert" className="text-xs font-semibold text-red-400">
            {error}
          </p>
        )}
        {message && (
          <p role="status" className="text-xs font-semibold text-emerald-400">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}