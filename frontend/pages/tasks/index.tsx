import { SearchParams, toSearchParamsString } from "@/data/Search";
import { TaskService } from "@/data/Task/TaskService";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { EntityTable } from "@/components/data/EntityTable";
// import dynamic from "next/dynamic";
// const EntityTable = dynamic(() => import("@/components/data/EntityTable").then(m => m.EntityTable), {
//   loading: () => <p>Loading...</p>,
// });

export default function TasksPage() {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = Object.fromEntries(useSearchParams().entries());

  const search = searchParams as unknown as SearchParams;

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl mb-2">Tasks</h1>
      <EntityTable
        traverse
        edit
        service={TaskService}
        searchParams={{
          value: search,
          set: (nextSearch: SearchParams) => {
            router.replace(pathname + "?" + toSearchParamsString(nextSearch));
          },
        }}
      />
    </div>
  );
}
