import { Fragment, useState } from "react";
import { EntityForm } from "./EntityForm";
import { EntityTable } from "./EntityTable";
import { useRouter } from "next/router";
import { Entity } from "@/data/Entity";
import ButtonText from "../ButtonText";
import { EntityServiceRegistry } from "@/data/EntityServiceRegistry";
import EntityService from "@/data/EntityService";
import { getDefaultSearchParams, SearchParams } from "@/data/Search";

const RelatedTable = (params: {
  relation: {
    label: string;
    apiPrefix: "/task" | "/status" | "/category";
    fkField: string;
  };
  entityId: string;
  service: EntityService;
}) => {
  const [searchParams, setSearchParams] = useState<SearchParams>(
    getDefaultSearchParams()
  );
  return (
    <Fragment key={`relation_${params.relation.apiPrefix}`}>
      <h2 className="mb-4 text-xl fw-600">{params.relation.label}</h2>
      <EntityTable
        traverse
        key={`relation_${params.relation.label}`}
        searchParams={{ value: searchParams, set: setSearchParams }}
        service={params.service}
        relationFilter={{
          key: params.relation.fkField,
          value: params.entityId,
        }}
        edit
      />
    </Fragment>
  );
};

export const EntityInfo = (params: {
  entityId: string;
  service: EntityService;
}) => {
  const router = useRouter();

  const metadata = params.service.metadata;
  const service = params.service;

  const { data, isPending } = service.useGet(params.entityId);

  const [edit, setEdit] = useState(false);

  const loadingElement = <div>Loading ...</div>;

  const updateMutation = service.useUpdate();

  const deleteMutation = service.useDelete(() => {
    router.push(metadata.indexPagePrefix);
  });

  return (
    <div className="w-full flex flex-col md:flex-row flex-wrap">
      <div className="flex flex-col justify-start items-center border-b md:border-b-0 md:border-r">
        {isPending || data === undefined ? (
          loadingElement
        ) : (
          <div className="flex flex-col items-start gap-4 md:pr-4 w-full">
            <div className="md:pr-4 gap-4 w-full flex items-center justify-between">
              <ButtonText
                props={{
                  onClick: () => router.push(metadata.indexPagePrefix),
                }}
              >
                ← Back
              </ButtonText>
              {edit ? (
                <ButtonText
                  props={{
                    onClick: () => setEdit(false),
                  }}
                >
                  Close edit
                </ButtonText>
              ) : (
                <ButtonText
                  props={{
                    onClick: () => setEdit(true),
                  }}
                >
                  Edit ...
                </ButtonText>
              )}
            </div>
            <div className="text-lg fw-600">
              {`${metadata.singular} ${params.entityId}`}
            </div>
            <div className="w-full">
              <EntityForm
                edit={edit}
                entity={data}
                service={service}
                onSubmit={(newFields) =>
                  updateMutation.mutate({
                    id: params.entityId,
                    data: newFields,
                  })
                }
              />
            </div>
            {edit && (
              <div className="self-end m-t-4 flex flex-col justify-end gap-4">
                <ButtonText
                  type="danger"
                  props={{
                    onClick: () => deleteMutation.mutate(data.id),
                    className: "self-end",
                  }}
                >
                  {`Delete ${metadata.singular}...`}
                </ButtonText>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="pl-4 pt-4 w-full flex-1 min-w-0">
        {metadata.relations && metadata.relations.length ? (
          metadata.relations.map((r) => (
            <RelatedTable
              key={"relation__" + r.apiPrefix}
              entityId={params.entityId}
              relation={r}
              service={EntityServiceRegistry[r.apiPrefix] as any}
            />
          ))
        ) : (
          <>
            <h2 className="mb-4 text-xl fw-600">No references</h2>
            <div>...</div>
          </>
        )}
      </div>
    </div>
  );
};
