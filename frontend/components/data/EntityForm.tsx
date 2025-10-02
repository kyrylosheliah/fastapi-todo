import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { EntityFormField } from "./EntityFormField";
import ButtonText from "../ButtonText";
import { type FieldValues } from "react-hook-form";
import { Entity } from "@/data/Entity";
import EntityService from "@/data/EntityService";

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

  const form = useForm<FieldValues>({
    resolver: zodResolver(metadata.formSchema as any), // TODO: typescript
    defaultValues: defaultFormFields as any,
  });

  useEffect(() => {
    if (params.entity) {
      form.reset(defaultFormFields);
    }
  }, [params.entity, form]);

  const RootTag = params.edit ? "form" : "div";

  const onSubmit = params.edit
    ? form.handleSubmit(((newFields: any) => // TODO: typescript
        params.onSubmit(newFields)
      ))
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
