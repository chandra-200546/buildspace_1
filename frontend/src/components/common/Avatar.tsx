type Props = {
  name: string;
  image?: string;
  size?: "sm" | "md" | "lg" | "xl";
};

const sizeMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl"
};

export function Avatar({ name, image, size = "md" }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className={`overflow-hidden rounded-full border border-border bg-zinc-900 ${sizeMap[size]}`}>
      {image ? (
        <img src={image} alt={name} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center font-semibold text-zinc-200">{initials || "U"}</div>
      )}
    </div>
  );
}

