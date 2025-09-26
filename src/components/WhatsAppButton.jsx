// src/components/WhatsAppButton.jsx
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/573043317223"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-0 right-6 z-50 hover:scale-110 transition-transform"
    >
      <img
        src="/img/whatsapp.png"
        alt="WhatsApp"
        className="w-28 h-28 animate-bounce" // 👈 animación sencilla
      />
    </a>
  );
}
