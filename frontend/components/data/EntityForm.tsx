import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FieldErrors, FieldValues, useForm } from "react-hook-form";
import { EntityFormField } from "./EntityFormField";
import { Entity } from "@/data/Entity";
import EntityService from "@/data/EntityService";
import { Button } from "@/components/ui/button";
import ButtonIcon from "@/components/ButtonIcon";
import { Trash2Icon } from "lucide-react";

export const EntityForm = (params: {
  edit?: boolean;
  onSubmit: (newFields: FieldValues) => void;
  delete?: () => Promise<boolean>;
  entity: FieldValues;
  service: EntityService;
  breakPopover?: boolean;
}) => {
  const metadata = params.service.metadata;

  const defaultFormFields = params.service.getFormFields(params.entity);

  const form = useForm<FieldValues>({
    resolver: zodResolver(metadata.formSchema as any), // TODO: typescript
    defaultValues: defaultFormFields,
  });

  useEffect(() => {
    if (params.entity) {
      form.reset(defaultFormFields);
    }
  }, [params.entity, form, defaultFormFields]);

  const RootTag = params.edit ? "form" : "div";

  const onSubmit = params.edit
    ? form.handleSubmit(
        (newFields: FieldValues) => params.onSubmit(newFields),
        (m: FieldErrors<FieldValues>) => alert(`Invalid form ${JSON.stringify(m)}`)
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
