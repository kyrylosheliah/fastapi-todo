import { BadgeIcon } from "@/components/BadgeIcon";
import { ActivityIcon } from "lucide-react";
import { FieldValues } from "react-hook-form";

export const StatusBadge = (e: FieldValues) => {
  return BadgeIcon({
    children: e.name,
    icon: (
      <ActivityIcon size={16} />
    ),
    props: {},
  });
};
