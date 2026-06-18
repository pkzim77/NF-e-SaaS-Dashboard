export default function Card({ children, className = '', padded = true, ...rest }) {
  return (
    <div
      className={`min-w-0 rounded-2xl border border-border bg-surface shadow-card ${padded ? 'p-[22px]' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
