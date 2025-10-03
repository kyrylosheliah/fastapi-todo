import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cx } from "@/utils/cx";

export const Modal = (params: {
  children: ReactNode;
  opened: boolean;
  className?: string;
  icon?: ReactNode;
  heading: ReactNode;
  footing?: ReactNode;
  close: () => void;
}) => {
  const commonClasses =
    "w-full p-4 flex flex-row justify-between items-center border-b";
  return (
    <Dialog open={params.opened} onOpenChange={params.close}>
      <DialogContent
        className={cx("p-0 gap-0 max-h-[80vh] flex flex-col", params.className)}
      >
        <DialogHeader className={commonClasses}>
          <DialogTitle>
            {params.icon}
            {params.heading}
          </DialogTitle>
        </DialogHeader>
        <div className="p-4 overflow-auto">{params.children}</div>
        {params.footing && (
          <DialogFooter className={commonClasses}>
            {params.footing}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
