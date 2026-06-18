'use client';

import { useState } from 'react';
import { Save, RotateCcw, Settings2, Bot, MessageSquare, Calendar, Video } from 'lucide-react';
import { toast } from 'sonner';
import { causidicoService, type CausidicoConfig } from '../services/causidico.service';
import { CausidicoWhatsappPanel } from './causidico-whatsapp-panel';

const DEFAULT_PROMPT = `Você é Causídico, o assistente jurídico inteligente e carismático deste escritório de advocacia.

Seu papel é:
✅ Recepcionar clientes com calor humano e profissionalismo
✅ Entender a necessidade jurídica do cliente
✅ Apresentar as áreas de atuação do escritório
✅ Agendar consultas e enviar links de reunião Google Meet
✅ Responder dúvidas gerais com clareza, sem substituir a consulta

Tom de voz: acolhedor, confiante, empático e profissional. Use linguagem acessível.

Ao identificar interesse em consulta, pergunte: nome, contato e área de interesse, depois ofereça o agendamento.

Sempre termine com uma ação clara: agendar, enviar link ou encaminhar para o advogado.`;

interface Props {
  config: CausidicoConfig;
  onChange: (config: CausidicoConfig) => void;
}

export function CausidicoConfigPanel({ config, onChange }: Props) {
  const [saved, setSaved] = useState(false);

  const update = (partial: Partial<CausidicoConfig>) => {
    onChange({ ...config, ...partial });
  };

  const handleSave = () => {
    causidicoService.saveConfig(config);
    setSaved(true);
    toast.success('Configurações do Causídico salvas!');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    update({ systemPrompt: DEFAULT_PROMPT });
    toast.info('Prompt redefinido para o padrão.');
  };

  return (
    <div className="flex flex-col gap-5 overflow-y-auto h-full pb-4">
      {/* WhatsApp */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
            <MessageSquare className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            WhatsApp
          </h3>
        </div>
        <CausidicoWhatsappPanel
          channelId={config.channelId}
          onChannelSelect={(id) => update({ channelId: id })}
        />
      </section>

      {/* Identidade */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <Bot className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Identidade
          </h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nome do agente
            </label>
            <input
              value={config.agentName}
              onChange={(e) => update({ agentName: e.target.value })}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Causídico"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Mensagem de boas-vindas
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) => update({ welcomeMessage: e.target.value })}
              rows={2}
              className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Mensagem enviada ao iniciar conversa…"
            />
          </div>
        </div>
      </section>

      {/* Automações */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Settings2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Automações
          </h3>
        </div>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={config.autoSchedule}
                onChange={(e) => update({ autoSchedule: e.target.checked })}
              />
              <div className={`h-5 w-9 rounded-full transition-colors ${config.autoSchedule ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${config.autoSchedule ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Sugerir agendamento</span>
              </div>
              <p className="text-[10px] text-zinc-400">Oferecer consulta ao identificar interesse</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={config.autoMeet}
                onChange={(e) => update({ autoMeet: e.target.checked })}
              />
              <div className={`h-5 w-9 rounded-full transition-colors ${config.autoMeet ? 'bg-primary' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${config.autoMeet ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Google Meet automático</span>
              </div>
              <p className="text-[10px] text-zinc-400">Criar e enviar link Meet ao agendar</p>
            </div>
          </label>
        </div>
      </section>

      {/* System Prompt */}
      <section className="flex-1">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Bot className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              System Prompt
            </h3>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <RotateCcw className="h-3 w-3" />
            Redefinir
          </button>
        </div>
        <textarea
          value={config.systemPrompt}
          onChange={(e) => update({ systemPrompt: e.target.value })}
          rows={12}
          className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 font-mono text-[11px] leading-relaxed text-zinc-800 focus:border-primary focus:outline-none dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
          placeholder="Insira as instruções do agente Causídico…"
        />
        <p className="mt-1 text-[10px] text-zinc-400">
          {config.systemPrompt.length} caracteres
        </p>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
          saved
            ? 'bg-green-600 text-white'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
      >
        <Save className="h-4 w-4" />
        {saved ? 'Salvo!' : 'Salvar configurações'}
      </button>
    </div>
  );
}
