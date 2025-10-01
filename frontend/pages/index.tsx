"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

type Status = { id: number; name: string; order?: number };
type Category = { id: number; name: string };
type Task = { id: number; title: string; description: string; due_date: string | null; status_id: number | null; category_id: number | null; priority?: number };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [catId, setCatId] = useState<number | null>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [catsOpen, setCatsOpen] = useState(false);
  const [catsQuery, setCatsQuery] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [statusesOpen, setStatusesOpen] = useState(false);
  const [newStatusName, setNewStatusName] = useState("");

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
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
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
    const updates: { id: number; status_id: number; priority: number }[] = [];
    sourceTasks.forEach((t, i) => updates.push({ id: t.id, status_id: sourceStatusId, priority: i }));
    if (sourceStatusId !== destStatusId) {
      destTasks.forEach((t, i) => updates.push({ id: t.id, status_id: destStatusId, priority: i }));
    }

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        const up = updates.find((u) => u.id === t.id);
        return up ? { ...t, status_id: up.status_id, priority: up.priority } : t;
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
    if (catId !== null) {
      payload.category_id = catId;
    }
    await axios.post(`${API}/tasks`, payload);
    setNewTaskOpen(false);
    setTitle("");
    setDesc("");
    setCatId(null);
    fetchAll();
  }

  async function saveTaskEdits() {
    if (!editTask) return;
    const payload: Record<string, unknown> = {
      title: editTask.title,
      description: editTask.description ?? "",
      category_id: editTask.category_id ?? null,
    };
    await axios.patch(`${API}/tasks/${editTask.id}`, payload);
    setEditTask(null);
    fetchAll();
  }

  async function addStatus() {
    if (!newStatusName.trim()) return;
    const maxOrder = Math.max(...statuses.map(s => s.order || 0), -1);
    await axios.post(`${API}/statuses`, { name: newStatusName.trim(), order: maxOrder + 1 });
    setNewStatusName("");
    fetchAll();
  }

  async function deleteStatus(statusId: number) {
    // Check if status is protected
    const status = statuses.find(s => s.id === statusId);
    if (status?.name === "In Progress" || status?.name === "Done") return;

    // Check if status has tasks
    const hasTasks = tasks.some(t => t.status_id === statusId);
    if (hasTasks) return;

    await axios.delete(`${API}/statuses/${statusId}`);
    fetchAll();
  }

  async function reorderStatuses(result: DropResult) {
    if (!result.destination) return;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    const newStatuses = [...statuses];
    const [moved] = newStatuses.splice(sourceIndex, 1);
    newStatuses.splice(destIndex, 0, moved);
    
    // Update order field
    const updates = newStatuses.map((status, index) => ({
      id: status.id,
      order: index
    }));

    for (const update of updates) {
      await axios.patch(`${API}/statuses/${update.id}`, { order: update.order });
    }

    fetchAll();
  }

  const filteredTasks = tasks.filter(t => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen flex-col">
      <div className="shrink-0 border-b border-foreground/10 p-3 flex items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Todo — Tailwind + shadcn</h2>
        <div className="flex items-center gap-2">
          <a className="text-sm underline" href="/search">Search page</a>
          <Button variant="outline" onClick={() => setCatsOpen(true)}>Categories</Button>
          <Button variant="outline" onClick={() => setStatusesOpen(true)}>Statuses</Button>
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
      </div>
      <div className="p-3">
        <input
          className="h-10 w-full max-w-md rounded-md border border-foreground/20 px-3"
          placeholder="Search tasks..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex grow items-stretch gap-3 overflow-x-auto p-3" id="board-scroll">
          {statuses.sort((a, b) => (a.order || 0) - (b.order || 0)).map((status) => (
            <Droppable droppableId={String(status.id)} key={status.id} renderClone={(provided, snapshot, rubric) => {
              const t = tasksByStatus(parseInt(rubric.source.droppableId)).filter(t => filteredTasks.some(ft => ft.id === t.id))[rubric.source.index];
              if (!t) return null;
              return (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="mt-2 w-[320px] rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900 ring-2 ring-foreground/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{t.title}</div>
                    <div className="ml-2 text-xs">
                      {t.category_id && (
                        <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-foreground/80">{categories.find(c => c.id === t.category_id)?.name}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-foreground/70">{t.description}</div>
                </div>
              );
            }}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="w-[360px] shrink-0">
                  <div
                    className={
                      "flex h-full flex-col rounded-lg border border-foreground/10 bg-background p-3 shadow-sm transition-colors" +
                      (snapshot.isDraggingOver ? " outline outline-2 outline-dashed outline-foreground/30 bg-foreground/5 outline-offset-[-2px]" : "")
                    }
                  >
                    <h4 className="text-base font-medium">{status.name}</h4>
                    <div className="mt-2 min-h-0 grow overflow-y-auto space-y-2">
                      {tasksByStatus(status.id).filter(t => filteredTasks.some(ft => ft.id === t.id)).map((t, idx) => (
                        <Draggable draggableId={String(t.id)} index={idx} key={t.id}>
                          {(prov, dragSnapshot) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              className={
                                "w-[320px] rounded-md bg-white p-2 shadow-sm dark:bg-zinc-900 transition-transform" +
                                (dragSnapshot.isDragging ? " ring-2 ring-foreground/50 scale-[1.01]" : "")
                              }
                              style={prov.draggableProps.style as React.CSSProperties}
                            >
                              <div className="flex items-center justify-between">
                                <div className="font-semibold">{t.title}</div>
                                <div className="ml-2 text-xs">
                                  {t.category_id && (
                                    <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-foreground/80">{categories.find(c => c.id === t.category_id)?.name}</span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-foreground/70">{t.description}</div>
                              <div className="mt-2 flex justify-end">
                                <Button size="sm" variant="outline" onClick={() => setEditTask(t)}>Edit</Button>
                              </div>
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

      {/* Categories Modal: list/search/add */}
      <Dialog open={catsOpen} onOpenChange={setCatsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categories</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input className="h-10 w-full rounded-md border border-foreground/20 px-3" placeholder="Search categories..." value={catsQuery} onChange={(e)=>setCatsQuery(e.target.value)} />
            <div className="max-h-[50vh] overflow-y-auto border border-foreground/10 rounded-md">
              {(categories.filter(c=>c.name.toLowerCase().includes(catsQuery.toLowerCase()))).map(c => (
                <div key={c.id} className="flex items-center justify-between px-3 py-2 border-b last:border-b-0 border-foreground/10">
                  <div>{c.name}</div>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Add new</label>
              <div className="flex gap-2">
                <input className="h-10 flex-1 rounded-md border border-foreground/20 px-3" value={newCatName} onChange={(e)=>setNewCatName(e.target.value)} placeholder="Category name" />
                <Button onClick={async ()=>{ if(!newCatName.trim()) return; await axios.post(`${API}/categories`, { name: newCatName.trim() }); setNewCatName(""); fetchAll(); }}>Add</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Statuses Modal */}
      <Dialog open={statusesOpen} onOpenChange={setStatusesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Statuses</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              {statuses.sort((a, b) => (a.order || 0) - (b.order || 0)).map((status) => (
                <div key={status.id} className="flex items-center justify-between px-3 py-2 border border-foreground/10 rounded-md">
                  <div>{status.name}</div>
                  <div className="flex gap-2">
                    {status.name !== "In Progress" && status.name !== "Done" && !tasks.some(t => t.status_id === status.id) && (
                      <Button size="sm" variant="outline" onClick={() => deleteStatus(status.id)}>Delete</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-2">
              <label className="text-sm">Add new status</label>
              <div className="flex gap-2">
                <input className="h-10 flex-1 rounded-md border border-foreground/20 px-3" value={newStatusName} onChange={(e) => setNewStatusName(e.target.value)} placeholder="Status name" />
                <Button onClick={addStatus}>Add</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Modal */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit task</DialogTitle>
          </DialogHeader>
          {editTask && (
            <div className="space-y-3">
              <div className="grid gap-1">
                <label className="text-sm">Title</label>
                <input className="h-10 rounded-md border border-foreground/20 px-3" value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Description</label>
                <textarea className="min-h-[80px] rounded-md border border-foreground/20 px-3 py-2" value={editTask.description ?? ""} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <label className="text-sm">Category</label>
                <Select value={editTask.category_id ? String(editTask.category_id) : "none"} onValueChange={(v: string) => setEditTask({ ...editTask, category_id: v === "none" ? null : parseInt(v) })}>
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
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={async () => { if (!editTask) return; await axios.delete(`${API}/tasks/${editTask.id}`); setEditTask(null); fetchAll(); }}>Delete</Button>
                <div>
                  <Button onClick={saveTaskEdits}>Save</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
