interface ButtonProps {
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function Button({
  type = "button",
  variant = "primary",
  children,
  onClick,
  disabled = false,
  className = "",
}: ButtonProps) {
  const baseClasses =
    "w-full py-3 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 disabled:bg-blue-400",
    secondary:
      "bg-slate-700 hover:bg-slate-600 text-white focus:ring-slate-500 disabled:bg-slate-500",
    ghost:
      "bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white focus:ring-slate-500",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
