import EntityTablePage from "@/components/pages/EntityTablePage";

export default function TasksPage() {
  return <EntityTablePage apiPrefix={"/task"} />;
}
