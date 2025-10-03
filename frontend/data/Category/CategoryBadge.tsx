import { BadgeIcon } from "@/components/BadgeIcon";
import { ICategory } from "./ICategory";
import { ShapesIcon } from "lucide-react";

export const CategoryBadge = (e: ICategory) => {
  return BadgeIcon({
    children: e.name,
    icon: (
      <ShapesIcon size={16} />
    ),
    props: {},
  });
};
