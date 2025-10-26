import { notFound } from 'next/navigation';
import Image from 'next/image';
import { mockForumTopics } from '@/lib/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ForumTopicPage({ params }: { params: { topicId: string } }) {
  const topic = mockForumTopics.find((t) => t.id === params.topicId);

  if (!topic) {
    notFound();
  }

  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-headline text-4xl font-bold">{topic.title}</h1>
        </div>
        <div className="space-y-6">
          {topic.posts.map((post, index) => (
            <Card key={post.id} className={index === 0 ? "border-primary/50 border-2" : ""}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.avatar} alt={post.author} />
                    <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold">{post.author}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(post.timestamp).toLocaleString()}
                </span>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed">{post.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
