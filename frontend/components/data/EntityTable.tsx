import { useCallback, useEffect, useMemo, useState, type JSX } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type PaginationState, type RowSelectionState, type SortingState } from "@tanstack/react-table";
import type { z } from "zod";
import { cx } from "../../utils/cx";
import { EntityFieldDisplay } from "./EntityFieldDisplay";
import type { ReactNode } from "react";
import { EntityForm } from "./EntityForm";
import { useRouter } from "next/router";
import { Checkbox } from "@/components/Checkbox";
import ButtonText from "@/components/ButtonText";
import ButtonIcon from "@/components/ButtonIcon";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, PlusIcon, SearchIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { Modal } from "@/components/Modal";
import { Entity } from "@/data/Entity";
import { entityDefaultValues } from "@/data/EntityMetadata";
import { SearchParams, searchStatesToParameters, SearchSchema } from "@/data/Search";
import EntityService from "@/data/EntityService";

export function EntityTable<
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
>(params: {
  pickerState?: [
    number | undefined,
    React.Dispatch<React.SetStateAction<number | undefined>>,
  ];
  relationFilter?: { key: string; value: any };
  service: EntityService<T, TSchema>;
  searchParams: {
    value: SearchParams;
    set: (nextSearch: SearchParams) => void;
  };
  edit?: boolean;
  traverse?: boolean;
  className?: string;
}): JSX.Element {
  const metadata = params.service.metadata;
  const service = params.service;

  const sourceParameters = params.searchParams.value;

  const pagination: PaginationState = useMemo(() => ({
    pageIndex: sourceParameters.pageNo - 1,
    pageSize: sourceParameters.pageSize,
  }), [sourceParameters.pageNo, sourceParameters.pageSize]);

  const [optimisticSorting, setOptimisticSorting] = useState<SortingState>(() => [{
    id: sourceParameters.orderByColumn,
    desc: !sourceParameters.ascending,
  }]);

  useEffect(() => {
    const newSorting = [
      {
        id: sourceParameters.orderByColumn,
        desc: !sourceParameters.ascending,
      },
    ];
    setOptimisticSorting(newSorting);
  }, [sourceParameters.orderByColumn, sourceParameters.ascending]);

  const sorting: SortingState = useMemo(
    () => [
      {
        id: sourceParameters.orderByColumn,
        desc: !sourceParameters.ascending,
      },
    ],
    [sourceParameters.pageNo, sourceParameters.ascending]
  );

  const [globalFilter, setGlobalFilter] = useState<string>("");

  const searchParams: SearchParams = useMemo(() => {
    let nextSearch = searchStatesToParameters({
      pagination,
      sorting,
      globalFilter,
    });
    if (params.relationFilter) {
      nextSearch.criteria[params.relationFilter.key] =
        params.relationFilter.value;
    }
    const result = SearchSchema.safeParse(nextSearch);
    if (!result.success) {
      console.log(result.error.format());
      console.log(nextSearch);
      // window.alert(`Invalid search parameters, ${result.error.format()}`);
      return sourceParameters;
    }
    return nextSearch;
  }, [
    pagination,
    sorting,
    globalFilter,
    params.relationFilter,
    sourceParameters,
  ]);

  const handlePaginationChange = useCallback(
    (updater: any) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      const nextSearch = {
        ...searchParams,
        pageNo: newPagination.pageIndex + 1,
        pageSize: newPagination.pageSize,
      };
      params.searchParams.set(nextSearch);
    },
    [params.searchParams.value, pagination, sourceParameters]
  );

  const handleSortingChange = useCallback(
    (updater: any) => {
      const newSorting: SortingState =
        typeof updater === "function" ? updater(sorting) : updater;
      setOptimisticSorting(newSorting);
      const sortingColumn = newSorting[0]?.id || searchParams.orderByColumn;
      const nextSearch = {
        ...searchParams,
        orderByColumn: sortingColumn,
        ascending: !newSorting[0]?.desc,
        criteria: { [sortingColumn]: globalFilter },
      };
      params.searchParams.set(nextSearch);
    },
    [params.searchParams.value, optimisticSorting, pagination, sourceParameters]
  );

  const { data, isPending } = service.useSearch(searchParams);

  const entities = data !== undefined ? data.items || [] : [];
  const pageCount = data !== undefined ? data.pageCount : 0;

  const router = useRouter();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    params.pickerState !== undefined && params.pickerState[0] !== undefined
      ? {
          [params.pickerState[0]]: true,
        }
      : {}
  );

  const [selectedRowId, setSelectedRowId] =
    params.pickerState !== undefined
      ? params.pickerState
      : useState<number | undefined>(undefined);

  useEffect(() => {
    const selectedRows = entities.filter((row) => rowSelection[row.id]);
    if (selectedRows.length > 0) {
      setSelectedRowId(selectedRows[0].id);
    } else {
      setSelectedRowId(undefined);
    }
  }, [rowSelection]);

  let columns: ColumnDef<T>[] = [];
  if (params.edit || params.pickerState) {
    columns.push({
      id: "select",
      header: ({ table }) => {
        const allSelected = table.getIsAllRowsSelected();
        const someSelected = table.getIsSomeRowsSelected() || allSelected;
        return (<Checkbox
          attributes={{
            disabled: !someSelected,
            checked: allSelected,
            onChange: () => {},
            onClick: () => table.resetRowSelection(),
          }}
          indeterminate={someSelected}
        />);
      },
      cell: ({ row }) => (
        <Checkbox
          attributes={{
            checked: row.getIsSelected(),
            disabled: !row.getCanSelect(),
            onChange: () => {},
            onClick: row.getToggleSelectedHandler(),
          }}
        />
      ),
      enableSorting: false,
      enableResizing: false,
    });
  }
  columns = columns.concat(
    (Object.keys(metadata.fields) as (keyof T)[]).map((key) => ({
      header: metadata.fields[key].label,
      accessorKey: key,
      cell: (context) => (
        <EntityFieldDisplay
          fieldKey={key as any}
          fieldValue={context.getValue() as any}
          service={service}
        />
      ),
    }))
  );
  if (params.traverse) {
    columns.push({
      id: "open",
      header: "Info",
      cell: ({ row }) => (
        <ButtonText
          props={{
            onClick: () => router.push(`${metadata.indexPagePrefix}/${row.original.id}`),
          }}
        >
          Open
        </ButtonText>
      ),
    });
  }

  const table = useReactTable<T>({
    data: entities,
    pageCount,
    columns,
    state: {
      sorting: optimisticSorting,
      globalFilter,
      pagination,
      rowSelection,
    },
    getCoreRowModel: getCoreRowModel(),
    getRowId: (r) => r.id.toString(),
    enableRowSelection: true,
    enableMultiRowSelection: false,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    manualFiltering: true,
    manualSorting: true,
  });

  const [updateOpened, setUpdateOpened] = useState(false);
  const updateMutation = service.useUpdate();
  const [createOpened, setCreateOpened] = useState(false);
  const createMutation = service.useCreate();

  const deleteMuatation = service.useDelete();

  return (
    <div
      className={cx(
        "w-full gap-2 flex flex-col items-center rounded-md",
        params.className
      )}
    >
      <div className="w-full h-8 gap-2 flex flex-row justify-between items-center">
        <ButtonIcon className="w-8 h-8" props={{ disabled: true }}>
          <SearchIcon />
        </ButtonIcon>
        <input
          type="text"
          placeholder="Search..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="px-2 w-full h-full border rounded-md"
        />
        {params.edit === true && (
          <>
            <EntityModalForm
              opened={createOpened}
              heading={`Edit ${metadata.singular}`}
              close={() => setCreateOpened(false)}
              create={(newValues) =>
                createMutation.mutateAsync(newValues, {
                  onSuccess: () => setCreateOpened(false),
                })
              }
              entityId={selectedRowId}
              service={service}
            />
            <ButtonIcon
              className="w-8 h-8"
              props={{
                disabled: isPending,
                onClick: () => setCreateOpened(true),
              }}
            >
              <PlusIcon />
            </ButtonIcon>
          </>
        )}
        {params.edit === true && !!selectedRowId && (
          <>
            <EntityModalForm
              opened={updateOpened}
              heading={`Edit ${metadata.singular}`}
              close={() => setUpdateOpened(false)}
              update={(id, newValues) =>
                updateMutation.mutateAsync({ id, data: newValues })
              }
              entityId={selectedRowId}
              service={service}
            />
            <ButtonIcon
              className="w-8 h-8"
              props={{
                onClick: () => setUpdateOpened(true),
              }}
            >
              <SquarePenIcon />
            </ButtonIcon>
            <ButtonIcon
              className="w-8 h-8"
              type="danger"
              props={{
                onClick: () => deleteMuatation.mutateAsync(selectedRowId),
              }}
            >
              <Trash2Icon />
            </ButtonIcon>
          </>
        )}
      </div>

      {isPending ? (
        <p>Loading ...</p>
      ) : entities.length > 0 ? (
        <div className="w-full max-w-full overflow-x-auto">
          <table className="table-auto min-w-max w-full border">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="cursor-pointer pl-3 py-0.5 text-left text-nowrap"
                    >
                      <div className="flex flex-row flex-nowrap">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {
                          {
                            asc: <ChevronDownIcon />,
                            desc: <ChevronUpIcon />,
                          }[header.column.getIsSorted() as string]
                        }
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    row.getIsSelected() ? "bg-blue-100" : "hover:bg-gray-100"
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="pl-3 py-0.5 border-t">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No {metadata.plural} found</div>
      )}
      <div className="w-full gap-4 flex flex-row justify-center items-center">
        <ButtonIcon
          props={{
            onClick: () => table.previousPage(),
            disabled: !table.getCanPreviousPage(),
          }}
          className="w-8 h-8"
        >
          <ChevronLeftIcon />
        </ButtonIcon>
        <span>
          {`Page ${table.getPageCount() && `${pagination.pageIndex + 1} of ${table.getPageCount()}`} `}
        </span>
        <ButtonIcon
          props={{
            onClick: () => table.nextPage(),
            disabled: !table.getCanNextPage(),
          }}
          className="w-8 h-8"
        >
          <ChevronRightIcon />
        </ButtonIcon>
      </div>
    </div>
  );
}

const EntityModalForm = <
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, "id">>,
>(params: {
  opened: boolean;
  icon?: ReactNode;
  heading: ReactNode;
  close: () => void;
  update?: (id: number, newValues: Omit<T, 'id'>) => Promise<boolean>;
  create?: (newValues: Omit<T, 'id'>) => Promise<boolean>;
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
      className="flex flex-col items-center justify-center"
    >
      {params.create === undefined ? (
        isPending ? (
          <div>Loading ...</div>
        ) : isSuccess ? (
          <EntityForm
            edit
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
