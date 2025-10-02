import { TaskService } from "@/data/Task/TaskService";
import { StatusService } from "@/data/Status/StatusService";
import { CategoryService } from "@/data/Category/CategoryService";

export const EntityServiceRegistry = {
  "/task": TaskService,
  "/status": StatusService,
  "/category": CategoryService,
};
