import { TargetDetailPage } from "@/components/targets/TargetDetailPage";

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <TargetDetailPage
      slug={slug}
      type="idea"
      backLink="/ideas"
      backLabel="Ideas"
    />
  );
}
