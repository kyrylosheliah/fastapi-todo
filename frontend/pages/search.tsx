"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

type Status = { id: number; name: string; order?: number };
type Category = { id: number; name: string };
type Task = { id: number; title: string; description: string; due_date: string | null; status_id: number | null; category_id: number | null; priority?: number; created_at: string };

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SearchPage(){
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Get protected status IDs
  const inProgressId = statuses.find(s => s.name === "In Progress")?.id;
  const doneId = statuses.find(s => s.name === "Done")?.id;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | null>(null);
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const [sortKey, setSortKey] = useState<"priority"|"created_at">("priority");

  const [newOpen, setNewOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [catId, setCatId] = useState<number | null>(null);
  const [stId, setStId] = useState<number | null>(null);

  useEffect(()=>{ fetchAll() },[]);
  async function fetchAll(){
    const [sRes, tRes, cRes] = await Promise.all([
      axios.get(`${API}/statuses`),
      axios.get(`${API}/tasks`),
      axios.get(`${API}/categories`),
    ]);
    setStatuses(sRes.data);
    setTasks(tRes.data);
    setCategories(cRes.data);
  }

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
  },[tasks, query, statusFilter, sortDir, sortKey]);

  async function addTask(){
    const payload: Record<string, unknown> = { title, description: desc, status_id: stId ?? statuses[0]?.id };
    if (catId !== null) payload.category_id = catId;
    await axios.post(`${API}/tasks`, payload);
    setNewOpen(false); setTitle(""); setDesc(""); setCatId(null); setStId(null); fetchAll();
  }

  async function saveTask(){
    if(!editTask) return;
    const payload: Record<string, unknown> = { title: editTask.title, description: editTask.description ?? "", category_id: editTask.category_id ?? null, status_id: editTask.status_id };
    await axios.patch(`${API}/tasks/${editTask.id}`, payload);
    setEditTask(null); fetchAll();
  }

  async function toggleCompletion(task: Task){
    const newStatusId = task.status_id === doneId ? inProgressId : doneId;
    await axios.patch(`${API}/tasks/${task.id}`, { status_id: newStatusId });
    fetchAll();
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <input className="h-10 w-full max-w-md rounded-md border border-foreground/20 px-3" placeholder="Search tasks..." value={query} onChange={(e)=>setQuery(e.target.value)} />
        <div className="flex gap-2">
          {statuses.map(s => (
            <button key={s.id} className={`rounded-full border px-3 py-1 text-sm ${statusFilter===s.id?"bg-foreground text-background":""}`} onClick={()=> setStatusFilter(statusFilter===s.id?null:s.id)}>{s.name}</button>
          ))}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <Select value={sortKey} onValueChange={(v)=> setSortKey(v as any)}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortDir} onValueChange={(v)=> setSortDir(v as any)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Direction" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={newOpen} onOpenChange={setNewOpen}>
          <DialogTrigger asChild><Button>New task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid gap-1"><label className="text-sm">Title</label><input className="h-10 rounded-md border border-foreground/20 px-3" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
              <div className="grid gap-1"><label className="text-sm">Description</label><textarea className="min-h-[80px] rounded-md border border-foreground/20 px-3 py-2" value={desc} onChange={(e)=>setDesc(e.target.value)} /></div>
              <div className="grid gap-1"><label className="text-sm">Status</label>
                <Select value={stId?String(stId):"none"} onValueChange={(v)=> setStId(v==="none"?null:parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    {statuses.map(s=> (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1"><label className="text-sm">Category</label>
                <Select value={catId?String(catId):"none"} onValueChange={(v)=> setCatId(v==="none"?null:parseInt(v))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map(c=> (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end pt-2"><Button onClick={addTask}>Create</Button></div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {filtered.map(t => (
          <div key={t.id} className="rounded-md border border-foreground/10 bg-background p-3 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={t.status_id === doneId}
                  onChange={() => toggleCompletion(t)}
                  className="h-4 w-4"
                />
                <div className="font-medium">{t.title}</div>
              </div>
              <div className="ml-2 text-xs">
                {t.category_id && (<span className="rounded-full border border-foreground/20 px-2 py-0.5 text-foreground/80">{categories.find(c => c.id === t.category_id)?.name}</span>)}
              </div>
            </div>
            <div className="text-xs text-foreground/70">{t.description}</div>
            <div className="mt-2 flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={()=> setEditTask(t)}>Edit</Button>
              <Button size="sm" variant="outline" onClick={async ()=> { await axios.delete(`${API}/tasks/${t.id}`); fetchAll(); }}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editTask} onOpenChange={(o)=> !o && setEditTask(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit task</DialogTitle></DialogHeader>
          {editTask && (
            <div className="space-y-3">
              <div className="grid gap-1"><label className="text-sm">Title</label><input className="h-10 rounded-md border border-foreground/20 px-3" value={editTask.title} onChange={(e)=> setEditTask({ ...editTask, title: e.target.value })} /></div>
              <div className="grid gap-1"><label className="text-sm">Description</label><textarea className="min-h-[80px] rounded-md border border-foreground/20 px-3 py-2" value={editTask.description ?? ""} onChange={(e)=> setEditTask({ ...editTask, description: e.target.value })} /></div>
              <div className="grid gap-1"><label className="text-sm">Status</label>
                <Select value={editTask.status_id?String(editTask.status_id):"none"} onValueChange={(v)=> setEditTask({ ...editTask, status_id: v==="none"?null:parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Default</SelectItem>
                    {statuses.map(s=> (<SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1"><label className="text-sm">Category</label>
                <Select value={editTask.category_id?String(editTask.category_id):"none"} onValueChange={(v)=> setEditTask({ ...editTask, category_id: v==="none"?null:parseInt(v) })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map(c=> (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={async ()=> { if(!editTask) return; await axios.delete(`${API}/tasks/${editTask.id}`); setEditTask(null); fetchAll(); }}>Delete</Button>
                <div><Button onClick={saveTask}>Save</Button></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}


