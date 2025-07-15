import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@galileyo/ui/card";

export default function FeedCard() {
  return (
  <Card className="max-w-3xl mx-auto">
    <CardHeader>
      <CardTitle>Feed</CardTitle>
      <CardDescription>Feed</CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4">
      <p>Feed</p>
      <p>Feed</p>
      <p>Feed</p>
    </CardContent>
  </Card>
  );
}