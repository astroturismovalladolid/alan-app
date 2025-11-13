import { notFound } from 'next/navigation';
import Image from 'next/image';
import { mockForumTopics } from '@/lib/data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function ForumTopicPage({ params }: { params: Promise<{ topicId: string }> }) {
  const { topicId } = await params;
  const topic = mockForumTopics.find((t) => t.id === topicId);

  if (!topic) {
    notFound();
  }

  // Mock posts data for the topic since it's not in the data structure
  const mockPosts = [
    {
      id: '1',
      author: 'User123',
      avatar: 'https://placehold.co/40x40',
      timestamp: new Date().toISOString(),
      content: `This is a discussion about: ${topic.title}`,
    },
    {
      id: '2',
      author: 'AnotherUser',
      avatar: 'https://placehold.co/40x40',
      timestamp: new Date().toISOString(),
      content: 'Great topic! I have some thoughts on this...',
    },
  ];

  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6">
          <h1 className="font-headline text-4xl font-bold">{topic.title}</h1>
        </div>
        <div className="space-y-6">
          {mockPosts.map((post, index) => (
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
