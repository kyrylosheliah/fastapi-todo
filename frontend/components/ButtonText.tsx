import { Button } from "@/components/ui/button";
import { cx } from "@/utils/cx";
import type { ComponentProps } from "react";

type ButtonType = undefined | "danger";

export default function ButtonText(params: {
  props?: ComponentProps<"button">;
  type?: ButtonType;
  children: React.ReactNode,
}) {
  return (
    <Button
      type="button"
      variant={params.type === "danger" ? "destructive" : "ghost"}
      {...params.props}
      className={cx(
        "items-center text-nowrap disabled:opacity-30 underline",
        params.props?.className
      )}
      children={params.children}
    />
  );
}
