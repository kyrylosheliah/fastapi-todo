import { EntityInfo } from '@/components/data/EntityInfo';
import { StatusService } from '@/data/Status/StatusService';

import { useRouter } from 'next/router';

export default function SpecificStatusPage() {
  const router = useRouter();
  const id = router.query.id === undefined ? "" : router.query.id.toString();

  return (
    <div>
      <EntityInfo entityId={id} service={StatusService} />
    </div>
  );
}