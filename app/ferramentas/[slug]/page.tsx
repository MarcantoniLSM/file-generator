import { notFound } from "next/navigation";
import MarketingDetail from "@/components/MarketingDetail";
import { findToolPage, toolPages } from "@/lib/site-pages";

export function generateStaticParams() {
  return toolPages.map((page) => ({ slug: page.slug }));
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findToolPage(slug);

  if (!page) {
    notFound();
  }

  return <MarketingDetail page={page} />;
}
