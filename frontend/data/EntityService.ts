import { emitHttp, emitHttpJson } from "../utils/api";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Entity } from "@/data/Entity";
import { EntityMetadata } from "@/data/EntityMetadata";
import { SearchParams, SearchResponse } from "@/data/Search";
import { DefaultValues, FieldValues } from "react-hook-form";

export default class EntityService {
  constructor(readonly metadata: EntityMetadata) {}

  getFormFields(entity: FieldValues): DefaultValues<FieldValues> {
    const temp: any = { ...entity };
    delete temp.id;
    return temp;
  }

  async invalidateAllLists(queryClient: QueryClient) {
    queryClient.invalidateQueries({
      queryKey: [this.metadata.apiPrefix, "search"],
    });
    queryClient.invalidateQueries({
      queryKey: [this.metadata.apiPrefix, "get"],
    });
    queryClient.invalidateQueries({
      queryKey: [this.metadata.apiPrefix, "getAll"],
    });
  }

  async search(search: SearchParams): Promise<SearchResponse> {
    return emitHttpJson("POST", `${this.metadata.apiPrefix}/search`, search)
      .then((res) => res.json())
      .catch((reason) => {
        alert(`Failed to search for ${this.metadata.plural}, ${reason}`);
        return [];
      });
  }

  async get(entityId: string | number): Promise<FieldValues | undefined> {
    return emitHttp("GET", `${this.metadata.apiPrefix}/${entityId}`)
      .then((res) => res.json())
      .catch((reason) => {
        alert(
          `Failed to load ${this.metadata.singular} ${entityId}, ${reason}`
        );
      });
  }

  async getAll(): Promise<FieldValues[] | undefined> {
    return emitHttp("GET", `${this.metadata.apiPrefix}/all`)
      .then((res) => res.json())
      .catch((reason) => {
        alert(`Failed to load ${this.metadata.singular} entities, ${reason}`);
      });
  }

  async create(data: FieldValues): Promise<boolean> {
    return emitHttpJson("POST", this.metadata.apiPrefix, data)
      .then((res) => res.status === 200 || res.status === 201)
      .catch((reason) => {
        alert(`Failed to create a ${this.metadata.singular}, ${reason}`);
        return false;
      });
  }

  async update(id: string | number, data: FieldValues): Promise<boolean> {
    return emitHttpJson("put", `${this.metadata.apiPrefix}/${id}`, data)
      .then((res) => res.status === 200 || res.status === 201)
      .catch((reason) => {
        alert(`Failed to update ${this.metadata.singular} ${id}, ${reason}`);
        return false;
      });
  }

  async delete(entityId: string | number): Promise<boolean> {
    if (!confirm(`Are you sure you want to delete [${this.metadata.singular}.id:${entityId}]?`)){
      return Promise.reject({ cancelled: true });
    }
    return emitHttpJson("DELETE", `${this.metadata.apiPrefix}/${entityId}`)
      .then((res) => res.status === 200 || res.status === 204)
      .catch((reason) => {
        alert(`Failed to delete the ${this.metadata.singular}, ${reason}`);
        return false;
      });
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

  useGetAll() {
    return useQuery({
      queryKey: [this.metadata.apiPrefix, "get", "all"],
      queryFn: () => this.getAll(),
      enabled: true,
    });
  }

  useCreate(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: FieldValues) => this.create(data),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "search"],
          }),
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "get", "all"],
          }),
        ]);
        alert(`A ${this.metadata.singular} was successfully created`);
        onSuccess?.();
      },
    });
  }

  useUpdate(onSuccess?: () => void, silent?: boolean) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (params: { id: string | number; data: FieldValues }) =>
        this.update(params.id, params.data),
      onSuccess: async (_, variables) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "search"],
          }),
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "get", variables],
          }),
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "get", "all"],
          }),
        ]);
        if (!silent) {
          alert(`The ${this.metadata.singular} was successfully updated`);
        }
        onSuccess?.();
      },
    });
  }

  useDelete(onSuccess?: () => void) {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string | number) => this.delete(id),
      onSuccess: async (_, variables) => {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "search"],
          }),
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "get", variables],
          }),
          queryClient.invalidateQueries({
            queryKey: [this.metadata.apiPrefix, "get", "all"],
          }),
        ]);
        alert(`The ${this.metadata.singular} was successfully deleted`);
        onSuccess?.();
      },
    });
  }
}
