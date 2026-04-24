import { display } from "@/app/fonts";
import { cn } from "@/lib/utils";
import Logo from "@/public/logo.svg";

export const Header = () => {
  return (
    <div
      className={cn(
        display.className,
        "pb-10x fixed inset-x-0 top-0 z-40 flex h-32 justify-center bg-background text-center font-black md:h-40",
      )}
    >
      <img src={Logo} alt="Logo" className="h-full py-4 pr-4" />
    </div>
  );
};
