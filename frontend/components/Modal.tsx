import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cx } from "@/utils/cx";
import ButtonIcon from "./ButtonIcon";
import { XIcon } from "lucide-react";

export const Modal = (params: {
  children: ReactNode;
  opened: boolean;
  className?: string;
  icon?: ReactNode;
  heading: ReactNode;
  close: () => void;
}) => (
  <Dialog open={params.opened} onOpenChange={params.close}>
    <DialogContent
      className={cx(
        "p-0 gap-0 max-h-[80vh] flex flex-col",
        params.className
      )}
    >
      <DialogHeader className="w-full p-4 flex flex-row justify-between items-center border-b">
        <DialogTitle>
          {params.icon}
          {params.heading}
        </DialogTitle>
      </DialogHeader>
      <div className="p-4 overflow-auto">
        {params.children}
      </div>
    </DialogContent>
  </Dialog>
);
