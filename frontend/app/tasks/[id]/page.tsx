import EntityInfoPage from '@/components/pages/EntityInfoPage';

export default function SpecificTaskPage({ params }: { params: { id: string }}) {
  return <EntityInfoPage apiPrefix={"/task"} id={params.id} />;
}