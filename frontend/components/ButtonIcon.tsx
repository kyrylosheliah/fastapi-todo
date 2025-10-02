import { cx } from "@/utils/cx";
import type { ComponentProps } from "react";

type ButtonIconType = undefined | "danger";

const styleButtonIcon = (type: ButtonIconType, disabled?: boolean) => {
  switch (type) {
    case "danger":
      return cx(
        "text-red-500 bg-red-100",
        !disabled && "hover:text-white hover:bg-red-500"
      );
    case undefined:
      return cx(
        "text-gray-600",
        !disabled && "hover:text-black hover:bg-gray-200"
      );
  }
};

export default function ButtonIcon(params: {
  props?: ComponentProps<"button">;
  type?: ButtonIconType;
  children: React.ReactNode,
  className?: string;
}) {
  return (
    <button
      // type={params.props?.type || "button"}
      type="button"
      {...params.props}
      className={cx(
        "font-medium text-sm text-nowrap",
        "relative text-center flex items-center justify-center",
        "p-2.5 rounded-lg",
        "disabled:opacity-30",
        "",
        styleButtonIcon(params.type, params.props?.disabled),
        params.props && params.props.className,
        params.className,
      )}
    >
      <div className="absolute left-0 top-0 right-0 bottom-0 flex justify-center items-center">
        {params.children}
      </div>
    </button>
  );
}
