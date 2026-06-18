'use client';

import { useState, useMemo } from 'react';
import { Search, Users, Bot, ChevronRight, Zap, Shield, Brain, Megaphone, BarChart3, Palette, Target, BookOpen, TrendingUp, Video, Code } from 'lucide-react';
import { XSQUADS, XAGENTS, type XAgent, type XSquad } from '../data/agents';
import { AgentChat } from './agent-chat';

const SQUAD_ICONS: Record<string, React.ElementType> = {
  'advisory-board':      Brain,
  'brand-squad':         Palette,
  'c-level-squad':       Users,
  'claude-code-mastery': Code,
  'cybersecurity':       Shield,
  'data-squad':          BarChart3,
  'design-squad':        Palette,
  'hormozi-squad':       TrendingUp,
  'movement-squad':      Megaphone,
  'storytelling-squad':  BookOpen,
  'traffic-masters':     Target,
};

const TIER_BADGE: Record<number, { label: string; cls: string }> = {
  0: { label: 'Orquestrador', cls: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  1: { label: 'Especialista', cls: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  2: { label: 'Suporte',      cls: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
};

function AgentCard({ agent, squad, onChat }: { agent: XAgent; squad: XSquad; onChat: () => void }) {
  const tier = TIER_BADGE[agent.tier];
  return (
    <div
      className="group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-3.5 shadow-sm transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
      onClick={onChat}
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${squad.color} shadow-sm`}>
          <Bot className="h-4 w-4 text-white" />
        </div>
        <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${tier.cls}`}>
          {tier.label}
        </span>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">{agent.name}</h4>
        <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">{agent.role}</p>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{squad.name}</span>
        <div className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
          <Zap className="h-3 w-3" />
          Chat
        </div>
      </div>
    </div>
  );
}

function SquadSection({ squad, onAgentChat }: { squad: XSquad; onAgentChat: (agent: XAgent) => void }) {
  const [expanded, setExpanded] = useState(true);
  const Icon = SQUAD_ICONS[squad.id] ?? Bot;

  return (
    <section className="space-y-3">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-left transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
      >
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${squad.color} shadow-md`}>
          <span className="text-lg">{squad.emoji}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{squad.name}</h2>
            <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {squad.agents.length} agentes
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400 truncate">{squad.description}</p>
        </div>
        <ChevronRight className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="grid grid-cols-2 gap-2 pl-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {squad.agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} squad={squad} onChat={() => onAgentChat(agent)} />
          ))}
        </div>
      )}
    </section>
  );
}

export function XquadsPage() {
  const [search, setSearch] = useState('');
  const [selectedSquad, setSelectedSquad] = useState<string>('all');
  const [chatAgent, setChatAgent] = useState<XAgent | null>(null);

  const filteredSquads = useMemo(() => {
    const q = search.toLowerCase().trim();
    return XSQUADS.map((squad) => {
      if (selectedSquad !== 'all' && squad.id !== selectedSquad) return null;
      if (!q) return squad;
      const filteredAgents = squad.agents.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q) ||
          a.squad.toLowerCase().includes(q)
      );
      if (filteredAgents.length === 0 && !squad.name.toLowerCase().includes(q)) return null;
      return { ...squad, agents: filteredAgents.length > 0 ? filteredAgents : squad.agents };
    }).filter(Boolean) as typeof XSQUADS;
  }, [search, selectedSquad]);

  const chatSquad = chatAgent ? XSQUADS.find((s) => s.id === chatAgent.squadId) : null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-sm">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Xquads</h1>
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                {XAGENTS.length} Agentes · {XSQUADS.length} Squads
              </span>
            </div>
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              Equipe de IA de élite — clique em qualquer agente para iniciar um Skill Chat
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar agente ou squad..."
              className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 text-sm placeholder-zinc-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
          </div>
        </div>

        {/* Squad filter pills */}
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSquad('all')}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedSquad === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            Todos
          </button>
          {XSQUADS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSquad(s.id === selectedSquad ? 'all' : s.id)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedSquad === s.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
              }`}
            >
              <span>{s.emoji}</span>
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
        {filteredSquads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bot className="mb-3 h-12 w-12 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500">Nenhum agente encontrado</p>
            <button onClick={() => { setSearch(''); setSelectedSquad('all'); }} className="mt-2 text-xs text-primary hover:underline">
              Limpar filtros
            </button>
          </div>
        ) : (
          filteredSquads.map((squad) => (
            <SquadSection key={squad.id} squad={squad} onAgentChat={setChatAgent} />
          ))
        )}
      </div>

      {/* Agent Chat */}
      {chatAgent && chatSquad && (
        <AgentChat
          agent={chatAgent}
          squadColor={chatSquad.color}
          onClose={() => setChatAgent(null)}
        />
      )}
    </div>
  );
}
