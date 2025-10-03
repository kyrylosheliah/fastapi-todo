import { cx } from "@/utils/cx";
import React, {
  useEffect,
  useRef,
  type InputHTMLAttributes,
} from "react";

export const Checkbox: React.FC<{
  className?: string;
  attributes?: InputHTMLAttributes<HTMLInputElement>;
  valid?: boolean;
  indeterminate?: boolean;
}> = (params) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = params.indeterminate || false;
    }
  }, [params.indeterminate]);

  return (
    <input
      {...params.attributes}
      ref={inputRef}
      type="checkbox"
      className={cx(
        params.attributes?.className,
        "w-5 h-5 rounded-md! border flex items-center justify-center disabled:opacity-30",
        params.indeterminate && "text-gray-500 accent-gray-500",
      )}
    />
  );
};
