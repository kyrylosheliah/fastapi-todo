import EntityInfoPage from '@/components/pages/EntityInfoPage';

export default function SpecificCategoryPage({ params }: { params: { id: string }}) {
  return <EntityInfoPage apiPrefix={"/category"} id={params.id} />;
}