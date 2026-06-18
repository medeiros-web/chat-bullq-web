import { api } from '@/lib/api';
import type { ChatMessage } from '@/features/xquads/services/xquads.service';

export interface CausidicoConfig {
  systemPrompt: string;
  channelId: string | null;
  agentName: string;
  welcomeMessage: string;
  autoSchedule: boolean;
  autoMeet: boolean;
}

export interface CausidicoChat {
  messages: (ChatMessage & { id: string })[];
  provider: string;
}

const CONFIG_KEY = 'causidico_config';

const DEFAULT_CONFIG: CausidicoConfig = {
  systemPrompt: `Você é Causídico, o assistente jurídico inteligente e carismático deste escritório de advocacia.

Seu papel é:
✅ Recepcionar clientes com calor humano e profissionalismo
✅ Entender a necessidade jurídica do cliente
✅ Apresentar as áreas de atuação do escritório
✅ Agendar consultas e enviar links de reunião Google Meet
✅ Responder dúvidas gerais com clareza, sem substituir a consulta

Tom de voz: acolhedor, confiante, empático e profissional. Use linguagem acessível.

Ao identificar interesse em consulta, pergunte: nome, contato e área de interesse, depois ofereça o agendamento.

Sempre termine com uma ação clara: agendar, enviar link ou encaminhar para o advogado.`,
  channelId: null,
  agentName: 'Causídico',
  welcomeMessage: 'Olá! Sou o Causídico, assistente jurídico deste escritório. Como posso ajudá-lo hoje? ⚖️',
  autoSchedule: true,
  autoMeet: true,
};

export const causidicoService = {
  getConfig(): CausidicoConfig {
    try {
      const raw = localStorage.getItem(CONFIG_KEY);
      if (!raw) return { ...DEFAULT_CONFIG };
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  },

  saveConfig(config: CausidicoConfig): void {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  async chat(payload: {
    messages: ChatMessage[];
    provider?: string;
    systemPrompt: string;
  }): Promise<{ message: string }> {
    const { data } = await api.post('/xquads/chat', {
      agentId: 'causidico',
      systemPrompt: payload.systemPrompt,
      messages: payload.messages,
      provider: payload.provider ?? 'anthropic',
    });
    return data.data ?? data;
  },
};
