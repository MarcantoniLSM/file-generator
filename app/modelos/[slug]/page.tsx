import { notFound } from "next/navigation";
import MarketingDetail from "@/components/MarketingDetail";
import { findModelPage, modelPages } from "@/lib/site-pages";

export function generateStaticParams() {
  return modelPages.map((page) => ({ slug: page.slug }));
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = findModelPage(slug);

  if (!page) {
    notFound();
  }

  return <MarketingDetail page={page} />;
}
