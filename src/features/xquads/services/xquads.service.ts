import { api } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  agentId: string;
  systemPrompt: string;
  messages: ChatMessage[];
  provider?: string;
  model?: string;
}

export interface ChatResponse {
  message: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export const xquadsService = {
  async chat(payload: ChatRequest): Promise<ChatResponse> {
    const { data } = await api.post('/xquads/chat', payload);
    return data.data ?? data;
  },

  async getLlmStatus(): Promise<{ providers: { provider: string; isConfigured: boolean }[] }> {
    const { data } = await api.get('/settings/integrations/llm');
    const list: { provider: string; isConfigured: boolean }[] = (data.data ?? data) as any[];
    return { providers: list };
  },
};
