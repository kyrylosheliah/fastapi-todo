import type { ReactNode } from "react";
import ButtonIcon from "./ButtonIcon";
import { cx } from "@/utils/cx";
import { XIcon } from "lucide-react";

export const Modal = (params: {
  children: ReactNode;
  opened: boolean;
  className?: string;
  icon?: ReactNode;
  heading: ReactNode;
  close: () => void;
}) =>
  params.opened && (
    <div
      className={cx(
        "fixed z-50 left-0 right-0 top-0 bottom-0 p-4 flex flex-col items-center justify-center backdrop-blur-sm bg-transparent",
        params.className
      )}
    >
      <div className="max-h-full w-full max-w-lg">
        <div className="flex flex-col bg-white border rounded-md max-h-full">
          <div className="px-4 py-2 flex-shrink-0 flex flex-row justify-between items-center border-b">
            {params.icon}
            {params.heading}
            <ButtonIcon
              className="w-8 h-8"
              children={<XIcon />}
              props={{ onClick: params.close }}
            />
          </div>
          <div className="w-full flex-1 min-h-0 px-4 py-2 overflow-auto">
            {params.children}
          </div>
        </div>
      </div>
    </div>
  );
