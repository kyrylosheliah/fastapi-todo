import { StatusService } from '@/data/Status/StatusService';
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";

const EntityInfo = dynamic(() => import("@/components/data/EntityInfo").then(m => m.EntityInfo), {
  loading: () => <p>Loading...</p>,
});

export default function SpecificStatusPage() {
  const router = useRouter();
  const id = router.query.id === undefined ? "" : router.query.id.toString();

  return (
    <div>
      <EntityInfo entityId={id} service={StatusService} />
    </div>
  );
}