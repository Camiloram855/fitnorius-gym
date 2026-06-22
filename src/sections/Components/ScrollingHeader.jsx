import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingCart, X, Pencil, Check, Plus, ImagePlus, Upload, EyeOff } from "lucide-react";
import { useCart } from "../../pages/CartContext";
import { useAuth } from "../../pages/AuthContext";
import API_URL from "../../config";

const HEADER_MESSAGES_API = "https://fitnorius-backend-production.up.railway.app/header-messages";


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
  const [promoFile, setPromoFile] = useState(null);
  const [promoPreview, setPromoPreview] = useState("");
  const [promoActive, setPromoActive] = useState(true);
  const [promoCurrent, setPromoCurrent] = useState(null);
  const [promoSaving, setPromoSaving] = useState(false);
  const [promoDeleting, setPromoDeleting] = useState(false);

  const { cartItems, removeFromCart } = useCart();
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch(HEADER_MESSAGES_API)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, []);

  useEffect(() => {
    if (!isAdmin || !showPromoModal) return;

    fetch(`${API_URL}/api/promotion-popup`)
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
    await fetch(HEADER_MESSAGES_API, {
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
    setEditValue("");   // Campo vacÃ­o
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

      const response = await fetch(`${API_URL}/api/promotion-popup/save`, {
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
      const response = await fetch(`${API_URL}/api/promotion-popup`, {
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
            {/* CLICK SOLO AQUÃƒÂ */}
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
          <button
            onClick={openPromoModal}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:px-4"
          >
            <ImagePlus size={18} />
            <span className="hidden sm:inline">Promo</span>
          </button>
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
                Tu carrito estÃ¡ vacÃ­o Ã°Å¸â€ºâ€™
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
                        {item.quantity} Ãƒâ€” ${item.price.toLocaleString()}
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

            {isAdmin && showPromoModal && (
        <div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm"
          onClick={closePromoModal}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-300"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">
                  Popup promocional
                </p>
                <h3 className="text-lg font-black text-gray-900">Configurar imagen emergente</h3>
              </div>

              <button
                type="button"
                onClick={closePromoModal}
                className="rounded-full bg-black/5 p-2 text-gray-600 transition hover:bg-black/10 hover:text-black cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

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
                  Si el popup esta oculto, no se mostrara a los usuarios aunque la imagen este guardada.
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
                  {promoSaving ? "Guardando..." : promoFile || promoCurrent?.imageUrl ? "Guardar popup" : "Seleccionar imagen"}
                </button>
              </div>

              <div className="flex flex-col gap-4 p-4 sm:p-6">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                  <p className="mb-3 text-sm font-semibold text-gray-800">Vista previa</p>
                  <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl bg-white">
                    {promoPreview ? (
                      <img
                        src={promoPreview}
                        alt="Vista previa popup"
                        className="max-h-[320px] w-full object-contain"
                      />
                    ) : (
                      <span className="px-4 text-center text-sm text-gray-400">
                        TodavÃ­a no hay imagen cargada
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
                  <p className="font-semibold text-gray-900">Estado actual</p>
                  <p className="mt-1">
                    {promoCurrent?.imageUrl ? "Hay un popup configurado." : "Aún no existe un popup promocional."}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    {promoCurrent?.active ? "Está visible para los usuarios." : "Está oculto para los usuarios."}
                  </p>
                  {promoCurrent?.imageUrl && (
                    <button
                      type="button"
                      onClick={handleDeletePromo}
                      disabled={promoDeleting}
                      className="mt-4 inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {promoDeleting ? "Eliminando..." : "Eliminar popup actual"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAdmin && isEditing && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md flex flex-col gap-3 rounded-2xl bg-white p-4 text-black shadow-2xl sm:p-5">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Editar mensaje</span>
              <button onClick={() => setIsEditing(false)}>
                <X size={18} />
              </button>
            </div>

            <textarea
              className="w-full h-20 rounded-md border p-2 text-sm"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />

            <button
              onClick={saveEdit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2 text-white hover:bg-gray-900"
            >
              <Check size={18} />
              Guardar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollingHeader;








