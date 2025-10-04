import EntityInfoPage from '@/components/pages/EntityInfoPage';

export default function SpecificStatusPage({ params }: { params: { id: string }}) {
  return <EntityInfoPage apiPrefix={"/status"} id={params.id} />;
}