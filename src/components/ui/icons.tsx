import type { SVGProps } from 'react';

export function EvolutionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="18" fill="url(#ev_grad)" />
      <path d="M13 10h7l-3 7h5l-9 9 2-8h-5l3-8Z" fill="white" />
      <defs>
        <linearGradient id="ev_grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#25D366" />
          <stop offset="1" stopColor="#128C7E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function EvolutionGoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="18" fill="url(#evgo_grad)" />
      <path d="M12 18a6 6 0 1 1 6 6v-3l-4-3 4-3v-3a6 6 0 0 1-6 6Z" fill="white" />
      <circle cx="22" cy="18" r="2" fill="white" fillOpacity="0.7" />
      <defs>
        <linearGradient id="evgo_grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6EE7B7" />
          <stop offset="1" stopColor="#059669" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function OpenAIIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="18" fill="#000" />
      <path
        d="M26.5 15.7a5.2 5.2 0 0 0-.45-4.27 5.27 5.27 0 0 0-5.66-2.53 5.2 5.2 0 0 0-3.92-1.75 5.27 5.27 0 0 0-5.02 3.65 5.2 5.2 0 0 0-3.48 2.52 5.27 5.27 0 0 0 .65 6.18 5.2 5.2 0 0 0 .45 4.27 5.27 5.27 0 0 0 5.66 2.53 5.2 5.2 0 0 0 3.92 1.75 5.27 5.27 0 0 0 5.02-3.65 5.2 5.2 0 0 0 3.48-2.52 5.27 5.27 0 0 0-.65-6.18ZM18 22.7a3.9 3.9 0 0 1-2.5-.9l.12-.07 4.15-2.4a.68.68 0 0 0 .34-.59v-5.87l1.76 1.01a.06.06 0 0 1 .03.05v4.85A3.93 3.93 0 0 1 18 22.7Zm-8.4-3.6a3.9 3.9 0 0 1-.47-2.62l.13.07 4.14 2.4a.68.68 0 0 0 .68 0l5.06-2.92v2.03a.06.06 0 0 1-.02.05l-4.19 2.42a3.93 3.93 0 0 1-5.33-1.43Zm-1.1-9.07a3.9 3.9 0 0 1 2.04-1.71v4.94a.68.68 0 0 0 .34.59l5.06 2.92-1.75 1.01a.06.06 0 0 1-.06 0L9.94 15.3a3.93 3.93 0 0 1-.44-5.27Zm14.42 3.38-5.06-2.92 1.75-1.01a.06.06 0 0 1 .06 0l4.19 2.42a3.93 3.93 0 0 1-.61 7.1v-4.94a.68.68 0 0 0-.33-.65Zm1.74-2.65-.12-.08-4.14-2.4a.68.68 0 0 0-.68 0L15.66 11.3V9.27a.06.06 0 0 1 .03-.05l4.18-2.41a3.93 3.93 0 0 1 5.86 4.08l-.07-.03Zm-10.97 3.6-1.75-1.01a.06.06 0 0 1-.03-.05v-4.85a3.93 3.93 0 0 1 6.45-3.02l-.12.07-4.15 2.4a.68.68 0 0 0-.34.59l-.06 5.87Zm.95-2.05 2.25-1.3 2.25 1.3v2.6l-2.25 1.3-2.25-1.3v-2.6Z"
        fill="white"
      />
    </svg>
  );
}

export function GrokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="18" fill="#000" />
      <text x="18" y="23" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white" fontFamily="serif">𝕏</text>
    </svg>
  );
}

export function GeminiIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="18" fill="url(#gem_grad)" />
      <path d="M18 7c0 6.08-4.92 11-11 11 6.08 0 11 4.92 11 11 0-6.08 4.92-11 11-11-6.08 0-11-4.92-11-11Z" fill="white" />
      <defs>
        <linearGradient id="gem_grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4285F4" />
          <stop offset="0.5" stopColor="#9C27B0" />
          <stop offset="1" stopColor="#EA4335" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AnthropicIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="18" fill="#D97757" />
      <path d="M21.5 10h-3L13 26h3l1.2-3.2h5.6L24 26h3L21.5 10Zm-3.5 9.8 1.8-4.8 1.8 4.8h-3.6Z" fill="white" />
    </svg>
  );
}

export function ZappfyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 50 45" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M9.476 36.599s-2.672.057-4.005-.012C2.239 36.42.083 34.344.055 31.096c-.073-8.511-.073-17.025 0-25.536C.083 2.18 2.269.052 5.7.039 18.439-.012 31.18-.014 43.917.039c3.517.013 5.634 2.215 5.657 5.793.053 8.333.053 16.665-.006 24.998-.028 3.684-2.186 5.739-5.971 5.762-7.8.043-15.599.014-23.428.014-2.092 4.831-5.368 8.383-10.557 8.394-1.706.005-2.922-.417-2.922-.417s2.916-1.322 3.925-3.615c1.202-2.731.454-4.351.454-4.351l-1.594-.018Z"
        fill="url(#zappfy_grad)"
      />
      <path
        d="M27.828 11.226h-8.823a4.226 4.226 0 0 1-4.228-4.223h20.331v4.223L21.655 24.896h9.327a4.226 4.226 0 0 1 4.228 4.223H14.41v-4.223l13.419-13.67Z"
        fill="#171D18"
      />
      <defs>
        <linearGradient id="zappfy_grad" x1="-10.158" y1="43.912" x2="51.345" y2="-1.247" gradientUnits="userSpaceOnUse">
          <stop stopColor="#51C26F" />
          <stop offset="1" stopColor="#F2E901" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function MetaIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="url(#meta_grad)"
        d="M18 1L21.62 4.48L26.5 3.28L27.9 8.1L32.72 9.5L31.52 14.38L35 18L31.52 21.62L32.72 26.5L27.9 27.9L26.5 32.72L21.62 31.52L18 35L14.38 31.52L9.5 32.72L8.1 27.9L3.28 26.5L4.48 21.62L1 18L4.48 14.38L3.28 9.5L8.1 8.1L9.5 3.28L14.38 4.48Z"
      />
      <path
        d="M11.5 18.5L16 23L25 13.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="meta_grad" x1="18" y1="1" x2="18" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1FB1FF" />
          <stop offset="1" stopColor="#0066E1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="18" fill="url(#ig_grad)" />
      <rect x="9.5" y="9.5" width="17" height="17" rx="5" stroke="white" strokeWidth="2.6" fill="none" />
      <circle cx="18" cy="18" r="4.4" stroke="white" strokeWidth="2.6" fill="none" />
      <circle cx="23.2" cy="12.8" r="1.15" fill="white" />
      <defs>
        <radialGradient id="ig_grad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(7 38) rotate(-55) scale(48)">
          <stop stopColor="#FFD600" />
          <stop offset="0.25" stopColor="#FF7A00" />
          <stop offset="0.55" stopColor="#FF137C" />
          <stop offset="0.85" stopColor="#A02DAA" />
          <stop offset="1" stopColor="#5851DB" />
        </radialGradient>
      </defs>
    </svg>
  );
}
