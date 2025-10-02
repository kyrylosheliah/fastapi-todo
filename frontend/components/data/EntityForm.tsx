import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type EntityService from "../../services/EntityService";
import { EntityFormField } from "./EntityFormField";
import type { Entity } from "../../types/Entity";
import ButtonText from "../ButtonText";

export const EntityForm = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
>(params: {
  edit?: boolean;
  onSubmit: (newFields: Omit<T, 'id'>) => void;
  entity: T;
  service: EntityService<T, TSchema>;
  breakPopover?: boolean;
}) => {
  const metadata = params.service.metadata;

  const defaultFormFields = params.service.getFormFields(params.entity);

  const form = useForm<Omit<T, 'id'>>({
    resolver: zodResolver(metadata.formSchema),
    defaultValues: defaultFormFields as any,
  });

  useEffect(() => {
    if (params.entity) {
      form.reset(defaultFormFields);
    }
  }, [params.entity, form]);

  const RootTag = params.edit ? "form" : "div";

  const onSubmit = params.edit
    ? form.handleSubmit((newFields: Omit<T, "id">) =>
        params.onSubmit(newFields)
      )
    : undefined;

  return (
    <RootTag
      onSubmit={onSubmit}
      className="flex flex-col gap-3 text-align-start"
    >
      {Object.keys(defaultFormFields).map((key: string) => (
        <EntityFormField
          edit={params.edit}
          key={`entity_form_field_${key}`}
          form={form}
          fieldKey={key as any}
          service={params.service}
          breakPopover={params.breakPopover}
        />
      ))}
      {params.edit && (
        <div className="flex flex-row justify-between items-center">
          <ButtonText
            props={{
              onClick: () => form.reset(),
              className: "self-end",
            }}
          >
            Reset
          </ButtonText>
          <ButtonText
            props={{
              type: "submit",
              className: "self-end",
            }}
          >
            Apply
          </ButtonText>
        </div>
      )}
    </RootTag>
  );
};
