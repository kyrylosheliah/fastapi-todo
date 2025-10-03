import { EntityForm } from "@/components/data/EntityForm";
import { Modal } from "@/components/Modal";
import { Entity } from "@/data/Entity";
import { entityDefaultValues } from "@/data/EntityMetadata";
import EntityService from "@/data/EntityService";
import { ReactNode } from "react";
import z from "zod";

export const EntityModalForm = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, "id">>,
>(params: {
  opened: boolean;
  icon?: ReactNode;
  heading: ReactNode;
  close: () => void;
  update?: (id: number, newValues: Omit<T, 'id'>) => Promise<boolean>;
  create?: (newValues: Omit<T, 'id'>) => Promise<boolean>;
  delete?: () => Promise<boolean>;
  entityId: number | undefined;
  service: EntityService<T, TSchema>;
}) => {
  const { data, isPending, isSuccess } = params.service.useGet(
    params.entityId || 0
  );
  return (
    <Modal
      opened={params.opened}
      icon={params.icon}
      heading={params.heading}
      close={params.close}
    >
      {params.create === undefined ? (
        isPending ? (
          <div>Loading ...</div>
        ) : isSuccess ? (
          <EntityForm
            edit
            delete={params.delete}
            service={params.service}
            entity={data as T}
            onSubmit={(newFields: Omit<T, "id">) =>
              params.update!(params.entityId!, newFields)
            }
          />
        ) : (
          <div>Error</div>
        )
      ) : (
        <EntityForm
          edit
          service={params.service}
          entity={entityDefaultValues(params.service.metadata.fields)}
          onSubmit={(newFields: Omit<T, "id">) => params.create!(newFields)}
        />
      )}
    </Modal>
  );
};
