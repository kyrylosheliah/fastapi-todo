import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ITask } from "@/data/Task/ITask";

export function TaskCard(params: {
  canCheck: boolean, // binaryStatusesPresent
  task: ITask,
  doneId: number,
  onCheckedChange: () => void, // () => toggleCompletion(t)
  edit?: () => void, // () => { setEditTask(t); setEditOpen(true); }
  delete?: () => void, // () => removeTask(t)
  category?: string, // categories.find((c) => c.id === params.task.category_id)?.name
}) {
  return (
    <div className="rounded-md border border-foreground/10 bg-background p-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {params.canCheck && (
            <Checkbox
              checked={params.task.status_id === params.doneId}
              onCheckedChange={params.onCheckedChange}
              className="h-4 w-4"
            />
          )}
          <div className="font-medium">{params.task.title}</div>
        </div>
        <div className="ml-2 text-xs">
          {params.task.category_id && (
            <span className="rounded-full border border-foreground/20 px-2 py-0.5 text-foreground/80">
              {params.category}
            </span>
          )}
        </div>
      </div>
      <div className="text-xs text-foreground/70">
        {params.task.description}
      </div>
      {(params.edit || params.delete) && (
        <div className="mt-2 flex justify-end gap-2">
          {params.edit && (
            <Button size="sm" variant="outline" onClick={params.edit}>
              Edit
            </Button>
          )}
          {params.delete && (
            <Button size="sm" variant="outline" onClick={params.delete}>
              Delete
            </Button>
          )}
        </div>
      )}
    </div>
  );
}