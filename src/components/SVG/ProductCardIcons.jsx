function iconProps(className = "") {
  return {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };
}

export function ShieldBadgeIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.2 19 6v5.2c0 4.8-3 8.8-7 9.8-4-1-7-5-7-9.8V6l7-2.8Z" />
      <path d="m9.2 12.2 1.9 1.9 3.7-4" />
    </svg>
  );
}

export function HexagonIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.2 4.8 15.8 4.8 20 12 15.8 19.2 8.2 19.2 4 12 8.2 4.8Z" />
      <path d="M9 8.8h6l1.7 3.2-1.7 3.2H9L7.3 12 9 8.8Z" />
    </svg>
  );
}

export function DumbbellIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9.5v5" />
      <path d="M18 9.5v5" />
      <path d="M8.2 8v8" />
      <path d="M15.8 8v8" />
      <path d="M10.2 11.5h3.6" />
      <path d="M4 12h2" />
      <path d="M18 12h2" />
    </svg>
  );
}

export function BagIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 8.5h10l-.8 10.3a2 2 0 0 1-2 1.7H9.8a2 2 0 0 1-2-1.7L7 8.5Z" />
      <path d="M9.5 8.5a2.5 2.5 0 0 1 5 0" />
    </svg>
  );
}

export function RulerIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 18.5h11l0-13h-11v13Z" />
      <path d="M10 6.5v4" />
      <path d="M13 6.5v2.2" />
      <path d="M10 10.5v2.2" />
      <path d="M13 12.7v2.2" />
      <path d="M16 7.6v3.2" />
    </svg>
  );
}

export function CartIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5h2l1.2 7.2h9.9l1.4-5.2H7.7" />
      <path d="M8.5 17.5a1.1 1.1 0 1 0 0 .1" />
      <path d="M16.5 17.5a1.1 1.1 0 1 0 0 .1" />
      <path d="M7 5.5 6.5 3.5H4" />
    </svg>
  );
}

export function StarIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.3L12 16.3 7.2 18.8l.9-5.3-3.9-3.8 5.4-.8L12 4Z" />
    </svg>
  );
}

export function MedalIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="4.5" />
      <path d="M10 14.2 8.8 20l3.2-2 3.2 2-1.2-5.8" />
      <path d="M8.2 4.5h3l1.2 2.2 1.2-2.2h3" />
    </svg>
  );
}

export function PlusIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5.5v13" />
      <path d="M5.5 12h13" />
    </svg>
  );
}

export function TargetIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7.2" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.8v2.7" />
      <path d="M21.2 12h-2.7" />
      <path d="M12 21.2v-2.7" />
      <path d="M5.5 12H2.8" />
    </svg>
  );
}

export function FlameIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.5 3.5c1.6 3-.4 4.9-1.7 6.4-1 1.2-1.8 2.1-1.8 3.8 0 2.4 1.8 4.4 4.5 4.4 2.9 0 5-2.1 5-5.1 0-3.7-2.8-6.4-5.9-9.5Z" />
      <path d="M10.2 14.2c.2-1.4.9-2.4 1.8-3.5" />
    </svg>
  );
}

export function HeartPulseIcon({ className = "" }) {
  return (
    <svg {...iconProps(className)} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 12.3h3.3l1.5-2.6 2.2 5.2 1.8-3.8h2.7l1.2 1.9h4" />
      <path d="M4.2 12a7.8 7.8 0 0 1 15.6 0c0 4.6-7.8 8.9-7.8 8.9S4.2 16.6 4.2 12Z" />
    </svg>
  );
}

export const PRODUCT_FEATURE_ICON_OPTIONS = [
  { value: "shield", label: "Escudo", Icon: ShieldBadgeIcon },
  { value: "hexagon", label: "Hexágono", Icon: HexagonIcon },
  { value: "dumbbell", label: "Mancuerna", Icon: DumbbellIcon },
  { value: "bag", label: "Peso", Icon: BagIcon },
  { value: "ruler", label: "Medida", Icon: RulerIcon },
  { value: "cart", label: "Carrito", Icon: CartIcon },
  { value: "star", label: "Estrella", Icon: StarIcon },
  { value: "medal", label: "Medalla", Icon: MedalIcon },
  { value: "plus", label: "Plus", Icon: PlusIcon },
  { value: "target", label: "Objetivo", Icon: TargetIcon },
  { value: "flame", label: "Fuego", Icon: FlameIcon },
  { value: "heart", label: "Corazón", Icon: HeartPulseIcon },
];

export const PRODUCT_FEATURE_ICON_MAP = PRODUCT_FEATURE_ICON_OPTIONS.reduce((map, item) => {
  map[item.value] = item.Icon;
  return map;
}, {});
