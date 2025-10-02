import { useMemo, useState, useEffect } from "react";
import { type FieldValues, type UseFormReturn, type Path, useWatch } from "react-hook-form";
import type { z } from "zod";
import { cx } from "../../utils/cx";
import { EntityFieldDisplay } from "./EntityFieldDisplay";
import { EntityTable } from "./EntityTable";
import ButtonText from "../ButtonText";
import ButtonIcon from "../ButtonIcon";
import { CheckIcon, CircleOffIcon, EditIcon, PlusIcon } from "lucide-react";
import { Checkbox } from "../Checkbox";
import { Modal } from "../Modal";
import { Entity } from "@/data/Entity";
import { DatabaseType, fieldMetadataInitialValue } from "@/data/EntityMetadata";
import { SearchParams, defaultSearchParams } from "@/data/Search";
import EntityService from "@/data/EntityService";
import { EntityServiceRegistry } from "@/data/entityServiceRegistry";

export const EntityFormField = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
  EntityFormValues extends FieldValues
>(params: {
  edit?: boolean;
  service: EntityService<T, TSchema>;
  form: UseFormReturn<EntityFormValues>;
  fieldKey: (keyof T) & (keyof TSchema) & Path<EntityFormValues>;
  breakPopover?: boolean;
}) => {
  const metadata = params.service.metadata;

  const errors = params.form.formState.errors;

  const fieldMetadata = params.service.metadata.fields[params.fieldKey];

  const keyOrConst =
    fieldMetadata.constant === true || fieldMetadata.type === "key";

  const fieldValue = useWatch({
    control: params.form.control,
    name: params.fieldKey,
  });

  const isDirty: boolean | undefined = useMemo(
    () => (params.form.formState.dirtyFields as any)[params.fieldKey],
    [params.form.formState.dirtyFields, fieldValue]
  );

  return (
    <div>
      <div className="gap-2 flex flex-row items-center justify-between">
        <div className="gap-2 flex flex-row items-center">
          <label
            htmlFor={params.fieldKey.toString()}
            children={metadata.fields[params.fieldKey].label}
            className="block text-sm fw-700 text-gray-900"
          />
          <EntityFieldIcon fieldType={metadata.fields[params.fieldKey].type} />
        </div>
        {params.edit && !keyOrConst && (
          <div className="flex flex-row gap-2">
            {isDirty && (
              <ButtonText
                props={{
                  onClick: () => params.form.resetField(params.fieldKey),
                  className: "text-sm",
                }}
              >
                reset?
              </ButtonText>
            )}
            {fieldMetadata.nullable === true && fieldValue !== null && (
              <ButtonText
                props={{
                  onClick: () =>
                    params.form.setValue(params.fieldKey, null as any),
                  className: "text-sm",
                }}
              >
                unset?
              </ButtonText>
            )}
          </div>
        )}
      </div>
      {params.edit ? (
        <EntityFieldControl
          fieldKey={params.fieldKey}
          fieldValue={fieldValue}
          form={params.form}
          service={params.service}
        />
      ) : (
        <EntityFieldDisplay
          fieldKey={params.fieldKey}
          fieldValue={params.form.getValues(params.fieldKey)}
          service={params.service}
          breakPopover={params.breakPopover}
        />
      )}
      {errors[params.fieldKey] && (
        <p className="text-red-600 text-xs m-0">
          {errors[params.fieldKey]?.message?.toString()}
        </p>
      )}
    </div>
  );
}

const EntityFieldIcon = (params: {
  fieldType: DatabaseType
}) => {
  let children: any;
  switch (params.fieldType) {
    case "key":
      children = "KEY";
      break;
    case "boolean":
      children = "Y/N";
      break;
    case "text":
      children = "TXT";
      break;
    case "fkey":
      children = "FK";
      break;
  }
  return (
    <ButtonIcon
      props={{
        disabled: true,
      }}
      className="w-6 h-6 text-xs"
      children={children}
    />
  );
};

const EntityFieldControl = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
  EntityFormValues extends FieldValues,
>(params: {
  fieldKey: (keyof EntityFormValues) & (keyof T) & Path<EntityFormValues>;
  fieldValue: any;
  form: UseFormReturn<EntityFormValues>;
  service: EntityService<T, TSchema>;
}) => {
  const fieldValue = useWatch({
    control: params.form.control,
    name: params.fieldKey,
  });

  const fieldMetadata = params.service.metadata.fields[params.fieldKey];
  
  const initialValue = (params.form.formState.defaultValues !== undefined
    && params.form.formState.defaultValues[params.fieldKey] as any)
      || fieldMetadataInitialValue(fieldMetadata);

  const keyOrConst =
    fieldMetadata.constant === true || fieldMetadata.type === "key";

  return (
    <div className="flex flex-row gap-4">
      {fieldValue !== null ? (
        <EntityFieldInput {...params} initialValue={initialValue} />
      ) : keyOrConst || fieldMetadata.nullable === false ? (
        <ButtonIcon
          className="w-6 h-6"
          children={<CircleOffIcon />}
          props={{
            disabled: true,
          }}
        />
      ) : (
        <ButtonIcon
          props={{
            onClick: () => params.form.setValue(params.fieldKey, initialValue),
          }}
          className="w-8 h-8"
          children={<PlusIcon />}
        />
      )}
    </div>
  );
};

const EntityFieldInput = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
  EntityFormValues extends FieldValues,
>(params: {
  fieldKey: (keyof EntityFormValues) & (keyof T) & Path<EntityFormValues>;
  fieldValue: any;
  form: UseFormReturn<EntityFormValues>;
  service: EntityService<T, TSchema>;
  initialValue: any;
}) => {
  const errors = params.form.formState.errors;
  const isDirty: boolean | undefined = useMemo(
    () => (params.form.formState.dirtyFields as any)[params.fieldKey],
    [params.form.formState.dirtyFields, params.fieldValue]
  );
  const commonClasses = useMemo(
    () =>
      cx(
        "border w-full",
        errors[params.fieldKey]
          ? "border-red-400"
          : isDirty
            ? "border-yellow-600"
            : "border-gray-300"
      ),
    [params.form.formState.errors, isDirty]
  );
  const fieldMetadata = params.service.metadata.fields[params.fieldKey];
  const disabled = fieldMetadata.constant || fieldMetadata.type === "key";
  switch (fieldMetadata.type) {
    case "key":
      return (
        <input
          {...params.form.register(params.fieldKey)}
          disabled={disabled}
          className={commonClasses}
        />
      );
    case "boolean":
      return (
        <Checkbox
          attributes={{
            ...params.form.register(params.fieldKey),
            disabled,
          }}
          className={commonClasses}
        />
      );
    case "text":
      return (
        <textarea
          {...params.form.register(params.fieldKey)}
          disabled={disabled}
          className={commonClasses}
        />
      );
    case "fkey":
      return (
        <EntityFormFkInput
          commonClasses={commonClasses}
          fieldKey={params.fieldKey}
          fieldValue={params.fieldValue}
          form={params.form}
          service={params.service}
          initialValue={params.initialValue}
        />
      );
    case "enum":
      const enumEntries = Object.entries(fieldMetadata.enum!.options);
      return (
        <select
          {...params.form.register(params.fieldKey)}
          size={enumEntries.length}
          className={cx(
            commonClasses,
            "bg-gray-50 border text-gray-900 text-sm rounded-lg block w-full p-2.5"
          )}
        >
          {enumEntries.map(([key, value]) => (
            <option
              key={`${params.service.metadata.singular}_field_select_${key}`}
              value={key}
            >
              {value}
            </option>
          ))}
        </select>
      );
    default:
      return <div>unimplemented_input</div>;
  }
};

const EntityFormFkInput = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
  EntityFormValues extends FieldValues,
>(params: {
  fieldKey: (keyof EntityFormValues) & (keyof T) & Path<EntityFormValues>;
  fieldValue: any;
  form: UseFormReturn<EntityFormValues>;
  service: EntityService<T, TSchema>;
  commonClasses?: string;
  initialValue: any;
}) => {
  const fieldMetadata = params.service.metadata.fields[params.fieldKey];
  const [searchParams, setSearchParams] =
    useState<SearchParams>(defaultSearchParams);
  const [pickerEntityId, setPickerEntityId] = useState<number | undefined>(params.fieldValue);
  useEffect(() => {
    if (pickerEntityId === undefined) {
      params.form.setValue(params.fieldKey, params.initialValue);
    } else {
      params.form.setValue(params.fieldKey, pickerEntityId as any);
    }
  }, [pickerEntityId]);
  const [edit, setEdit] = useState<boolean>(false);

  return (
    <div className="flex flex-col gap-2">
      <Modal
        opened={edit}
        heading={`Pick a(n) ${params.service.metadata.singular}`}
        close={() => setEdit(false)}
        className="flex flex-col items-center justify-center"
      >
        <EntityTable
          service={EntityServiceRegistry[fieldMetadata.apiPrefix!] as any}
          searchParams={{ value: searchParams, set: setSearchParams }}
          pickerState={[pickerEntityId, setPickerEntityId]}
          className={params.commonClasses}
        />
      </Modal>
      <div className="flex flex-row gap-2">
        <EntityFieldDisplay
          fieldKey={params.fieldKey}
          fieldValue={params.fieldValue}
          service={params.service}
        />
        <ButtonIcon
          className="w-6 h-6"
          children={edit ? <CheckIcon /> : <EditIcon />}
          props={{ onClick: () => setEdit((prev) => !prev) }}
        />
      </div>
    </div>
  );
};
