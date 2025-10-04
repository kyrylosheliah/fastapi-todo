"use client";

import ThemedWrapper from '@/components/ThemedWrapper';
import { EntityInfo } from '@/components/data/EntityInfo';
import { EntityServiceRegistry, EntityServiceRegistryKey } from '@/data/EntityServiceRegistry';

export default function EntityInfoPage(params: {
  apiPrefix: EntityServiceRegistryKey;
  id: string | number;
}) {
  const service = EntityServiceRegistry[params.apiPrefix];

  return (
    <ThemedWrapper>
      <EntityInfo entityId={params.id} service={service} />
    </ThemedWrapper>
  );
}