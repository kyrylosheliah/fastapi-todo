import { z } from "zod";
import type { ITask } from "./ITask";

export const TaskDTO: z.ZodType<Omit<ITask, "id">> = z.object({
  // id: number;
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Title is required"),
  ownerId: z.number({ error: (val) => val === undefined ? "Owner is requried" : "Invalid input" }),
  due_date: z.string().nullable(),
  status_id: z.number().nullable(),
  category_id: z.number().nullable(),
  priority: z.number().nullable(),
  created_at: z.string().min(1, "Creation time is required"),
});

export type TaskFormValues = z.infer<typeof TaskDTO>;
