import { BadgeIcon } from "@/components/BadgeIcon";
import { ListIcon } from "lucide-react";
import { FieldValues } from "react-hook-form";

export const TaskBadge = (e: FieldValues) => {
  return BadgeIcon({
    children: e.title,
    icon: (
      <ListIcon size={16} />
    ),
    props: {},
  });
};
