import { Aperture } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <Aperture className="h-6 w-6 text-primary" />
      <h1 className="font-headline text-2xl font-bold text-foreground">
        ALAN
      </h1>
    </div>
  );
}
