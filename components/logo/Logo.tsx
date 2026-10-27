type LogoProps = {
  size?: "sm" | "md" | "lg";
};

export default function Logo({
  size = "md",
}: LogoProps) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`${sizes[size]} flex shrink-0 items-center justify-center rounded-xl bg-[#0F589B] shadow-lg`}
      >
        <img
          src="/PhotoOS-brand-master.png"
          alt="PhotoOS"
          className="h-[78%] w-[78%] object-contain"
        />
      </div>

      <span className="text-xl font-bold tracking-tight text-white">
        PhotoOS
      </span>
    </div>
  );
}
