type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export default function Logo({
  size = "md",
}: LogoProps) {
  const sizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
  };

  return (
    <h1
      className={`font-bold tracking-tight text-white ${sizes[size]}`}
    >
      Photo<span className="text-orange-500">OS</span>
    </h1>
  );
}