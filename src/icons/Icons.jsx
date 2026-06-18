function Svg({ size = 18, children, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      {children}
    </svg>
  );
}

export function IconDocument({ size, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M6 3h8l4 4v14H6z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M13 3v5h5" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 13h6M9 16.5h6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function IconGrid({ size, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <rect x="3" y="3" width="7" height="9" rx="1.6" stroke={color} strokeWidth="1.7" />
      <rect x="14" y="3" width="7" height="5" rx="1.6" stroke={color} strokeWidth="1.7" />
      <rect x="14" y="12" width="7" height="9" rx="1.6" stroke={color} strokeWidth="1.7" />
      <rect x="3" y="16" width="7" height="5" rx="1.6" stroke={color} strokeWidth="1.7" />
    </Svg>
  );
}

export function IconSwap({ size, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M9 8l-4 4 4 4M15 8l4 4-4 4"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconBarChart({ size, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M5 19V9M12 19V5M19 19v-6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M3 21h18" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function IconBuilding({ size, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <rect x="4" y="4" width="9" height="17" rx="1.6" stroke={color} strokeWidth="1.7" />
      <path d="M13 9h7v12h-7" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 8h3M7 12h3M7 16h3M16 13h1M16 17h1" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </Svg>
  );
}

export function IconCheck({ size, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M5 12l4.5 4.5L19 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconCheckCircle({ size, color = 'var(--accent)', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M8.5 12l2.4 2.4L16 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconChevronDown({ size = 15, color = 'var(--text-3)', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M7 10l5 5 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconLock({ size, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <rect x="4" y="9" width="16" height="11" rx="2" stroke={color} strokeWidth="1.7" />
      <path d="M8 9V6a4 4 0 018 0v3" stroke={color} strokeWidth="1.7" />
    </Svg>
  );
}

export function IconSearch({ size = 17, color = 'var(--text-3)', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <circle cx="11" cy="11" r="7" stroke={color} strokeWidth="1.8" />
      <path d="M20 20l-3.5-3.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function IconSun({ size = 19, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M20 13.5A8 8 0 0110.5 4 7 7 0 1020 13.5z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconMoon({ size = 19, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <circle cx="12" cy="12" r="4.2" stroke={color} strokeWidth="1.8" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.5 5.5l1.5 1.5M17 17l1.5 1.5M18.5 5.5L17 7M7 17l-1.5 1.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function IconBell({ size = 19, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 004 0" stroke={color} strokeWidth="1.7" />
    </Svg>
  );
}

export function IconRefresh({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M20 12a8 8 0 11-2.3-5.6M20 4v4h-4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconEye({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" stroke={color} strokeWidth="1.7" />
      <circle cx="12" cy="12" r="2.6" stroke={color} strokeWidth="1.7" />
    </Svg>
  );
}

export function IconDownload({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M12 4v11m0 0l-4-4m4 4l4-4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function IconArrowLeft({ size = 17, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M14 6l-6 6 6 6" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconWarningTriangle({ size = 18, color = 'var(--warn)', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M12 3l9 16H3z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 10v4M12 17v.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
    </Svg>
  );
}

export function IconUpload({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M12 16V4m0 0L8 8m4-4l4 4"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 20h14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export function IconFolder({ size = 18, color = 'var(--accent-2)', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        stroke={color}
        strokeWidth="1.7"
      />
    </Svg>
  );
}

export function IconFile({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M7 3h7l4 4v14H7z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M13 3v5h5" stroke={color} strokeWidth="1.7" />
    </Svg>
  );
}

export function IconTrendUp({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path d="M12 3v18M5 8l7-5 7 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function IconBarsTrend({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M4 19V5M4 19h16M8 15l3-4 3 2 4-6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconAxisBars({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M3 21h18M6 21V9m6 12V4m6 17v-8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconUsers({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M9 11a3 3 0 100-6 3 3 0 000 6zM3 20a6 6 0 0112 0M17 11a3 3 0 100-6M15 14a6 6 0 016 6"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconCifrao({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M12 3v18M16 7H10a2.5 2.5 0 000 5h4a2.5 2.5 0 010 5H8"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function IconClock({ size = 16, color = 'currentColor', ...rest }) {
  return (
    <Svg size={size} {...rest}>
      <path
        d="M12 7v5l3 2M12 21a9 9 0 110-18 9 9 0 010 18z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
