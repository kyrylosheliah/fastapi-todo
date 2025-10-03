import { CategoryService } from '@/data/Category/CategoryService';
import { useRouter } from 'next/router';
import dynamic from "next/dynamic";

const EntityInfo = dynamic(() => import("@/components/data/EntityInfo").then(m => m.EntityInfo), {
  loading: () => <p>Loading...</p>,
});

export default function SpecificCategoryPage() {
  const router = useRouter();
  const id = router.query.id === undefined ? "" : router.query.id.toString();

  return (
    <div>
      <EntityInfo entityId={id} service={CategoryService} />
    </div>
  );
}