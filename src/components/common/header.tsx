import {
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/common/logo';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <Logo />
      </div>
      <div className="flex-1">
        {/* Placeholder for potential header content like search or user menu */}
      </div>
    </header>
  );
}
