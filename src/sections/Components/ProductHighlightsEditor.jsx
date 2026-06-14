import { Plus, Trash2 } from "lucide-react";
import { PRODUCT_FEATURE_ICON_OPTIONS } from "../../components/SVG/ProductCardIcons";

const createHighlight = () => ({ icon: "shield", text: "" });

export default function ProductHighlightsEditor({ value = [], onChange }) {
  const highlights = Array.isArray(value) ? value : [];

  const updateHighlights = (next) => {
    onChange(next);
  };

  const addHighlight = () => {
    updateHighlights([...highlights, createHighlight()]);
  };

  const removeHighlight = (index) => {
    const next = highlights.filter((_, itemIndex) => itemIndex !== index);
    updateHighlights(next);
  };

  const updateHighlight = (index, key, nextValue) => {
    updateHighlights(
      highlights.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: nextValue } : item
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <label className="block text-sm text-gray-300">Puntos destacados</label>
        <button
          type="button"
          onClick={addHighlight}
          className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-purple-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar punto
        </button>
      </div>

      <div className="space-y-3">
        {highlights.length === 0 ? (
          <div className="rounded-xl border border-dashed border-purple-600/60 bg-black/25 p-4 text-sm text-gray-300">
            No hay puntos destacados todavía. Agrega el primero cuando lo necesites.
          </div>
        ) : (
          highlights.map((highlight, index) => (
            <div
              key={`${index}-${highlight.icon || "shield"}`}
            className="rounded-xl border border-purple-700/60 bg-black/30 p-2.5"
          >
            <div className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-2">
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {PRODUCT_FEATURE_ICON_OPTIONS.map(({ value: iconValue, Icon }) => {
                      const isSelected = (highlight.icon || "shield") === iconValue;

                      return (
                        <button
                          key={iconValue}
                          type="button"
                          title={iconValue}
                          onClick={() => updateHighlight(index, "icon", iconValue)}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                            isSelected
                              ? "border-purple-300 bg-purple-600/30 text-white"
                              : "border-purple-600/40 bg-black/40 text-purple-200 hover:bg-purple-600/20"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>

                  <input
                    type="text"
                    value={highlight.text || ""}
                    onChange={(e) => updateHighlight(index, "text", e.target.value)}
                    className="w-full rounded-lg border border-purple-600 bg-black/50 px-3 py-1.5 text-sm text-white"
                    placeholder="Ej: 1 año de garantía"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeHighlight(index)}
                  className="rounded-lg border border-rose-500/50 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/20"
                  title="Eliminar punto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export { createHighlight };
