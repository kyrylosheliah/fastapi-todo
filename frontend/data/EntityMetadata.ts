import type { z } from "zod";
import type { ReactNode } from "react";
import type { Entity } from "../types/EntityEntity";
import { EntityServiceRegistry } from "../data/EntityServiceRegistry";

export type EntityMetadata<
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
> = {
  apiPrefix: string;
  indexPagePrefix: string;
  singular: string;
  plural: string;
  fields: {
    [column in keyof T]: EntityFieldMetadata;
  };
  relations?: Array<{
    label: string;
    apiPrefix: keyof typeof EntityServiceRegistry;
    fkField: string;
  }>,
  formSchema: TSchema;
  peekComponent: (entity: T) => ReactNode;
};

export type EntityFieldMetadata = {
  type: DatabaseType;
  label: string;
  constant?: boolean;
  nullable?: boolean;
  apiPrefix?: keyof typeof EntityServiceRegistry;
  enum?: {
    default: any;
    options: object;
  };
};

export type DatabaseType = 
  | "key"
  | "fkey"
  | "enum"
  //| "datetime"
  //| "date"
  //| "number"
  //| "decimal"
  //| "string"
  | "text"
  | "boolean"
  //| "char";

export const fieldMetadataDefaultValue = (
  fieldMetadata: EntityFieldMetadata,
) => {
  if (fieldMetadata.nullable) {
    return null;
  }
  switch (fieldMetadata.type) {
    case "key":
      return 0;
    case "fkey":
      return 0;
    case "text":
      return "";
    case "boolean":
      return false;
    case "enum":
      return fieldMetadata.enum!.default;
    default:
      return null;
  }
};

export const fieldMetadataInitialValue = (
  fieldMetadata: EntityFieldMetadata,
) => {
  switch (fieldMetadata.type) {
    case "key":
      return 0;
    case "fkey":
      return 0;
    case "text":
      return "";
    case "boolean":
      return false;
    case "enum":
      return fieldMetadata.enum!.default;
    default:
      return null;
  }
};

export const entityDefaultValues = <T extends Entity>(fields: {
  [column in keyof T]: EntityFieldMetadata;
}) => {
  let temp: any = {};
  Object.keys(fields).map((key) => {
    temp[key] = fieldMetadataDefaultValue(fields[key as keyof T]);
  });
  return temp as T;
};
