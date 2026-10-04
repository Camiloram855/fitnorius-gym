import { useState, useEffect } from "react";
import { apiFetch } from "../../api/client";
import { Link } from "react-router-dom";
import { User, ShoppingCart, X, Pencil, Check, Plus, ImagePlus, Upload, EyeOff, Tag } from "lucide-react";
import { useCart } from "../../pages/CartContext";
import { useAuth } from "../../pages/AuthContext";
import AdminPromoBanner from "../../components/AdminPromoBanner";
import ModalShell from "../../components/ModalShell";
import API_URL from "../../config";

const HEADER_MESSAGES_API = `${API_URL}/header-messages`;


const ScrollingHeader = () => {
  const { isAdmin } = useAuth();

  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("enter");
  const [resetting, setResetting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editIndex, setEditIndex] = useState(0);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showPromoBanner, setShowPromoBanner] = useState(false);
  const [promoFile, setPromoFile] = useState(null);
  const [promoPreview, setPromoPreview] = useState("");
  const [promoActive, setPromoActive] = useState(true);
  const [promoCurrent, setPromoCurrent] = useState(null);
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoDeleting, setPromoDeleting] = useState(false);

  const { cartItems, removeFromCart } = useCart();
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    apiFetch(HEADER_MESSAGES_API)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    if (!isAdmin || !showPromoModal) return;

    apiFetch(`${API_URL}/api/promotion-popup`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) {
          setPromoCurrent(null);
          setPromoActive(true);
          setPromoPreview("");
          setPromoFile(null);
          return;
        }

        setPromoCurrent(data);
        setPromoActive(Boolean(data.active));
        setPromoPreview(data.imageUrl || "");
        setPromoFile(null);
      })
      .catch(() => {
        setPromoCurrent(null);
        setPromoActive(true);
        setPromoPreview("");
        setPromoFile(null);
      });
  }, [isAdmin, showPromoModal]);

  useEffect(() => {
    if (!promoFile) return undefined;

    const previewUrl = URL.createObjectURL(promoFile);
    setPromoPreview(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [promoFile]);

  useEffect(() => {
    if (!showPromoModal) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closePromoModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPromoModal]);

  useEffect(() => {
    if (messages.length === 0) return;

    let timer;
    if (phase === "enter") {
      timer = setTimeout(() => setPhase("stay"), 600);
    } else if (phase === "stay") {
      timer = setTimeout(() => setPhase("exit"), 2500);
    } else if (phase === "exit") {
      timer = setTimeout(() => {
        setResetting(true);
        setIndex((prev) => (prev + 1) % messages.length);

        setTimeout(() => {
          setResetting(false);
          setPhase("enter");
        }, 20);
      }, 600);
    }

    return () => clearTimeout(timer);
  }, [phase, messages.length]);

  const updateMessagesInBackend = async (newMsgs) => {
    await apiFetch(HEADER_MESSAGES_API, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMsgs }),
    });

    setMessages(newMsgs);
  };

  const handleEdit = (i) => {
    if (!isAdmin) return;
    setEditIndex(i);
    setEditValue(messages[i]);
    setIsEditing(true);
  };

  const saveEdit = async () => {
  let newMsgs = [...messages];

  // Si estamos agregando uno nuevo
  if (editIndex === messages.length) {
    newMsgs.push(editValue);
  } else {
    newMsgs[editIndex] = editValue;
  }

  await updateMessagesInBackend(newMsgs);
  setIsEditing(false);
};


  const addMessage = () => {
    if (!isAdmin) return;
    setEditValue("");   // Campo vaciÂ­o
    setEditIndex(messages.length); // Se agrega al final
    setIsEditing(true); // Abrir modal
  };


  const openPromoModal = () => {
    if (!isAdmin) return;
    setShowPromoModal(true);
  };

  const closePromoModal = () => {
    setShowPromoModal(false);
    setPromoFile(null);
    setPromoPreview("");
  };

  const handlePromoFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPromoFile(file);
    event.target.value = "";
  };

  const handlePromoAction = () => {
    if (!promoFile && !promoCurrent?.imageUrl) {
      document.getElementById("promo-popup-upload")?.click();
      return;
    }

    handleSavePromo();
  };

  const handleSavePromo = async () => {
    if (!isAdmin) return;

    try {
      setPromoSaving(true);
      const formData = new FormData();

      if (promoFile) {
        formData.append("file", promoFile);
      }

      formData.append("active", String(promoActive));

      const response = await apiFetch(`${API_URL}/api/promotion-popup/save`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el popup promocional");
      }

      const savedPopup = await response.json();
      setPromoCurrent(savedPopup);
      setPromoPreview(savedPopup?.imageUrl || "");
      closePromoModal();
      window.dispatchEvent(new Event("promotion-popup-updated"));
    } catch (error) {
      console.error("Error guardando popup promocional:", error);
    } finally {
      setPromoSaving(false);
    }
  };

  const handleDeletePromo = async () => {
    if (!isAdmin || promoDeleting) return;

    try {
      setPromoDeleting(true);
      const response = await apiFetch(`${API_URL}/api/promotion-popup`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el popup promocional");
      }

      setPromoCurrent(null);
      setPromoPreview("");
      setPromoFile(null);
      setPromoActive(true);
      window.dispatchEvent(new Event("promotion-popup-updated"));
    } catch (error) {
      console.error("Error eliminando popup promocional:", error);
    } finally {
      setPromoDeleting(false);
    }
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `${API_URL}/${path}`;
  };

  return (
      <div className="w-full sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-700 text-white font-medium text-sm md:text-base h-12 flex items-center justify-between px-6 shadow-lg">

      {/* MENSAJES ANIMADOS */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center pointer-events-none">
        {messages.length > 0 && (
          <div
            key={index}
            className="absolute w-full text-center pointer-events-none"
            style={{
              transition: resetting ? "none" : "transform 0.7s ease-in-out",
              transform:
                resetting
                  ? "translateX(-100%)"
                  : phase === "enter"
                  ? "translateX(-100%)"
                  : phase === "stay"
                  ? "translateX(0)"
                  : "translateX(100%)",
            }}
          >
            {/* CLICK SOLO AQUi */}
            <span
              className="inline-block px-2 cursor-pointer pointer-events-auto"
              onClick={() => handleEdit(index)}
            >
              {messages[index]}
            </span>
          </div>
        )}
      </div>

      {/* AGREGAR MENSAJE (SOLO ADMIN) */}
      {isAdmin && (
        <button
          onClick={addMessage}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all mr-3 z-[200]"
        >
          <Plus size={18} />
        </button>
      )}

      {/* ICONOS */}
      <div className="flex items-center gap-3 relative z-[300]">
        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <ShoppingCart size={20} />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {cartItems.length}
            </span>
          )}
        </button>

        {isAdmin && (
          <>
            <button
              onClick={openPromoModal}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:px-4"
            >
              <ImagePlus size={18} />
              <span className="hidden sm:inline">Promo</span>
            </button>

            {/* Banner de promociones de la portada */}
            <button
              onClick={() => setShowPromoBanner(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:px-4"
            >
              <Tag size={18} />
              <span className="hidden sm:inline">Banner</span>
            </button>
          </>
        )}

        <Link
          to="/catalog/login"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <User size={20} />
        </Link>

        {showCart && (
          <div className="absolute right-0 top-10 w-80 bg-white text-gray-800 rounded-xl shadow-2xl p-4 z-[999] border border-gray-200">

            <div className="flex justify-between items-center mb-3 border-b pb-2">
              <h3 className="text-lg font-bold text-purple-700">Tu carrito</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Tu carrito esta vacio.
              </p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 bg-purple-50 rounded-lg p-2 shadow-sm"
                  >
                    <img
                      src={getImageUrl(item.image || item.imageUrl)}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />

                    <div className="flex-1">
                      <p className="text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.quantity} x ${item.price.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {cartItems.length > 0 && (
              <div className="mt-4 border-t pt-3 text-right">
                <p className="font-semibold text-purple-700">
                  Total: ${total.toLocaleString()}
                </p>
                <Link
                  to="/catalog/checkout"
                  onClick={() => setShowCart(false)}
                  className="mt-3 inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
                >
                  Finalizar compra
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

{isAdmin && (
        <ModalShell
          open={showPromoModal}
          onClose={closePromoModal}
          eyebrow="Popup promocional"
          title="Configurar imagen emergente"
          size="lg"
        >
          <div className="grid gap-0 md:grid-cols-[1fr_1fr]">
            <div className="border-b bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:border-b-0 md:border-r">
              <input
                id="promo-popup-upload"
                type="file"
                accept="image/*,.gif,image/gif"
                className="sr-only"
                onChange={handlePromoFileChange}
              />

              <label
                htmlFor="promo-popup-upload"
                className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-purple-200 bg-white px-4 py-8 text-center transition hover:border-purple-400"
              >
                <Upload size={28} className="text-purple-600" />
                <span className="mt-3 text-sm font-semibold text-gray-800">
                  Subir o reemplazar imagen
                </span>
                <span className="mt-1 text-xs text-gray-500">PNG, JPG, WEBP o GIF</span>
              </label>

              <label className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                <input
                  type="checkbox"
                  checked={!promoActive}
                  onChange={(event) => setPromoActive(!event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <EyeOff size={16} className="text-purple-600" />
                  Ocultar popup promocional
                </span>
              </label>

              <p className="mt-3 text-xs leading-5 text-gray-500">
                Si el popup esta oculto, no se mostrara a los usuarios aunque la
                imagen este guardada.
              </p>

              <button
                type="button"
                onClick={handlePromoAction}
                disabled={promoSaving}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 py-3 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-fuchsia-700 ${
                  promoSaving ? "cursor-wait opacity-80" : "cursor-pointer"
                }`}
              >
                <Check size={18} />
                {promoSaving
                  ? "Guardando..."
                  : promoFile || promoCurrent?.imageUrl
                    ? "Guardar popup"
                    : "Seleccionar imagen"}
              </button>
            </div>

            <div className="flex flex-col gap-4 p-4 sm:p-6">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                <p className="mb-3 text-sm font-semibold text-gray-800">Vista previa</p>
                <div className="flex min-h-[200px] items-center justify-center overflow-hidden rounded-2xl bg-white sm:min-h-[240px]">
                  {promoPreview ? (
                    <img
                      src={promoPreview}
                      alt="Vista previa popup"
                      className="max-h-[280px] w-full object-contain"
                    />
                  ) : (
                    <span className="px-4 text-center text-sm text-gray-400">
                      Todavia no hay imagen cargada
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                <p className="font-semibold text-gray-900">Estado actual</p>
                <p className="mt-1">
                  {promoCurrent?.imageUrl
                    ? "Hay un popup configurado."
                    : "Aun no existe un popup promocional."}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  {promoCurrent?.active
                    ? "Esta visible para los usuarios."
                    : "Esta oculto para los usuarios."}
                </p>
                {promoCurrent?.imageUrl && (
                  <button
                    type="button"
                    onClick={handleDeletePromo}
                    disabled={promoDeleting}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {promoDeleting ? "Eliminando..." : "Eliminar popup actual"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </ModalShell>
      )}

      {isAdmin && (
        <ModalShell
          open={showPromoBanner}
          onClose={() => setShowPromoBanner(false)}
          eyebrow="Banner de promociones"
          title="Configurar el banner de la portada"
          size="md"
          tone="dark"
        >
          <div className="p-4 sm:p-6">
            <AdminPromoBanner />
          </div>
        </ModalShell>
      )}

      {isAdmin && (
        <ModalShell
          open={isEditing}
          onClose={() => setIsEditing(false)}
          eyebrow="Mensaje del carrusel"
          title={editIndex === messages.length ? "Agregar mensaje" : "Editar mensaje"}
          size="sm"
        >
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <label className="text-sm font-medium text-gray-700">
              Texto que se muestra en la barra superior
            </label>

            <textarea
              className="h-24 w-full resize-y rounded-xl border border-gray-300 p-3 text-sm text-gray-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder="Escribe el mensaje"
              maxLength={140}
              autoFocus
            />

            <p className="text-xs text-gray-500">{editValue.length}/140</p>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={saveEdit}
                disabled={!editValue.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Check size={18} />
                Guardar
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default ScrollingHeader;








