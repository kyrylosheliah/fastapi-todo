"use client";

import { SearchParams, toSearchParamsString, validateSearch } from "@/data/Search";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { EntityTable } from "@/components/data/EntityTable";
import ThemedWrapper from "@/components/ThemedWrapper";
import { EntityServiceRegistry, EntityServiceRegistryKey } from "@/data/EntityServiceRegistry";
import { Suspense, useMemo } from "react";

export function EntityTablePageContent(params: {
  apiPrefix: EntityServiceRegistryKey;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const urlSearchParams = useSearchParams();

  const searchParams = useMemo(() => {
    const obj = Object.fromEntries(urlSearchParams.entries());
    return validateSearch(obj);
  }, [urlSearchParams]);

  const setSearchParams = (newParams: SearchParams) => {
    router.replace(pathname + "?" + toSearchParamsString(newParams));
  };

  const service = EntityServiceRegistry[params.apiPrefix];

  return (
    <ThemedWrapper>
      <div className="max-w-5xl">
        <h1 className="text-2xl mb-2">Tasks</h1>
        <EntityTable
          traverse
          edit
          service={service}
          searchParams={{
            value: searchParams as unknown as SearchParams,
            set: setSearchParams,
          }}
        />
      </div>
    </ThemedWrapper>
  );
}

export default function EntityTablePage(params: {
  apiPrefix: EntityServiceRegistryKey;
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EntityTablePageContent {...params} />
    </Suspense>
  );
}