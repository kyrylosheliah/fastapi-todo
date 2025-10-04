"use client";

import type { FieldValues, Path } from "react-hook-form";
import { CalendarIcon, CircleOffIcon, SquareArrowUpRightIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ButtonIcon from "../ButtonIcon";
import { EntityFieldMetadata } from "@/data/EntityMetadata";
import EntityService from "@/data/EntityService";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BadgeIcon } from "@/components/BadgeIcon";
import { EntityServiceRegistry } from "@/data/EntityServiceRegistry";
import Link from "next/link";
import { EntityForm } from "@/components/data/EntityForm";
import { useMemo } from "react";

export const EntityFieldDisplay = (params: {
  fieldKey: (keyof FieldValues) & Path<FieldValues>;
  fieldValue: any;
  service: EntityService;
  breakPopover?: boolean;
}) => {
  const fieldMetadata = params.service.metadata.fields[params.fieldKey]
  if (fieldMetadata.nullable) {
    if (params.fieldValue === null) {
      return (
        <ButtonIcon
          className="w-6 h-6"
          props={{ disabled: true }}
          children={<CircleOffIcon />}
        />
      );
    }
  }
  switch (fieldMetadata.type) {
    case "key":
    case "number":
      return `${new String(params.fieldValue)}`;
    case "date":
      const date = new Date(params.fieldValue);
      return (<div>
        <BadgeIcon
          children={isNaN(date.getTime()) ? "???" : date.toDateString()}
          icon={<CalendarIcon size={16} />}
        />
      </div>);
    case "boolean":
      return params.fieldValue ? "yes" : "no";
    case "text":
      return <div className="max-w-xs break-words">{params.fieldValue}</div>;
    case "fkey":
      return (
        <EntityFkField
          fkId={params.fieldValue}
          fieldMetadata={fieldMetadata}
          breakPopover={params.breakPopover}
        />
      );
    case "enum":
      return (
        (fieldMetadata.enum!.options as any)[params.fieldValue] ||
        params.fieldValue
      );
    default:
      return "Unimplemented type display";
  }
};

const EntityFkField = (params: {
  fkId: string | number;
  fieldMetadata: EntityFieldMetadata;
  breakPopover?: boolean;
}) => {

  const fkService = EntityServiceRegistry[params.fieldMetadata.apiPrefix!];
  const fkMetadata = fkService.metadata;
  const { data, isPending } = fkService.useGet(params.fkId);
  const dataMemo = useMemo(() => data, [data]);

  if (params.fkId === 0) {
    return (
      <Badge
        variant={params.fieldMetadata.nullable !== true ? "destructive" : undefined}
        className="fw-700"
        children={<div className="px-2">unspecified</div>}
      />
    );
  }

  if (isPending || data === undefined) {
    return <div>Loading ...</div>;
  }

  if (params.breakPopover) {
    return fkMetadata.peekComponent(data as any);
  }

  return (
    <HoverCard>
      <HoverCardTrigger>
        {fkMetadata.peekComponent(data as any)}
      </HoverCardTrigger>
      <HoverCardContent className="p-0 w-full inline-block border rounded-md shadow-md flex flex-row items-start">
        <div className="py-4 pl-4">
          <EntityForm
            edit={false}
            entity={dataMemo as FieldValues}
            onSubmit={() => {}}
            service={fkService as any}
            breakPopover
          />
        </div>
        <Link href={`${fkMetadata.indexPagePrefix}/${params.fkId}`}>
          <ButtonIcon>
            <SquareArrowUpRightIcon size={16} />
          </ButtonIcon>
        </Link>
      </HoverCardContent>
    </HoverCard>
  );
};
