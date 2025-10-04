import { TaskService } from "@/data/Task/TaskService";
import { StatusService } from "@/data/Status/StatusService";
import { CategoryService } from "@/data/Category/CategoryService";
import EntityService from "@/data/EntityService";

export type EntityServiceRegistryKey = "/task" | "/status" | "/category";

export const EntityServiceRegistry: Record<EntityServiceRegistryKey, EntityService> = {
  "/task": TaskService,
  "/status": StatusService,
  "/category": CategoryService,
};
