'use client';

import { useSearchParams } from 'next/navigation';
import { Bot, BarChart3, User, Sparkles, Wrench, Activity, ShieldCheck, MessageSquare } from 'lucide-react';
import { AgentsList } from '@/features/ai-agents/components/agents-list';
import { JarvisOverviewTab } from '@/features/ai-agents/components/jarvis/overview-tab';
import { JarvisAgentTab } from '@/features/ai-agents/components/jarvis/agent-tab';
import { JarvisSkillsTab } from '@/features/ai-agents/components/jarvis/skills-tab';
import { JarvisSkillsChatTab } from '@/features/ai-agents/components/jarvis/skills-chat-tab';
import { JarvisToolsTab } from '@/features/ai-agents/components/jarvis/tools-tab';
import { JarvisRunsTab } from '@/features/ai-agents/components/jarvis/runs-tab';
import { JarvisWatchdogTab } from '@/features/ai-agents/components/jarvis/watchdog-tab';

type Tab = 'overview' | 'agents' | 'skills' | 'skills-chat' | 'tools' | 'agent' | 'runs' | 'watchdog';

const TAB_META: Record<Tab, { label: string; icon: React.ElementType }> = {
  overview: { label: 'Visão geral', icon: BarChart3 },
  agents: { label: 'Agentes', icon: Bot },
  skills: { label: 'Skills', icon: Sparkles },
  'skills-chat': { label: 'Chat de Skills', icon: MessageSquare },
  tools: { label: 'Tools', icon: Wrench },
  runs: { label: 'Execuções', icon: Activity },
  watchdog: { label: 'Watchdog', icon: ShieldCheck },
  agent: { label: 'Por agente', icon: User },
};

const VALID_TABS: Tab[] = ['overview', 'agents', 'skills', 'skills-chat', 'tools', 'runs', 'watchdog', 'agent'];

export default function AiAgentsPage() {
  const searchParams = useSearchParams();
  const raw = (searchParams.get('tab') ?? 'overview') as Tab;
  const tab: Tab = VALID_TABS.includes(raw) ? raw : 'overview';
  const meta = TAB_META[tab];
  const Icon = meta.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="inline-flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Bot className="h-5 w-5 text-primary" />
          Jarvis
          <span className="text-zinc-300 dark:text-zinc-600">/</span>
          <Icon className="h-4 w-4 text-zinc-400" />
          <span className="text-zinc-700 dark:text-zinc-300">{meta.label}</span>
        </h1>
      </div>

      <div className={`flex-1 ${tab === 'skills-chat' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {tab === 'overview' && <JarvisOverviewTab />}
        {tab === 'agents' && <AgentsList />}
        {tab === 'skills' && <JarvisSkillsTab />}
        {tab === 'skills-chat' && <JarvisSkillsChatTab />}
        {tab === 'tools' && <JarvisToolsTab />}
        {tab === 'runs' && <JarvisRunsTab />}
        {tab === 'watchdog' && <JarvisWatchdogTab />}
        {tab === 'agent' && <JarvisAgentTab />}
      </div>
    </div>
  );
}
