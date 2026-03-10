import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSiteBySlug } from "@/lib/data/sites";
import DashboardEditor from "./DashboardEditor";

type Props = { params: Promise<{ slug: string }> };

export default async function DashboardPage({ params }: Props) {
  const { slug } = await params;
  const session = await getSession();
  if (!session || session.slug !== slug) redirect("/login");

  const site = await getSiteBySlug(slug);
  if (!site) redirect("/login");

  return <DashboardEditor site={site} />;
}
