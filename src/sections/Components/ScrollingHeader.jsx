import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingCart, X, Pencil, Check, Plus } from "lucide-react";
import { useCart } from "../../pages/CartContext";
import { useAuth } from "../../pages/AuthContext";

const API_URL = "https://fitnorius-backend-production.up.railway.app/header-messages";


const ScrollingHeader = () => {
  const { isAdmin } = useAuth();

  const [messages, setMessages] = useState([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState("enter");
  const [resetting, setResetting] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [editIndex, setEditIndex] = useState(0);

  const { cartItems, removeFromCart } = useCart();
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => setMessages(data.messages || []))
      .catch(() => setMessages([]));
  }, []);

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
    await fetch(API_URL, {
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
    setEditValue("");   // Campo vacío
    setEditIndex(messages.length); // Se agrega al final
    setIsEditing(true); // Abrir modal
  };


  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const getImageUrl = (path) => {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http")) return path;
    return `http://localhost:8080/${path}`;
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
            {/* CLICK SOLO AQUÍ */}
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
      <div className="flex items-center gap-4 relative z-[300]">
        <Link
          to="/catalog/login"
          className="p-2 rounded-full bg-white/10 hover:bg-white/20"
        >
          <User size={20} />
        </Link>

        <button
          onClick={() => setShowCart(!showCart)}
          className="relative p-2 rounded-full bg-white/10 hover:bg-white/20"
        >
          <ShoppingCart size={20} />
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
              {cartItems.length}
            </span>
          )}
        </button>

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
                Tu carrito está vacío 🛒
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
                        {item.quantity} × ${item.price.toLocaleString()}
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

      {isAdmin && isEditing && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white text-black p-3 rounded-xl shadow-2xl w-[350px] flex flex-col gap-3 z-[9999]">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Editar mensaje</span>
            <button onClick={() => setIsEditing(false)}>
              <X size={18} />
            </button>
          </div>

          <textarea
            className="w-full p-2 border rounded-md h-20 text-sm"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />

          <button
            onClick={saveEdit}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-900 flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Guardar
          </button>
        </div>
      )}
    </div>
  );
};

export default ScrollingHeader;
