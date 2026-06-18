'use client';

import { useMemo, useRef } from 'react';
import type { Appointment } from '../services/scheduling.service';

const HOUR_START = 7;
const HOUR_END = 22;
const TOTAL_HOURS = HOUR_END - HOUR_START;
const HOUR_HEIGHT = 64; // px per hour

const STATUS_BLOCK: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 border-blue-400 text-blue-800 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300',
  CONFIRMED: 'bg-green-100 border-green-400 text-green-800 dark:bg-green-900/40 dark:border-green-500 dark:text-green-300',
  COMPLETED: 'bg-zinc-100 border-zinc-400 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-600 dark:text-zinc-400',
  CANCELLED: 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-700 dark:text-red-400',
  NO_SHOW: 'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-900/30 dark:border-amber-600 dark:text-amber-400',
};

function getDayStart(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekDays(anchor: Date): Date[] {
  const monday = new Date(anchor);
  const day = anchor.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(anchor.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function minutesFromStart(date: Date): number {
  return (date.getHours() - HOUR_START) * 60 + date.getMinutes();
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface AppointmentBlock {
  appointment: Appointment;
  top: number;
  height: number;
  column: number;
  columns: number;
}

function layoutBlocks(appts: Appointment[]): AppointmentBlock[] {
  const sorted = [...appts].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  const groups: Appointment[][] = [];
  let currentGroup: Appointment[] = [];
  let groupEnd = 0;

  for (const a of sorted) {
    const start = new Date(a.startsAt).getTime();
    const end = new Date(a.endsAt).getTime();
    if (currentGroup.length === 0 || start < groupEnd) {
      currentGroup.push(a);
      groupEnd = Math.max(groupEnd, end);
    } else {
      groups.push(currentGroup);
      currentGroup = [a];
      groupEnd = end;
    }
  }
  if (currentGroup.length) groups.push(currentGroup);

  const result: AppointmentBlock[] = [];
  for (const group of groups) {
    const cols = group.length;
    group.forEach((a, idx) => {
      const startMinutes = clamp(minutesFromStart(new Date(a.startsAt)), 0, TOTAL_HOURS * 60);
      const endMinutes = clamp(minutesFromStart(new Date(a.endsAt)), 0, TOTAL_HOURS * 60);
      const duration = Math.max(endMinutes - startMinutes, 15);
      result.push({
        appointment: a,
        top: (startMinutes / 60) * HOUR_HEIGHT,
        height: (duration / 60) * HOUR_HEIGHT - 2,
        column: idx,
        columns: cols,
      });
    });
  }
  return result;
}

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
const MONTH_NAMES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

interface Props {
  weekAnchor: Date;
  appointments: Appointment[];
  onSlotClick: (startsAt: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
}

export function CalendarWeekView({ weekAnchor, appointments, onSlotClick, onAppointmentClick }: Props) {
  const days = getWeekDays(weekAnchor);
  const now = new Date();
  const nowMinutes = minutesFromStart(now);
  const nowTop = (nowMinutes / 60) * HOUR_HEIGHT;
  const isCurrentWeek = days.some(
    (d) => d.toDateString() === now.toDateString()
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const byDay = useMemo(() => {
    return days.map((day) => {
      const dayStart = getDayStart(day).getTime();
      const dayEnd = dayStart + 86400000;
      const dayAppts = appointments.filter((a) => {
        const t = new Date(a.startsAt).getTime();
        return t >= dayStart && t < dayEnd;
      });
      return layoutBlocks(dayAppts);
    });
  }, [days, appointments]);

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => HOUR_START + i);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      {/* Day headers */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-700">
        <div className="w-14 shrink-0 border-r border-zinc-200 dark:border-zinc-700" />
        {days.map((day, i) => {
          const isToday = day.toDateString() === now.toDateString();
          return (
            <div
              key={i}
              className={`flex flex-1 flex-col items-center py-2 ${i < 6 ? 'border-r border-zinc-100 dark:border-zinc-800' : ''}`}
            >
              <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                {DAY_NAMES[i]}
              </span>
              <span
                className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isToday
                    ? 'bg-primary text-primary-foreground'
                    : 'text-zinc-700 dark:text-zinc-200'
                }`}
              >
                {day.getDate()}
              </span>
              <span className="text-[10px] text-zinc-400">{MONTH_NAMES[day.getMonth()]}</span>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div ref={scrollRef} className="flex flex-1 overflow-y-auto">
        {/* Hours column */}
        <div className="relative w-14 shrink-0 border-r border-zinc-200 dark:border-zinc-700">
          {hours.map((h) => (
            <div
              key={h}
              style={{ height: HOUR_HEIGHT }}
              className="flex items-start justify-end pr-2 pt-1"
            >
              <span className="text-[10px] text-zinc-400">
                {String(h).padStart(2, '0')}h
              </span>
            </div>
          ))}
        </div>

        {/* Days */}
        {days.map((day, di) => {
          const isToday = day.toDateString() === now.toDateString();
          return (
            <div
              key={di}
              className={`relative flex-1 ${di < 6 ? 'border-r border-zinc-100 dark:border-zinc-800' : ''}`}
              style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
            >
              {/* Hour lines */}
              {hours.map((h, hi) => (
                <div
                  key={h}
                  style={{ top: hi * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  className="absolute inset-x-0 cursor-pointer border-b border-zinc-100 hover:bg-zinc-50/60 dark:border-zinc-800 dark:hover:bg-white/5"
                  onClick={() => {
                    const d = new Date(day);
                    d.setHours(h, 0, 0, 0);
                    onSlotClick(d.toISOString());
                  }}
                />
              ))}

              {/* Current time indicator */}
              {isToday && nowMinutes >= 0 && nowMinutes <= TOTAL_HOURS * 60 && (
                <div
                  style={{ top: nowTop }}
                  className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                >
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <div className="h-px flex-1 bg-red-400" />
                </div>
              )}

              {/* Appointment blocks */}
              {byDay[di].map(({ appointment: a, top, height, column, columns }) => (
                <button
                  key={a.id}
                  onClick={(e) => { e.stopPropagation(); onAppointmentClick(a); }}
                  style={{
                    top,
                    height,
                    left: `${(column / columns) * 100 + 1}%`,
                    width: `${(1 / columns) * 100 - 2}%`,
                  }}
                  className={`absolute z-20 overflow-hidden rounded-md border-l-2 px-1.5 py-0.5 text-left text-[11px] font-medium leading-tight shadow-sm transition-opacity hover:opacity-90 ${STATUS_BLOCK[a.status] ?? STATUS_BLOCK.SCHEDULED}`}
                >
                  <div className="truncate font-semibold">{a.title}</div>
                  {height > 30 && a.contactName && (
                    <div className="truncate opacity-75">{a.contactName}</div>
                  )}
                  {height > 44 && a.meetLink && (
                    <div className="mt-0.5 truncate opacity-60">📹 Meet</div>
                  )}
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
