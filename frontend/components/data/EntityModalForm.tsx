import { EntityForm } from "@/components/data/EntityForm";
import { Modal } from "@/components/Modal";
import { entityDefaultValues } from "@/data/EntityMetadata";
import EntityService from "@/data/EntityService";
import { ReactNode } from "react";
import { FieldValues } from "react-hook-form";

export const EntityModalForm = (params: {
  opened: boolean;
  icon?: ReactNode;
  heading: ReactNode;
  close: () => void;
  update?: (id: number, newValues: FieldValues) => Promise<boolean>;
  create?: (newValues: FieldValues) => Promise<boolean>;
  delete?: () => Promise<boolean>;
  entityId: number | undefined;
  service: EntityService;
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
        ) : isSuccess && data ? (
          <EntityForm
            edit
            delete={params.delete}
            service={params.service}
            entity={data}
            onSubmit={(newFields: FieldValues) =>
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
          onSubmit={(newFields: FieldValues) => params.create!(newFields)}
        />
      )}
    </Modal>
  );
};
