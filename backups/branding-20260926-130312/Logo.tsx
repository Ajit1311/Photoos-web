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
    <h1 className={`${sizes[size]} font-bold tracking-tight`}>
      <span className="text-slate-900">Photo</span>
      <span className="text-[#0A3F61]">OS</span>
    </h1>
  );
}