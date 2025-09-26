// src/components/ui/badge.jsx
export function Badge({ children, className = "" }) {
    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded ${className}`}
      >
        {children}
      </span>
    )
  }
  