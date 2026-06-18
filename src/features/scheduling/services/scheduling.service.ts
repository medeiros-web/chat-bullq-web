import { api } from '@/lib/api';

export type AppointmentStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface Appointment {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  contactId?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  channelId?: string | null;
  channelName?: string | null;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  meetLink?: string | null;
  calendarEventId?: string | null;
  bookingLinkId?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BookingLink {
  id: string;
  organizationId: string;
  slug: string;
  title: string;
  description?: string | null;
  durationMinutes: number;
  agentId?: string | null;
  agentName?: string | null;
  channelId?: string | null;
  isActive: boolean;
  publicUrl: string;
  createdAt: string;
}

export interface CreateAppointmentPayload {
  title: string;
  description?: string;
  contactId?: string;
  agentId?: string;
  channelId?: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
  createMeet?: boolean;
}

export interface UpdateAppointmentPayload {
  title?: string;
  description?: string;
  contactId?: string;
  agentId?: string;
  channelId?: string;
  status?: AppointmentStatus;
  startsAt?: string;
  endsAt?: string;
  notes?: string;
}

export interface CreateBookingLinkPayload {
  slug: string;
  title: string;
  description?: string;
  durationMinutes: number;
  agentId?: string;
  channelId?: string;
}

export interface GoogleCalendarStatus {
  connected: boolean;
  email?: string | null;
}

export const schedulingService = {
  async listAppointments(params?: {
    from?: string;
    to?: string;
    status?: AppointmentStatus;
  }): Promise<Appointment[]> {
    const { data } = await api.get('/scheduling/appointments', { params });
    return data.data ?? data;
  },

  async getAppointment(id: string): Promise<Appointment> {
    const { data } = await api.get(`/scheduling/appointments/${id}`);
    return data.data ?? data;
  },

  async createAppointment(payload: CreateAppointmentPayload): Promise<Appointment> {
    const { data } = await api.post('/scheduling/appointments', payload);
    return data.data ?? data;
  },

  async updateAppointment(id: string, payload: UpdateAppointmentPayload): Promise<Appointment> {
    const { data } = await api.patch(`/scheduling/appointments/${id}`, payload);
    return data.data ?? data;
  },

  async deleteAppointment(id: string): Promise<void> {
    await api.delete(`/scheduling/appointments/${id}`);
  },

  async createMeet(id: string): Promise<{ meetLink: string }> {
    const { data } = await api.post(`/scheduling/appointments/${id}/meet`);
    return data.data ?? data;
  },

  async deleteMeet(id: string): Promise<void> {
    await api.delete(`/scheduling/appointments/${id}/meet`);
  },

  async sendLink(id: string): Promise<void> {
    await api.post(`/scheduling/appointments/${id}/send-link`);
  },

  async listBookingLinks(): Promise<BookingLink[]> {
    const { data } = await api.get('/scheduling/booking-links');
    return data.data ?? data;
  },

  async createBookingLink(payload: CreateBookingLinkPayload): Promise<BookingLink> {
    const { data } = await api.post('/scheduling/booking-links', payload);
    return data.data ?? data;
  },

  async updateBookingLink(id: string, payload: Partial<CreateBookingLinkPayload> & { isActive?: boolean }): Promise<BookingLink> {
    const { data } = await api.patch(`/scheduling/booking-links/${id}`, payload);
    return data.data ?? data;
  },

  async deleteBookingLink(id: string): Promise<void> {
    await api.delete(`/scheduling/booking-links/${id}`);
  },

  async getGoogleCalendarStatus(): Promise<GoogleCalendarStatus> {
    const { data } = await api.get('/scheduling/google-calendar/status');
    return data.data ?? data;
  },

  async getGoogleCalendarAuthUrl(): Promise<{ authUrl: string }> {
    const { data } = await api.get('/scheduling/google-calendar/auth-url');
    return data.data ?? data;
  },

  async disconnectGoogleCalendar(): Promise<void> {
    await api.delete('/scheduling/google-calendar');
  },
};
