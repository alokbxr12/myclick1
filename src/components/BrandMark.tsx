export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 72 56" fill="none" className={className} aria-hidden>
      <path
        d="M14.5 18.5h11l3.5-6h16l3.5 6h8.5c5 0 9 4 9 9v14c0 5-4 9-9 9H21c-5 0-9-4-9-9v-7"
        stroke="#F8FAFC"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M35 18.5h11" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" opacity=".55" />
      <circle cx="46" cy="34.5" r="11.5" stroke="#F8FAFC" strokeWidth="3.2" />
      <circle cx="46" cy="34.5" r="7" stroke="#FB5D68" strokeWidth="2.2" />
      <circle cx="46" cy="34.5" r="2.5" fill="#FFB15F" />
      <path d="M59.5 25.5h.01" stroke="#FFB15F" strokeWidth="4.5" strokeLinecap="round" />
      <path
        d="M7.5 38.5 17.5 25 23.5 35l9.5-12.5"
        stroke="#FB5D68"
        strokeWidth="4.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
