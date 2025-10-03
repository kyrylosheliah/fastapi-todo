import { BadgeIcon } from "@/components/BadgeIcon";
import { IStatus } from "./IStatus";
import { ActivityIcon } from "lucide-react";

export const StatusBadge = (e: IStatus) => {
  return BadgeIcon({
    children: e.name,
    icon: (
      <ActivityIcon size={16} />
    ),
    props: {},
  });
};
