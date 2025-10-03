import { useEffect, useState, type JSX } from "react";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type RowSelectionState } from "@tanstack/react-table";
import { cx } from "../../utils/cx";
import { EntityFieldDisplay } from "./EntityFieldDisplay";
import { useRouter } from "next/router";
import { Checkbox } from "@/components/Checkbox";
import ButtonIcon from "@/components/ButtonIcon";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon, PlusIcon, SquareArrowUpRightIcon, SquarePenIcon, Trash2Icon } from "lucide-react";
import { Entity } from "@/data/Entity";
import { SearchParams } from "@/data/Search";
import EntityService from "@/data/EntityService";
import { Input } from "@/components/ui/input";
import { EntityModalForm } from "@/components/data/EntityModalForm";
import { useEntitySearch } from "@/data/useEntitySearch";

export function EntityTable<
  T extends Entity
>(params: {
  pickerState?: [
    number | undefined,
    React.Dispatch<React.SetStateAction<number | undefined>>,
  ];
  relationFilter?: { key: string; value: any };
  service: EntityService<T>;
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

  const {
    data,
    isPending,
    entities,
    pageCount,
    pagination,
    sorting,
    globalFilter,
    handlePaginationChange,
    handleSortingChange,
    setGlobalFilter,
  } = useEntitySearch({
    service: params.service,
    searchParams: params.searchParams,
    relationFilter: params.relationFilter,
  });

  const router = useRouter();

  const [rowSelection, setRowSelection] = useState<RowSelectionState>(
    params.pickerState !== undefined && params.pickerState[0] !== undefined
      ? {
          [params.pickerState[0]]: true,
        }
      : {}
  );

  const internalSelectedRowIdState = useState<number | undefined>();
  const [selectedRowId, setSelectedRowId] = params.pickerState ? params.pickerState : internalSelectedRowIdState;

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
        <ButtonIcon
          props={{
            onClick: () => router.push(`${metadata.indexPagePrefix}/${row.original.id}`),
          }}
        >
          <SquareArrowUpRightIcon size={32} />
        </ButtonIcon>
      ),
    });
  }

  const table = useReactTable<T>({
    data: entities,
    pageCount,
    columns,
    state: {
      sorting,
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

  const deleteMuatation = service.useDelete(() => {
    setUpdateOpened(false);
  });

  return (
    <div
      className={cx(
        "w-full gap-2 flex flex-col items-center rounded-md",
        params.className
      )}
    >
      <div className="w-full h-8 gap-2 flex flex-row justify-between items-center">
        {/* <ButtonIcon className="w-8 h-8" props={{ disabled: true }}>
          <SearchIcon />
        </ButtonIcon> */}
        <Input
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
              delete={() => deleteMuatation.mutateAsync(selectedRowId)}
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
            <thead>
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
                    row.getIsSelected() ? "bg-blue-100 dark:bg-gray-700" : "hover:bg-gray-200 dark:hover:bg-gray-800"
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
