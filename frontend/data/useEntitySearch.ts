import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import EntityService from '@/data/EntityService';
import { getDefaultSearchParams, SearchDTO, SearchParams } from '@/data/Search';
import { Entity } from '@/data/Entity';

interface UseEntitySearchParams<T extends Entity> {
  service: EntityService<T>;
  searchParams: {
    value: SearchParams;
    set: (nextSearch: SearchParams) => void;
  };
  relationFilter?: { key: string; value: any };
}

interface UseEntitySearchReturn<T extends Entity> {
  data: any;
  isPending: boolean;
  entities: T[];
  pageCount: number;
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  handlePaginationChange: (updater: any) => void;
  handleSortingChange: (updater: any) => void;
  setGlobalFilter: (filter: string) => void;
}

export function useEntitySearch<T extends Entity>({
  service,
  searchParams: searchParamsControl,
  relationFilter,
}: UseEntitySearchParams<T>): UseEntitySearchReturn<T> {
  // Parse initial search params once and merge with defaults
  const initialParams = useMemo(() => {
    const defaults = getDefaultSearchParams();
    const sourceParametersParsing = SearchDTO.safeParse(searchParamsControl.value);
    
    if (sourceParametersParsing.success) {
      return sourceParametersParsing.data;
    }
    
    // Merge partial params with defaults
    return {
      ...defaults,
      ...searchParamsControl.value,
      pageNo: searchParamsControl.value.pageNo ?? defaults.pageNo,
      pageSize: searchParamsControl.value.pageSize ?? defaults.pageSize,
      ascending: searchParamsControl.value.ascending ?? defaults.ascending,
      orderByColumn: searchParamsControl.value.orderByColumn ?? defaults.orderByColumn,
      criteria: searchParamsControl.value.criteria ?? defaults.criteria,
      globalFilter: searchParamsControl.value.globalFilter ?? defaults.globalFilter,
    };
  }, []); // Only run once on mount

  // Local state derived from initial params
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: initialParams.pageNo - 1,
    pageSize: initialParams.pageSize,
  });

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: initialParams.orderByColumn,
      desc: !initialParams.ascending,
    },
  ]);

  const [globalFilter, setGlobalFilter] = useState<string>(initialParams.globalFilter);

  // Build search params from current state
  const searchParams: SearchParams = useMemo(() => {
    let nextSearch: SearchParams = {
      pageNo: pagination.pageIndex + 1,
      pageSize: pagination.pageSize,
      orderByColumn: sorting[0]?.id || initialParams.orderByColumn,
      ascending: !sorting[0]?.desc,
      criteria: {},
      globalFilter,
    };

    // Add criteria based on current sort column and global filter
    if (globalFilter) {
      nextSearch.criteria[nextSearch.orderByColumn] = globalFilter;
    }

    // Apply relation filter
    if (relationFilter) {
      nextSearch.criteria[relationFilter.key] = relationFilter.value;
    }

    const result = SearchDTO.safeParse(nextSearch);
    if (!result.success) {
      console.error('Invalid search parameters:', result.error);
      console.log('Failed params:', nextSearch);
      return initialParams;
    }

    return nextSearch;
  }, [pagination, sorting, globalFilter, relationFilter]);

  // Sync search params to external state whenever they change
  useEffect(() => {
    searchParamsControl.set(searchParams);
  }, [searchParams]);

  const handlePaginationChange = useCallback(
    (updater: any) => {
      const newPagination =
        typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newPagination);
    },
    [pagination]
  );

  const handleSortingChange = useCallback(
    (updater: any) => {
      const newSorting: SortingState =
        typeof updater === 'function' ? updater(sorting) : updater;
      setSorting(newSorting);
    },
    [sorting]
  );

  const handleGlobalFilterChange = useCallback((filter: string) => {
    setGlobalFilter(filter);
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  }, []);

  const { data, isPending } = service.useSearch(searchParams);

  const entities = data !== undefined ? data.items || [] : [];
  const pageCount = data !== undefined ? data.pageCount : 0;

  return {
    data,
    isPending,
    entities,
    pageCount,
    pagination,
    sorting,
    globalFilter,
    handlePaginationChange,
    handleSortingChange,
    setGlobalFilter: handleGlobalFilterChange,
  };
}