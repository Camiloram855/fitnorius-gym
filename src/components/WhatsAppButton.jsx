import "./FloatingActions.css";
// src/components/WhatsAppButton.jsx
export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/573043317223"
      target="_blank"
      rel="noopener noreferrer"
      className="floating-action floating-action--whatsapp"
    >
      <span className="floating-action__whatsapp-art">
      <img
        src="/img/whatsapp.png"
        alt="WhatsApp"
        draggable={false}
      />
      </span>
    </a>
  );
}
