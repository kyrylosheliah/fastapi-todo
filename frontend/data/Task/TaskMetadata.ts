import { EntityMetadata } from "@/data/EntityMetadata";
import { TaskBadge } from "./TaskBadge";
import { TaskDTO } from "./TaskDTO";

export const TaskMetadata: EntityMetadata = {
  apiPrefix: "/task",
  indexPagePrefix: "/tasks",
  singular: "Task",
  plural: "tasks",
  fields: {
    id: { label: "Id", type: "key", constant: true },
    title: { label: "Title", type: "text" },
    description: { label: "Description", type: "text" },
    due_date: { label: "Due date", type: "date", nullable: true },
    status_id: {
      label: "Status",
      type: "fkey",
      apiPrefix: "/status",
    },
    category_id: {
      label: "Category",
      type: "fkey",
      apiPrefix: "/category",
    },
    priority: { label: "Priority", type: "number" },
    created_at: { label: "Creation time", type: "date" },
  },
  relations: [
    {
      label: "Has status",
      apiPrefix: "/status",
      fkField: "status_id",
    },
    {
      label: "Has category",
      apiPrefix: "/category",
      fkField: "category_id",
    },
  ],
  formSchema: TaskDTO,
  peekComponent: TaskBadge,
};
