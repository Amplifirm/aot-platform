import { TargetDetailPage } from "@/components/targets/TargetDetailPage";

export default async function PersonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <TargetDetailPage
      slug={slug}
      type="person"
      backLink="/people"
      backLabel="People"
    />
  );
}
