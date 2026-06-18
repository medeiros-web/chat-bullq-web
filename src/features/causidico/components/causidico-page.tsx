'use client';

import { useState, useEffect } from 'react';
import { Scale, Settings, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';
import { causidicoService, type CausidicoConfig } from '../services/causidico.service';
import { CausidicoChat } from './causidico-chat';
import { CausidicoConfigPanel } from './causidico-config-panel';

export function CausidicoPage() {
  const [config, setConfig] = useState<CausidicoConfig | null>(null);
  const [tab, setTab] = useState<'chat' | 'config'>('chat');

  useEffect(() => {
    setConfig(causidicoService.getConfig());
  }, []);

  if (!config) return null;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-zinc-200 bg-gradient-to-r from-amber-50 via-orange-50 to-zinc-50 px-5 py-4 dark:border-zinc-800 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-zinc-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md">
              <Scale className="h-5 w-5 text-white" />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 ring-2 ring-white dark:ring-zinc-950">
                <Sparkles className="h-2.5 w-2.5 text-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Causídico</h1>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                  IA Jurídica
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Agente de atendimento · WhatsApp · Agendamentos · Google Meet
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">WhatsApp</p>
              <p className="text-[10px] text-zinc-500">{config.channelId ? 'Configurado' : 'Não conectado'}</p>
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-700" />
            <div className="text-center">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Google Meet</p>
              <p className="text-[10px] text-zinc-500">{config.autoMeet ? 'Automático' : 'Manual'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-1">
          <button
            onClick={() => setTab('chat')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === 'chat'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat com Causídico
          </button>
          <button
            onClick={() => setTab('config')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === 'config'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-zinc-200/60 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            <Settings className="h-3.5 w-3.5" />
            Configurações & Prompt
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {tab === 'chat' ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Chat (main) */}
            <div className="flex-1 overflow-hidden">
              <CausidicoChat config={config} />
            </div>

            {/* Right info panel */}
            <div className="hidden xl:flex w-64 shrink-0 flex-col border-l border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
                Ações rápidas
              </p>
              <div className="space-y-2">
                {[
                  { label: 'Ver Agenda', href: '/scheduling', icon: '📅' },
                  { label: 'Gerenciar Canais', href: '/settings/channels', icon: '📱' },
                  { label: 'Integrações LLM', href: '/settings/integrations/llm', icon: '🤖' },
                  { label: 'Xquads', href: '/xquads', icon: '⚡' },
                ].map((a) => (
                  <a
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-2.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    <span className="text-base">{a.icon}</span>
                    {a.label}
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-400" />
                  </a>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">Dica</p>
                <p className="text-[11px] text-amber-700 dark:text-amber-500 leading-relaxed">
                  Configure o canal WhatsApp e o prompt do Causídico na aba de Configurações para maximizar o atendimento.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden p-5">
            <CausidicoConfigPanel config={config} onChange={setConfig} />
          </div>
        )}
      </div>
    </div>
  );
}
