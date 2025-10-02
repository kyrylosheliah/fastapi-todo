import type { z } from "zod";
import { type SearchParams, type SearchResponse } from "../types/Search";
import { emitHttp, emitHttpJson } from "../utils/api";
import { type EntityMetadata } from "../types/EntityMetadata";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Entity } from "../types/Entity";

export default class EntityService<
  T extends Entity,
  TSchema extends z.ZodType<Omit<T, 'id'>>,
> {
  constructor(readonly metadata: EntityMetadata<T, TSchema>) {}

  getFormFields(entity: T): Omit<T, 'id'> {
    const temp: any = { ...entity };
    delete temp.id;
    return temp as Omit<T, 'id'>;
  }

  async search(search: SearchParams): Promise<SearchResponse<T>> {
    return emitHttpJson("POST", `${this.metadata.apiPrefix}/search`, search)
      .then((res) => res.json())
      .catch((reason) => {
        alert(`Failed to search for ${this.metadata.plural}, ${reason}`);
        return [];
      });
  }

  async get(entityId: string | number): Promise<T | undefined> {
    return emitHttp("GET", `${this.metadata.apiPrefix}/${entityId}`)
      .then((res) => res.json())
      .catch((reason) => {
        alert(
          `Failed to load ${this.metadata.singular} ${entityId}, ${reason}`
        );
      });
  }

  async create(data: Omit<T, 'id'>): Promise<boolean> {
    return emitHttpJson("POST", this.metadata.apiPrefix, data)
      .then((_) => true)
      .catch((reason) => {
        alert(`Failed to create a ${this.metadata.singular}, ${reason}`);
        return false;
      });
  }

  async update(id: string | number, data: Omit<T, 'id'>): Promise<boolean> {
    return emitHttpJson("put", `${this.metadata.apiPrefix}/${id}`, data)
      .then((_) => true)
      .catch((reason) => {
        alert(`Failed to update ${this.metadata.singular} ${id}, ${reason}`);
        return false;
      });
  }

  async delete(entityId: string | number): Promise<void> {
    if (!confirm("Are you sure you want to delete this project?")) return;
    emitHttpJson("DELETE", `${this.metadata.apiPrefix}/${entityId}`).catch(
      (reason) => {
        alert(`Failed to delete the ${this.metadata.singular}, ${reason}`);
      }
    );
  }

  useSearch(searchParams: SearchParams) {
    return useQuery({
      queryKey: [this.metadata.apiPrefix, "search", searchParams],
      queryFn: () => this.search(searchParams),
      placeholderData: (prev) => prev,
    });
  }

  useGet(entityId: string | number) {
    return useQuery({
      queryKey: [this.metadata.apiPrefix, "get", entityId],
      queryFn: () => this.get(entityId),
      enabled: !!entityId,
    });
  }

  useCreate(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: Omit<T, 'id'>) => this.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [this.metadata.apiPrefix, "search"],
        });
        alert(`A ${this.metadata.singular} was successfully created`);
        onSuccess?.();
      },
    });
  }

  useUpdate(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (params: { id: string | number; data: Omit<T, 'id'> }) =>
        this.update(params.id, params.data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: [this.metadata.apiPrefix, "search"],
        });
        queryClient.invalidateQueries({
          queryKey: [this.metadata.apiPrefix, "get", variables.id],
        });
        alert(`The ${this.metadata.singular} was successfully updated`);
        onSuccess?.();
      },
    });
  }

  useDelete(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string | number) =>
        this.delete(id),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({
          queryKey: [this.metadata.apiPrefix, "search"],
        });
        queryClient.invalidateQueries({
          queryKey: [this.metadata.apiPrefix, "get", variables],
        });
        alert(`The ${this.metadata.singular} was successfully deleted`);
        onSuccess?.();
      },
    });
  }
}
