import { EntityMetadata } from "@/data/EntityMetadata";
import { StatusBadge } from "./StatusBadge";
import { StatusDTO } from "./StatusDTO";
import { IStatus } from "./IStatus";

export const StatusMetadata: EntityMetadata<
  IStatus,
  typeof StatusDTO
> = {
  apiPrefix: "/status",
  indexPagePrefix: "/statuses",
  singular: "Status",
  plural: "statuses",
  fields: {
    id: { label: "Id", type: "key", constant: true },
    name: { label: "Title", type: "text" },
    order: { label: "Order", type: "number", nullable: true },
  },
  relations: [
    {
      label: "Has tasks",
      apiPrefix: "/task",
      fkField: "status_id",
    },
  ],
  formSchema: StatusDTO,
  peekComponent: StatusBadge,
};
