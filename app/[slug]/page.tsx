import { notFound } from "next/navigation";
import MarketingDetail from "@/components/MarketingDetail";
import { allTopLevelPages, findTopLevelPage } from "@/lib/site-pages";

export function generateStaticParams() {
  return allTopLevelPages.map((page) => ({ slug: page.slug }));
}

export default async function TopLevelMarketingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findTopLevelPage(slug);

  if (!page) {
    notFound();
  }

  return <MarketingDetail page={page} />;
}
