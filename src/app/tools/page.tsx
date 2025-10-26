import { SettingsSuggester } from './settings-suggester';

export default function ToolsPage() {
  return (
    <main className="flex-1">
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">
            AI-Powered Tools
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Optimize your astrophotography with our smart tools.
          </p>
        </div>
        
        <SettingsSuggester />

      </div>
    </main>
  );
}
