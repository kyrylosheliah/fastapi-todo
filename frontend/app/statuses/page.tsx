import EntityTablePage from "@/components/pages/EntityTablePage";

export default function StatusesPage() {
  return <EntityTablePage apiPrefix={"/status"} />;
}
