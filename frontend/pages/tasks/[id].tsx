import { EntityInfo } from '@/components/data/EntityInfo';
import { TaskService } from '@/data/Task/TaskService';

import { useRouter } from 'next/router';

export default function SpecificTaskPage() {
  const router = useRouter();
  const id = router.query.id === undefined ? "" : router.query.id.toString();

  return (
    <div>
      <EntityInfo entityId={id} service={TaskService} />
    </div>
  );
}