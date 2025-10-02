import { z } from "zod";
import type { ICategory } from "./ICategory";

export const CategoryDTO: z.ZodType<Omit<ICategory, "id">> = z.object({
  // id: number;
  name: z.string().min(1, "Name is required"),
});

export type CategoryFormValues = z.infer<typeof CategoryDTO>;