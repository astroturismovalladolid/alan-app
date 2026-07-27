'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ImagePlus, Wrench } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const links = [
  { href: '/', label: 'Gallery', icon: Home },
  { href: '/upload', label: 'Upload', icon: ImagePlus },
  { href: '/tools', label: 'AI Tools', icon: Wrench },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <SidebarMenuItem key={link.label}>
            <Link href={link.href} passHref>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={{ children: link.label }}
                asChild
              >
                <a>
                  <link.icon />
                  <span>{link.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
