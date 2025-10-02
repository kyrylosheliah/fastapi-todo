import { ITask } from "../data/task/interface";

export interface HasId {
  id: number;
}

export type Entity = HasId | ITask; //| ICategory | IStatus;
