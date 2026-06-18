import { api } from '@/lib/api';

export interface LlmIntegration {
  provider: LlmProvider;
  apiKey: string | null;
  isConfigured: boolean;
}

export type LlmProvider = 'openai' | 'xai' | 'google' | 'anthropic';

export const integrationsService = {
  async listLlm(): Promise<LlmIntegration[]> {
    const { data } = await api.get('/settings/integrations/llm');
    return data.data ?? data;
  },

  async saveLlmKey(provider: LlmProvider, apiKey: string): Promise<void> {
    await api.patch('/settings/integrations/llm', { provider, apiKey });
  },

  async removeLlmKey(provider: LlmProvider): Promise<void> {
    await api.delete(`/settings/integrations/llm/${provider}`);
  },
};
