import { BadgeIcon } from "@/components/BadgeIcon";
import { ShapesIcon } from "lucide-react";
import { FieldValues } from "react-hook-form";

export const CategoryBadge = (e: FieldValues) => {
  return BadgeIcon({
    children: e.name,
    icon: (
      <ShapesIcon size={16} />
    ),
    props: {},
  });
};
