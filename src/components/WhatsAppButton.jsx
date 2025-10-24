// src/components/WhatsAppButton.jsx
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/573043317223"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 hover:scale-110 transition-transform duration-300"
    >
      <img
        src="/img/whatsapp.png"
        alt="WhatsApp"
        className="w-16 h-16 sm:w-20 sm:h-20 animate-bounce"
      />
    </a>
  );
}
