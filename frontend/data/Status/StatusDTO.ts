import { z } from "zod";
import type { IStatus } from "./IStatus";

export const StatusDTO: z.ZodType<Omit<IStatus, "id">> = z.object({
  // id: number;
  name: z.string().min(1, "Name is required"),
  order: z.number().nullable(),
});

export type StatusFormValues = z.infer<typeof StatusDTO>;