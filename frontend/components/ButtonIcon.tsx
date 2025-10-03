import { Button } from "@/components/ui/button";
import { cx } from "@/utils/cx";
import type { ComponentProps } from "react";

type ButtonIconType = undefined | "danger";

export default function ButtonIcon(params: {
  props?: ComponentProps<"button">;
  type?: ButtonIconType;
  children: React.ReactNode,
  className?: string;
}) {
  return (
    <Button
      // type={params.props?.type || "button"}
      type="button"
      variant={params.type === "danger" ? "destructive" : "ghost"}
      {...params.props}
      className={cx(
        "font-medium text-sm text-nowrap",
        "relative text-center flex items-center justify-center",
        "p-2.5 w-8 h-8",
        params.props && params.props.className,
        params.className,
      )}
    >
      <div className="absolute left-0 top-0 right-0 bottom-0 flex justify-center items-center">
        {params.children}
      </div>
    </Button>
  );
}
