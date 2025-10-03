import { ICategory } from "@/data/Category/ICategory";
import { ITask } from "./Task/ITask";
import { IStatus } from "@/data/Status/IStatus";

export interface HasId {
  id: number;
}

export type Entity = HasId | ITask | ICategory | IStatus;
