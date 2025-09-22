interface LogoProps {
  size?: "sm" | "md" | "lg";
}

export default function Logo({ size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} bg-blue-500 rounded-lg flex items-center justify-center mr-3`}
      >
        <svg
          className={`${
            size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-7 h-7"
          } text-white`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18C9.24 18 7 15.76 7 13C7 10.24 9.24 8 12 8C14.76 8 17 10.24 17 13C17 15.76 14.76 18 12 18Z" />
        </svg>
      </div>
      <h1 className={`${textSizeClasses[size]} font-bold text-white`}>
        ChatterBox
      </h1>
    </div>
  );
}
