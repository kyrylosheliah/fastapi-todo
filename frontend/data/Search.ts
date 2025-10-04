import { z } from "zod";
import { getZodDefaults } from "../utils/getZodDefaults";
import { FieldValues } from "react-hook-form";

export const SearchDTO = z.object({
  pageNo: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(20).default(10),
  ascending: z.coerce.boolean().default(true),
  orderByColumn: z.string().default("id"),
  criteria: z.record(z.string(), z.any()).default({}),
  globalFilter: z.string().default(""),
});

export type SearchParams = z.infer<typeof SearchDTO>;

const defaultSearchParams: SearchParams = getZodDefaults(SearchDTO) as SearchParams;

export const getDefaultSearchParams = () => ({...defaultSearchParams});

export const getDefaultSearchParamsString = () => {
  return toSearchParamsString(defaultSearchParams);
};

export const toSearchParamsString = (searchParams_: SearchParams) => {
  const searchParams = new URLSearchParams();
  Object.entries(searchParams_).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === "criteria" && typeof value === "object") {
      Object.entries(value).forEach(([critKey, critVal]) => {
        if (critVal !== undefined && critVal !== null) {
          searchParams.append(`criteria[${critKey}]`, String(critVal));
        }
      });
    } else {
      searchParams.set(key, String(value));
    }
  });
  return searchParams.toString();
};

export type SearchResponse = {
  pageCount: number;
  items: FieldValues[],
};

export interface SearchState {
  pagination: { pageIndex: number; pageSize: number };
  sorting: { id: string; desc: boolean }[];
  globalFilter?: string;
}

export const validateSearch = (search: Record<string, unknown>) => {
  const result = SearchDTO.safeParse(search);
  if (!result.success) throw new Error("Invalid query params");
  return result.data;
};

export const searchStatesToParameters = (state: SearchState) => {
  const sort = state.sorting?.[0];
  const criteria: Record<string, any> = {};
  // if (state.globalFilter) {
  //   criteria[sort.id || "id"] = state.globalFilter;
  // }
  // // Will be filled by fk restrictions from the code instead
  return {
    pageNo: state.pagination.pageIndex + 1,
    pageSize: state.pagination.pageSize,
    ascending: sort ? !sort.desc : true,
    orderByColumn: sort?.id ?? "id",
    criteria,
    globalFilter: state.globalFilter || "",
  };
};
