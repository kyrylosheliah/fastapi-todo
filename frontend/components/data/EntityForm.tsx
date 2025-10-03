import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { EntityFormField } from "./EntityFormField";
import { type FieldValues } from "react-hook-form";
import { Entity } from "@/data/Entity";
import EntityService from "@/data/EntityService";
import { Button } from "@/components/ui/button";
import ButtonIcon from "@/components/ButtonIcon";
import { Trash2Icon } from "lucide-react";

export const EntityForm = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
>(params: {
  edit?: boolean;
  onSubmit: (newFields: Omit<T, 'id'>) => void;
  delete?: () => Promise<boolean>;
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
    ? form.handleSubmit(
        (newFields: any) => params.onSubmit(newFields), // TODO: typescript
        (m: any) => alert(`Invalid form ${JSON.stringify(m)}`)
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
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            className="self-end"
          >
            Reset
          </Button>
          {params.delete && (
            <ButtonIcon
              type="danger"
              children={<Trash2Icon size={16} />}
              props={{
                onClick: params.delete,
              }}
            />
          )}
          <Button type="button" onClick={onSubmit} className="self-end">
            Apply
          </Button>
        </div>
      )}
    </RootTag>
  );
};
