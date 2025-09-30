"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

type Status = { id: number; name: string };
type Category = { id: number; name: string };
type Task = { id: number; title: string; description: string; due_date: string | null; status_id: number | null; category_id: number | null; position?: number };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [catId, setCatId] = useState<number | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    const [sRes, tRes, cRes] = await Promise.all([
      axios.get(`${API}/statuses`),
      axios.get(`${API}/tasks`),
      axios.get(`${API}/categories`),
    ]);
    setStatuses(sRes.data);
    setTasks(tRes.data);
    setCategories(cRes.data);
  }

  function tasksByStatus(statusId: number | null) {
    return tasks
      .filter((t) => (t.status_id ?? null) === statusId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const sourceStatusId = parseInt(result.source.droppableId);
    const destStatusId = parseInt(result.destination.droppableId);
    const draggableId = parseInt(result.draggableId);

    // Build new local ordering per column
    const sourceTasks = tasksByStatus(sourceStatusId);
    const destTasks = sourceStatusId === destStatusId ? sourceTasks.slice() : tasksByStatus(destStatusId);

    const movedTaskIndex = sourceTasks.findIndex((t) => t.id === draggableId);
    const [moved] = sourceTasks.splice(movedTaskIndex, 1);
    if (sourceStatusId === destStatusId) {
      sourceTasks.splice(result.destination.index, 0, moved);
    } else {
      destTasks.splice(result.destination.index, 0, { ...moved, status_id: destStatusId });
    }

    // Recompute positions
    const updates: { id: number; status_id: number; position: number }[] = [];
    sourceTasks.forEach((t, i) => updates.push({ id: t.id, status_id: sourceStatusId, position: i }));
    if (sourceStatusId !== destStatusId) {
      destTasks.forEach((t, i) => updates.push({ id: t.id, status_id: destStatusId, position: i }));
    }

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        const up = updates.find((u) => u.id === t.id);
        return up ? { ...t, status_id: up.status_id, position: up.position } : t;
      })
    );

    // Persist to backend
    await axios.post(`${API}/tasks/reorder`, updates);
  }

  async function addTask() {
    const payload: Record<string, unknown> = {
      title,
      description: desc,
      status_id: statuses[0]?.id,
    };
    if (dueDate.trim() !== "") {
      payload.due_date = new Date(dueDate).toISOString();
    }
    if (catId !== null) {
      payload.category_id = catId;
    }
    await axios.post(`${API}/tasks`, payload);
    setNewTaskOpen(false);
    setTitle("");
    setDesc("");
    setDueDate("");
    setCatId(null);
    fetchAll();
  }

  return (
    <div className="flex h-screen flex-col">
      <div className="shrink-0 border-b border-foreground/10 p-3 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Todo — Tailwind + shadcn</h2>
        <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
          <DialogTrigger asChild>
            <Button>New task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New task</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-1">
                <label className="text-sm">Title</label>
                <input className="h-10 rounded-md border border-foreground/20 px-3" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Description</label>
                <textarea className="min-h-[80px] rounded-md border border-foreground/20 px-3 py-2" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Due date (ISO)</label>
                <input className="h-10 rounded-md border border-foreground/20 px-3" placeholder="2025-09-30T12:00:00" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Category</label>
                <Select value={catId ? String(catId) : ""} onValueChange={(v: string) => setCatId(v === "none" ? null : parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={addTask}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex grow items-stretch gap-3 overflow-x-auto p-3" id="board-scroll">
          {statuses.map((status) => (
            <Droppable droppableId={String(status.id)} key={status.id}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="w-[360px] shrink-0">
                  <div
                    className={
                      "flex h-full flex-col rounded-lg border border-foreground/10 bg-background p-3 shadow-sm transition-colors" +
                      (snapshot.isDraggingOver ? " outline outline-2 outline-dashed outline-foreground/30 bg-foreground/5 outline-offset-[-2px]" : "")
                    }
                  >
                    <h4 className="text-base font-medium">{status.name}</h4>
                    <div className="mt-2 min-h-0 grow overflow-y-auto">
                      {tasksByStatus(status.id).map((t, idx) => (
                        <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                          {(prov, dragSnapshot) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={
                                "mt-2 w-[320px] rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900 transition-transform" +
                                (dragSnapshot.isDragging ? " ring-2 ring-foreground/50 scale-[1.01]" : "")
                              }
                              style={prov.draggableProps.style as React.CSSProperties}
                            >
                              <div className="font-semibold">{t.title}</div>
                              <div className="text-xs text-foreground/70">{t.description}</div>
                              <div className="text-xs text-foreground/50">{t.due_date ? new Date(t.due_date).toLocaleString() : ""}</div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
