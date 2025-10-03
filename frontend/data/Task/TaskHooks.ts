import { ITask } from "@/data/Task/ITask";

export const emptyTask = (): ITask => ({
  id: 0,
  title: "",
  description: "",
  due_date: null,
  status_id: null,
  category_id: null,
  priority: null,
  created_at: "",
});
