// src/components/WhatsAppButton.jsx
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/573043317223"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 hover:scale-110 transition-transform duration-300"
    >
      <img
        src="/img/whatsapp.png"
        alt="WhatsApp"
        className="w-20 h-20 animate-bounce"
      />
    </a>
  );
}
