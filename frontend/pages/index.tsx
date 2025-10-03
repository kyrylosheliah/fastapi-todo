"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { emptyTask, fetchAllTaskData } from "@/data/Task/TaskHooks";
import { ITask } from "@/data/Task/ITask";
import { IStatus } from "@/data/Status/IStatus";
import { ICategory } from "@/data/Category/ICategory";
import { TaskCard } from "@/components/todo/TaskCard";
import { EntityModalForm } from "@/components/data/EntityModalForm";
import { EntityServiceRegistry } from "@/data/EntityServiceRegistry";
import { CategoryService } from "@/data/Category/CategoryService";
import { StatusService } from "@/data/Status/StatusService";
import { TaskService } from "@/data/Task/TaskService";

export default function SearchPage(){
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc"|"desc">("asc");
  const [sortKey, setSortKey] = useState<"priority"|"created_at">("priority");

  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<ITask | null>(null);

  const service = EntityServiceRegistry["/task"];
  const metadata = service.metadata;
  const updateMutation = service.useUpdate();
  const createMutation = service.useCreate(() => {
    setNewOpen(false);
  });
  const deleteMutation = service.useDelete(() => {
    setEditOpen(false);
    setEditTask(null);
  });

  const { data: statusesQuery, isPending: isStatusesQueryPending } = StatusService.useGetAll();
  const { data: categoriesQuery, isPending: isCategoriesQueryPending } = CategoryService.useGetAll();
  const { data: tasksQuery, isPending: isTasksQueryPending } = TaskService.useGetAll();

  const [statuses, setStatuses] = useState<IStatus[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const [inProgressId, setInProgressId] = useState<number | undefined>(undefined);
  const [doneId, setDoneId] = useState<number | undefined>(undefined);
  const [binaryStatusesPresent, setBinaryStatusesPresent] = useState<boolean>(true);

  useEffect(() => {
    setStatuses(statusesQuery || []);
  }, [statusesQuery, isStatusesQueryPending]);
  useEffect(() => {
    setCategories(categoriesQuery || []);
  }, [categoriesQuery, isCategoriesQueryPending]);
  useEffect(() => {
    setTasks(tasksQuery || []);
  }, [tasksQuery, isTasksQueryPending]);

  useEffect(() => {
    setInProgressId(statuses.find(s => s.name === "In Progress")?.id);
    setDoneId(statuses.find(s => s.name === "Done")?.id);
    setBinaryStatusesPresent(doneId !== undefined && inProgressId !== undefined);
  }, [statuses]);

  const filtered = useMemo(()=>{
    const q = query.trim().toLowerCase();
    let list = tasks.filter(t =>
      (!statusFilter || t.status_id === statusFilter) &&
      (!q || t.title.toLowerCase().includes(q) || (t.description||"").toLowerCase().includes(q))
    );
    list = list.sort((a,b)=>{
      const av = (sortKey === "priority" ? (a.priority ?? 0) : new Date(a.created_at || 0).getTime());
      const bv = (sortKey === "priority" ? (b.priority ?? 0) : new Date(b.created_at || 0).getTime());
      return sortOrder === "asc" ? av - bv : bv - av;
    })
    return list;
  }, [tasks, query, statusFilter, sortOrder, sortKey]);

  async function toggleCompletion(task: ITask) {
    if (!binaryStatusesPresent) return;
    task.status_id = task.status_id === doneId! ? inProgressId! : doneId!;
    await updateMutation.mutateAsync({ id: task.id, data: task });
  }

  return (
    <div className="p-4 gap-4 flex flex-col items-center justify-center">
      <div className="gap-4 flex items-center">
        <Input
          className="h-10 w-full max-w-md rounded-md border border-foreground/20 px-3"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
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

      <div className="flex items-center justify-center gap-4">
        <span>Status: </span>
        {statuses.map((s) => (
          <button
            key={"task_chip_button_" + s.id}
            className={`rounded-full border px-3 py-1 text-sm ${
              statusFilter === s.id ? "bg-foreground text-background" : ""
            }`}
            onClick={() => setStatusFilter(statusFilter === s.id ? null : s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as any)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as any)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <TaskCard
            key={"task__" + t.id}
            canCheck={binaryStatusesPresent}
            doneId={(binaryStatusesPresent && doneId) || 0}
            onCheckedChange={() => toggleCompletion(t)}
            task={t}
            category={categories.find((c) => c.id === t.category_id)?.name}
            delete={() => deleteMutation.mutateAsync(editTask?.id)}
            edit={() => {
              setEditTask(t);
              setEditOpen(true);
            }}
          />
        ))}
      </div>

      <EntityModalForm
        opened={newOpen}
        heading={`Edit ${metadata.singular}`}
        close={() => setNewOpen(false)}
        create={(newValues) =>
          createMutation.mutateAsync(newValues)
        }
        entityId={editTask?.id}
        service={service}
      />

      <EntityModalForm
        opened={editOpen}
        heading={`Edit ${metadata.singular}`}
        close={() => setEditOpen(false)}
        update={(id, newValues) =>
          updateMutation.mutateAsync({ id, data: newValues })
        }
        delete={() =>
          deleteMutation.mutateAsync(editTask?.id)
        }
        entityId={editTask?.id}
        service={service}
      />
    </div>
  );
}
