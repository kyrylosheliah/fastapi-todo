"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

type Status = { id: number; name: string };
type Category = { id: number; name: string };
type Task = { id: number; title: string; description: string; due_date: string | null; status_id: number | null; category_id: number | null };

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
    return tasks.filter((t) => (t.status_id ?? null) === statusId);
  }

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return;
    const taskId = parseInt(result.draggableId);
    const destStatusId = parseInt(result.destination.droppableId);
    await axios.patch(`${API}/tasks/${taskId}`, { status_id: destStatusId });
    fetchAll();
  }

  async function addTask() {
    const payload = {
      title,
      description: desc,
      due_date: dueDate || null,
      category_id: catId || null,
      status_id: statuses[0]?.id,
    };
    await axios.post(`${API}/tasks`, payload);
    setNewTaskOpen(false);
    setTitle("");
    setDesc("");
    setDueDate("");
    setCatId(null);
    fetchAll();
  }

  return (
    <div className="p-5">
      <div className="mb-4 flex items-center justify-between">
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
                <Select value={catId ? String(catId) : ""} onValueChange={(v) => setCatId(v ? parseInt(v) : null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">None</SelectItem>
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
        <div className="flex gap-3 overflow-x-auto">
          {statuses.map((status) => (
            <Droppable droppableId={String(status.id)} key={status.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="min-w-[300px]">
                  <div className="rounded-lg border border-foreground/10 bg-background p-3 shadow-sm">
                    <h4 className="text-base font-medium">{status.name}</h4>
                    {tasksByStatus(status.id).map((t, idx) => (
                      <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className="mt-2 rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900"
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
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
