import { ITask } from "./Task/ITask";

export interface HasId {
  id: number;
}

export type Entity = HasId | ITask; //| ICategory | IStatus;
