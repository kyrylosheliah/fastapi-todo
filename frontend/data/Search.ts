import { z } from "zod";
import { getZodDefaults } from "../utils/getZodDefaults";
import type { Entity } from "./Entity";

export const SearchSchema = z.object({
  pageNo: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(20).default(10),
  ascending: z.coerce.boolean().default(true),
  orderByColumn: z.string().default('id'),
  criteria: z.record(z.any()).default({}),
  globalFilter: z.string().default(""),
});

export type SearchParams = z.infer<typeof SearchSchema>;

export const defaultSearchParams: SearchParams = getZodDefaults(SearchSchema) as SearchParams;

export type SearchResponse<T extends Entity> = {
  pageCount: number;
  items: T[],
};

export interface SearchState {
  pagination: { pageIndex: number; pageSize: number };
  sorting: { id: string; desc: boolean }[];
  globalFilter?: string;
}

export const validateSearch = (search: Record<string, unknown>) => {
  const result = SearchSchema.safeParse(search);
  if (!result.success) throw new Error('Invalid query params');
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
