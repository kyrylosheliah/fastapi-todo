import { BadgeIcon } from "@/components/BadgeIcon";
import { ITask } from "./ITask";
import { ListIcon } from "lucide-react";

export const TaskBadge = (e: ITask) => {
  return BadgeIcon({
    children: e.title,
    icon: (
      <ListIcon size={16} />
    ),
    props: {},
  });
};
