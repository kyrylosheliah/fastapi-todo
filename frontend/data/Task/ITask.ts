export interface ITask {
  id: number;
  title: string;
  description: string;
  due_date: string | null;
  status_id: number | null;
  category_id: number | null;
  priority: number | null;
  created_at: string;
}
