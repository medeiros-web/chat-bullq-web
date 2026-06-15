'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Inbox, LayoutDashboard, Bot, Settings } from 'lucide-react';

const tabs = [
  { href: '/inbox', label: 'Inbox', icon: Inbox },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ai-agents', label: 'Jarvis', icon: Bot },
  { href: '/settings', label: 'Config', icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
      <div
        className="grid h-14 grid-cols-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors ${
                active
                  ? 'text-primary'
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`size-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
