import Link from 'next/link';
import { mockForumTopics } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowRight } from 'lucide-react';

export default function ForumPage() {
  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center sm:text-left">
            <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
              Community Forum
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Discuss light pollution and share solutions.
            </p>
          </div>
          <Button size="lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Start a New Topic
          </Button>
        </div>

        <div className="space-y-4">
          {mockForumTopics.map((topic) => (
            <Card key={topic.id} className="transition-all hover:bg-accent/50">
              <CardHeader>
                <Link href={`/forum/${topic.id}`} className="group">
                  <CardTitle className="font-headline text-xl group-hover:text-primary">
                    {topic.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex gap-4">
                  <span>{topic.postCount} posts</span>
                  <span>Last activity: {topic.lastActivity}</span>
                </div>
                <Link href={`/forum/${topic.id}`}>
                  <Button variant="ghost" size="sm">
                    View Topic <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
