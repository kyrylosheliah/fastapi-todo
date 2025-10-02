import { ITask } from "@/data/Task/ITask";
import { emitHttp, emitHttpJson } from "@/utils/api";

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

export const getStatuses = async () => emitHttpJson("GET", "/statuses");

export const getTasks = async () => emitHttpJson("GET", "/tasks");

export const getCategories = async () => emitHttpJson("GET", "/categories");

export const postTask = async (task: ITask) => await emitHttpJson("POST", "/tasks", task);

// export const putTask = async (task: ITask) => await emitHttpJson("PUT", `/tasks/${task.id}`, task);

export const patchTask = async (task: ITask) => await emitHttpJson("PATCH", `/tasks/${task.id}`, task);

export const fetchAllTaskData = async () => Promise.all([
  getStatuses().then(r => r.json()),
  getTasks().then(r => r.json()),
  getCategories().then(r => r.json()),
]);

export const deleteTask = async (task: ITask) => await emitHttp("DELETE", `/tasks/${task.id}`);
