import { EntityInfo } from '@/components/data/EntityInfo';
import { CategoryService } from '@/data/Category/CategoryService';

import { useRouter } from 'next/router';

export default function SpecificCategoryPage() {
  const router = useRouter();
  const id = router.query.id === undefined ? "" : router.query.id.toString();

  return <EntityInfo entityId={id} service={CategoryService} />;
}