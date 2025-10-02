import { EntityMetadata } from "@/data/EntityMetadata";
import { CategoryBadge } from "./CategoryBadge";
import { CategoryDTO } from "./CategoryDTO";
import { ICategory } from "./ICategory";

export const CategoryMetadata: EntityMetadata<
  ICategory,
  typeof CategoryDTO
> = {
  apiPrefix: "/category",
  indexPagePrefix: "/categories",
  singular: "Category",
  plural: "categories",
  fields: {
    id: { label: "Id", type: "key", constant: true },
    name: { label: "Title", type: "text" },
  },
  relations: [
    {
      label: "Has tasks",
      apiPrefix: "/task",
      fkField: "category_id",
    },
  ],
  formSchema: CategoryDTO,
  peekComponent: CategoryBadge,
};
