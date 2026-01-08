import { TargetDetailPage } from "@/components/targets/TargetDetailPage";

export default async function CountryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <TargetDetailPage
      slug={slug}
      type="country"
      backLink="/countries"
      backLabel="Countries"
    />
  );
}
