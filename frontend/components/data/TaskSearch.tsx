"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { emptyTask } from "@/data/Task/TaskHooks";
import { ITask } from "@/data/Task/ITask";
import { IStatus } from "@/data/Status/IStatus";
import { ICategory } from "@/data/Category/ICategory";
import { EntityServiceRegistry } from "@/data/EntityServiceRegistry";
import { CategoryService } from "@/data/Category/CategoryService";
import { StatusService } from "@/data/Status/StatusService";
import { TaskService } from "@/data/Task/TaskService";
import { ArrowDownAZIcon, ArrowUpAZIcon } from "lucide-react";
import { TaskCard } from "@/components/todo/TaskCard";
import { EntityModalForm } from "@/components/data/EntityModalForm";

export default function TaskSearch() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [sortKey, setSortKey] = useState<"priority" | "created_at">("priority");

  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<ITask | null>(null);

  const service = EntityServiceRegistry["/task"];
  const metadata = service.metadata;
  const updateMutation = service.useUpdate();
  const silentUpdateMutation = service.useUpdate(undefined, true);
  const createMutation = service.useCreate(() => {
    setNewOpen(false);
  });
  const deleteMutation = service.useDelete(() => {
    setEditOpen(false);
    setEditTask(null);
  });

  const { data: statusesQuery, isPending: isStatusesQueryPending } =
    StatusService.useGetAll();
  const { data: categoriesQuery, isPending: isCategoriesQueryPending } =
    CategoryService.useGetAll();
  const { data: tasksQuery, isPending: isTasksQueryPending } =
    TaskService.useGetAll();

  const [statuses, setStatuses] = useState<IStatus[]>([]);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const [inProgressId, setInProgressId] = useState<number | undefined>(
    undefined
  );
  const [doneId, setDoneId] = useState<number | undefined>(undefined);
  const [binaryStatusesPresent, setBinaryStatusesPresent] =
    useState<boolean>(false);

  useEffect(() => {
    const newStatuses = statusesQuery || [];
    setStatuses(newStatuses as IStatus[]);
    const newInProgressId = newStatuses.find(
      (s) => s.name === "In Progress"
    )?.id;
    setInProgressId(newInProgressId);
    const newDoneId = newStatuses.find((s) => s.name === "Done")?.id;
    setDoneId(newDoneId);
    const newBinaryStatusesPresent =
      newDoneId !== undefined && newInProgressId !== undefined;
    setBinaryStatusesPresent(newBinaryStatusesPresent);
  }, [statusesQuery, isStatusesQueryPending]);
  useEffect(() => {
    setCategories((categoriesQuery || []) as ICategory[]);
  }, [categoriesQuery, isCategoriesQueryPending]);
  useEffect(() => {
    setTasks((tasksQuery || []) as ITask[]);
  }, [tasksQuery, isTasksQueryPending]);

  const [listVersion, setListVersion] = useState<number>(0);

  const isDone = (t: ITask) => t.status_id === doneId && doneId !== undefined;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = tasks.filter(
      (t) =>
        (!statusFilter || t.status_id === statusFilter) &&
        (!q ||
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q))
    );

    const done = list.filter(isDone);
    const notDone = list.filter((t) => !isDone(t));

    const sortByPriority = (a: ITask, b: ITask) => {
      const aPriority = a.priority ?? 0;
      const bPriority = b.priority ?? 0;

      return sortOrder === "asc" ? aPriority - bPriority : bPriority - aPriority;
    };

    notDone.sort(sortByPriority);
    done.sort(sortByPriority);

    return [...notDone, ...done];
  }, [listVersion, tasks, query, statusFilter, sortOrder]);

  async function toggleCompletion(task: ITask) {
    if (!binaryStatusesPresent) return;
    task.status_id = task.status_id === doneId! ? inProgressId! : doneId!;
    await silentUpdateMutation.mutateAsync({ id: task.id, data: task });
    setListVersion(listVersion + 1);
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
        <Select
          value={sortKey}
          onValueChange={(v) => setSortKey(v as "priority" | "created_at")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortOrder}
          onValueChange={(v) => setSortOrder(v as "asc" | "desc")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">
              <ArrowDownAZIcon /> Asc
            </SelectItem>
            <SelectItem value="desc">
              <ArrowUpAZIcon /> Desc
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <TaskCard
            key={"task__" + t.id}
            doneId={doneId}
            onCheckedChange={() => toggleCompletion(t)}
            task={t}
            category={categories.find((c) => c.id === t.category_id)?.name}
            status={statuses.find((s) => s.id === t.status_id)?.name}
            delete={() => deleteMutation.mutateAsync(t.id)}
            edit={() => {
              setEditTask(t);
              setEditOpen(true);
            }}
            className="max-w-3xl"
          />
        ))}
      </div>

      <EntityModalForm
        opened={newOpen}
        heading={`Edit ${metadata.singular}`}
        close={() => setNewOpen(false)}
        create={(newValues) => createMutation.mutateAsync(newValues)}
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
        delete={() => deleteMutation.mutateAsync(editTask ? editTask.id : 0)}
        entityId={editTask?.id}
        service={service}
      />
    </div>
  );
}
