import { Console } from "@/components/Console";
import { getConsoleData } from "@/lib/server";

// The SHRAM feed refreshes roughly hourly; revalidate alongside it rather
// than rebuilding the plan on every request.
export const revalidate = 600;

export default async function Page() {
  const initial = await getConsoleData();
  return <Console initial={initial} />;
}
