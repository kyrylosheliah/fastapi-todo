import { cx } from "@/utils/cx";
import type { ComponentProps } from "react";

type ButtonType = undefined | "danger";

const styleButton = (type: ButtonType) => {
  switch (type) {
    case "danger":
      return "text-red-800 hover:text-red-500";
    case undefined:
      return "text-gray-600 hover:text-black";
  }
};

export default function ButtonText(props: {
  props?: ComponentProps<"button">;
  type?: ButtonType;
  children: React.ReactNode,
}) {
  return (
    <button
      type="button"
      {...props.props}
      className={cx(
        "items-center text-nowrap disabled:opacity-30 underline",
        styleButton(props.type),
        props.props?.className
      )}
      children={props.children}
    />
  );
}
