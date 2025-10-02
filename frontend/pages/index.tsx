"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { deleteTask, emptyTask, fetchAllTaskData, postTask, patchTask } from "@/data/Task/TaskHooks";
import { ITask } from "@/data/Task/ITask";
import { Checkbox } from "@/components/ui/checkbox";

type Status = { id: number; name: string; order?: number };
type Category = { id: number; name: string };

export default function SearchPage(){
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [inProgressId, setInProgressId] = useState<number | undefined>(undefined);
  const [doneId, setDoneId] = useState<number | undefined>(undefined);
  const [binaryStatusesPresent, setBinaryStatusesPresent] = useState<boolean>(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [sortKey, setSortKey] = useState<"priority"|"created_at">("priority");

  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [editTask, setEditTask] = useState<ITask | null>(null);

  useEffect(() => {
    if (dueDate && editTask) {
      setEditTask({...editTask, due_date: dueDate.toISOString()});
    }
  }, [dueDate]);

  async function fetchAll(){
    const [statuses, tasks, categories] = await fetchAllTaskData();
    setStatuses(statuses);
    setTasks(tasks);
    setCategories(categories);
    setInProgressId(statuses.find(s => s.name === "In Progress")?.id);
    setDoneId(statuses.find(s => s.name === "Done")?.id);
    setBinaryStatusesPresent(doneId !== undefined && inProgressId !== undefined);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    let list = tasks.filter(t =>
      (!statusFilter || t.status_id === statusFilter) &&
      (!q || t.title.toLowerCase().includes(q) || (t.description||"").toLowerCase().includes(q))
    );
    list = list.sort((a,b)=>{
      const av = (sortKey === "priority" ? (a.priority ?? 0) : new Date(a.created_at || 0).getTime());
      const bv = (sortKey === "priority" ? (b.priority ?? 0) : new Date(b.created_at || 0).getTime());
      return sortDir === "asc" ? av - bv : bv - av;
    })
    return list;
  }, [tasks, query, statusFilter, sortDir, sortKey]);

  async function addTask() {
    if(!editTask) return;
    await postTask(editTask);
    setEditTask(emptyTask());
    fetchAll();
    setNewOpen(false);
  }

  async function saveTask() {
    if(!editTask) return;
    await patchTask(editTask);
    setEditTask(emptyTask());
    fetchAll();
    setEditOpen(false);
  }

  async function removeTask(task: ITask) {
    await deleteTask(task);
    fetchAll();
    setEditOpen(false);
  }

  async function toggleCompletion(task: ITask) {
    if (!binaryStatusesPresent) return;
    task.status_id = task.status_id === doneId! ? inProgressId! : doneId!;
    await patchTask(task);
    fetchAll();
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <Input
          className="h-10 w-full max-w-md rounded-md border border-foreground/20 px-3"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2">
          {statuses.map((s) => (
            <button
              key={"task_chip_button_" + s.id}
              className={`rounded-full border px-3 py-1 text-sm ${
                statusFilter === s.id ? "bg-foreground text-background" : ""
              }`}
              onClick={() =>
                setStatusFilter(statusFilter === s.id ? null : s.id)
              }
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortDir} onValueChange={(v) => setSortDir(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setEditTask(emptyTask());
            setNewOpen(true);
          }}
        >
          New Task
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <div
            key={"task__" + t.id}
            className="rounded-md border border-foreground/10 bg-background p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              {binaryStatusesPresent && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={t.status_id === doneId}
                    onCheckedChange={() => toggleCompletion(t)}
                    className="h-4 w-4"
                  />
                  <div className="font-medium">{t.title}</div>
                </div>
              )}
              <div className="ml-2 text-xs">
                {t.category_id && (
                  <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-foreground/80">
                    {categories.find((c) => c.id === t.category_id)?.name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-xs text-foreground/70">{t.description}</div>
            <div className="mt-2 flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditTask(t);
                  setEditOpen(true);
                }}
              >
                Edit
              </Button>
              <Button size="sm" variant="outline" onClick={() => removeTask(t)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="space-y-3">
              <div className="grid gap-1">
                <label className="text-sm">Title</label>
                <Input
                  className="h-10 rounded-md border border-foreground/20 px-3"
                  value={editTask!.title}
                  onChange={(e) =>
                    setEditTask({ ...editTask!, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Description</label>
                <textarea
                  className="min-h-[80px] rounded-md border border-foreground/20 px-3 py-2"
                  value={editTask!.description}
                  onChange={(e) =>
                    setEditTask({ ...editTask!, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Status</label>
                <Select
                  value={
                    editTask!.status_id ? String(editTask!.status_id) : "none"
                  }
                  onValueChange={(v) =>
                    setEditTask({
                      ...editTask!,
                      status_id: v === "none" ? null : parseInt(v),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    {statuses.map((s) => (
                      <SelectItem key={"status_selection__" + s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Category</label>
                <Select
                  value={
                    editTask!.category_id
                      ? String(editTask!.category_id)
                      : "none"
                  }
                  onValueChange={(v) =>
                    setEditTask({
                      ...editTask!,
                      category_id: v === "none" ? null : parseInt(v),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={"category_selection__" + c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Priority</label>
                <Input
                  type="number"
                  onChange={(e) =>
                    setEditTask({
                      ...editTask!,
                      priority: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Due date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      data-empty={!dueDate}
                      className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
                    >
                      <CalendarIcon />
                      {dueDate ? (
                        format(dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                variant="outline"
                className="flex justify-end pt-2"
                onClick={addTask}
              >
                Create
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="space-y-3">
              <div className="grid gap-1">
                <label className="text-sm">Title</label>
                <Input
                  className="h-10 rounded-md border border-foreground/20 px-3"
                  value={editTask.title}
                  onChange={(e) =>
                    setEditTask({ ...editTask, title: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Description</label>
                <textarea
                  className="min-h-[80px] rounded-md border border-foreground/20 px-3 py-2"
                  value={editTask.description ?? ""}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Status</label>
                <Select
                  value={
                    editTask.status_id ? String(editTask.status_id) : "none"
                  }
                  onValueChange={(v) =>
                    setEditTask({
                      ...editTask,
                      status_id: v === "none" ? null : parseInt(v),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    {statuses.map((s) => (
                      <SelectItem key={"status_selection__" + s.id} value={String(s.id)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Category</label>
                <Select
                  value={
                    editTask.category_id ? String(editTask.category_id) : "none"
                  }
                  onValueChange={(v) =>
                    setEditTask({
                      ...editTask,
                      category_id: v === "none" ? null : parseInt(v),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={"category_selection__" + c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => removeTask(editTask)}>
                  Delete
                </Button>
                <div>
                  <Button onClick={saveTask}>Save</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
