import Image from "next/image";

export function PetAvatar({
  stage = 0,
  imageUrl,
  name = "Academy pet",
  size = "md",
  animated = true,
}: {
  stage?: number;
  imageUrl?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}) {
  const fallbackSize = ["text-4xl", "text-5xl", "text-6xl", "text-7xl"][stage] ?? "text-5xl";
  const dimensions = {
    sm: "h-24 w-24 rounded-[2rem]",
    md: "h-32 w-32 rounded-[2.2rem]",
    lg: "h-56 w-56 rounded-[3rem] sm:h-64 sm:w-64",
  };

  return (
    <div
      className={`${animated ? "pet-bounce" : ""} grid shrink-0 place-items-center overflow-hidden border-4 border-[#102A54] bg-[#FFF7E2] shadow-[6px_6px_0_rgba(16,42,84,0.18)] ${dimensions[size]}`}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          width={320}
          height={320}
          className="h-full w-full object-cover"
          priority={size === "lg"}
        />
      ) : (
        <span className={fallbackSize}>✦</span>
      )}
    </div>
  );
}
