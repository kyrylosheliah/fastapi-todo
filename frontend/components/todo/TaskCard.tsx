import ButtonIcon from "@/components/ButtonIcon";
import { EntityFieldDisplay } from "@/components/data/EntityFieldDisplay";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ITask } from "@/data/Task/ITask";
import { TaskService } from "@/data/Task/TaskService";
import { cx } from "@/utils/cx";
import { SquarePen } from "lucide-react";

export function TaskCard(params: {
  task: ITask,
  doneId?: number,
  onCheckedChange: () => void,
  edit?: () => void,
  delete?: () => void,
  category?: string,
  status?: string,
  className?: string,
}) {
  const service = TaskService;
  const done = params.doneId !== undefined && params.task.status_id === params.doneId;
  const expired = (params.task.due_date === null) ? (false) : (new Date(params.task.due_date).getDay() < new Date().getDay());
  return (
    <div
      className={cx(
        "p-2 gap-1 rounded-md border border-foreground/10 shadow-sm flex flex-col items-start justify-start",
        done ? "opacity-50" : expired && "border-red-400 dark:border-red-700",
        params.className
      )}
    >
      <div className="w-full gap-2 flex flex-row items-start justify-between">
        <Checkbox
          checked={done}
          onCheckedChange={params.onCheckedChange}
          className="w-5 h-5"
        />
        <div className="font-medium flex-1">{params.task.title}</div>
        <div className="justify-end gap-2 flex flex-row items-center justify-center">
          {params.task.category_id && (
            <Badge variant="outline" className="text-xs text-foreground/60">
              {params.category}
            </Badge>
          )}
          {(params.edit || params.delete) && (
            <div className="">
              {params.edit && (
                <ButtonIcon
                  props={{
                    onClick: params.edit,
                  }}
                  className="w-5 h-5"
                >
                  <SquarePen size={16} />
                </ButtonIcon>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="text-xs text-foreground/70">
        {params.task.description}
      </div>
      <div className="text-xs gap-1.5 flex flex-row items-center justify-start">
        Created at:
        <EntityFieldDisplay
          fieldValue={params.task.created_at}
          fieldKey="created_at"
          service={service}
        />
      </div>
      {params.task.due_date && (
        <div className="text-xs gap-1.5 flex flex-row items-center justify-start">
          Due to:
          <EntityFieldDisplay
            fieldValue={params.task.due_date}
            fieldKey="due_date"
            service={service}
          />
        </div>
      )}
      <div className="w-full text-xs flex flex-row items-center justify-between gap-2">
        <div className="text-xs self-end flex flex-row items-center gap-2">
          <span>Priority:</span>
          {params.task.priority}
        </div>
        {params.status && (
          <div className="text-xs self-end flex flex-row items-center gap-2">
            <span>status:</span>
            {params.status}
          </div>
        )}
      </div>
    </div>
  );
}