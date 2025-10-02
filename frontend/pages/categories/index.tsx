import { EntityTable } from "@/components/data/EntityTable";
import { SearchParams, toSearchParamsString } from "@/data/Search";
import { CategoryService } from "@/data/Category/CategoryService";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/router";

export default function CategoriesPage() {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = Object.fromEntries(useSearchParams().entries());

  const search = searchParams as unknown as SearchParams;

  return (<div>
    <h1 className="text-2xl mb-2">Categories</h1>
    <EntityTable
      traverse
      edit
      service={CategoryService}
      searchParams={{
        value: search,
        set: (nextSearch: SearchParams) => {
          router.replace(pathname + "?" + toSearchParamsString(nextSearch))
        },
      }}
    />
  </div>);
}