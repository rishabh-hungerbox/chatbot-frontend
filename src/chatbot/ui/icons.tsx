/** Inline SVG icons for Xordium design */

import { useId } from 'react';

export function ZLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: 'var(--chat-primary)' }}
    >
      <path
        d="M8 8h16l-8 8 8 8H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CopyIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

export function SendIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

export function ThumbsUpIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

export function ThumbsDownIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
      </svg>
    );
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

export function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

/** New chat icon - purple circle with white plus (from new_icon.svg) */
export function NewIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8.00005" cy="7.99957" r="6.22222" fill="#3A1593" />
      <g clipPath="url(#clip0_34406_60328)">
        <path
          d="M7.3332 11.333V8.6666H4.6664C4.48966 8.6666 4.32016 8.59639 4.19518 8.47142C4.07021 8.34644 4 8.17694 4 8.0002C4 7.82346 4.07021 7.65396 4.19518 7.52898C4.32016 7.40401 4.48966 7.3338 4.6664 7.3338H7.3332V4.667C7.3332 4.57941 7.35045 4.49267 7.38397 4.41175C7.41749 4.33083 7.46662 4.2573 7.52856 4.19536C7.5905 4.13342 7.66403 4.08429 7.74495 4.05077C7.82587 4.01725 7.91261 4 8.0002 4C8.08779 4 8.17453 4.01725 8.25545 4.05077C8.33637 4.08429 8.4099 4.13342 8.47184 4.19536C8.53378 4.2573 8.58291 4.33083 8.61643 4.41175C8.64995 4.49267 8.6672 4.57941 8.6672 4.667V7.3334H11.334C11.5107 7.3334 11.6802 7.40361 11.8052 7.52858C11.9302 7.65356 12.0004 7.82306 12.0004 7.9998C12.0004 8.17654 11.9302 8.34604 11.8052 8.47102C11.6802 8.59599 11.5107 8.6662 11.334 8.6662H8.6672V11.3326C8.6672 11.4202 8.64995 11.5069 8.61643 11.5878C8.58291 11.6688 8.53378 11.7423 8.47184 11.8042C8.4099 11.8662 8.33637 11.9153 8.25545 11.9488C8.17453 11.9823 8.08779 11.9996 8.0002 11.9996C7.91261 11.9996 7.82587 11.9823 7.74495 11.9488C7.66403 11.9153 7.5905 11.8662 7.52856 11.8042C7.46662 11.7423 7.41749 11.6688 7.38397 11.5878C7.35045 11.5069 7.3332 11.4202 7.3332 11.3326V11.333Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_34406_60328">
          <rect width="8" height="8" fill="white" transform="translate(4 4)" />
        </clipPath>
      </defs>
    </svg>
  );
}

/** Back/chevron icon from back_button.svg - for collapse history */
export function BackButtonSvgIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.84033 6.83352L12.9853 11.989L7.84033 17.1445L9.42433 18.7285L16.1638 11.989L9.42433 5.24952L7.84033 6.83352Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function BackArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/** Microphone icon from microphone.svg - inherits color (gray when disabled) */
export function MicrophoneSvgIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: 'inherit' }}
    >
      <path
        d="M16.4079 10.3368C16.4079 9.94694 16.0918 9.63086 15.7019 9.63086C15.312 9.63086 14.996 9.94694 14.996 10.3368C14.9956 13.096 12.7585 15.3324 9.99933 15.3319C7.24078 15.3315 5.00463 13.0954 5.00422 10.3368C5.00422 9.94694 4.68814 9.63086 4.29825 9.63086C3.90836 9.63086 3.59229 9.94694 3.59229 10.3368C3.59601 13.6009 6.05025 16.3418 9.29415 16.7046V18.5872H6.7268C6.33691 18.5872 6.02083 18.9033 6.02083 19.2932C6.02083 19.683 6.33691 19.9991 6.7268 19.9991H13.2734C13.6633 19.9991 13.9794 19.683 13.9794 19.2932C13.9794 18.9033 13.6633 18.5872 13.2734 18.5872H10.7061V16.7046C13.9499 16.3418 16.4042 13.6009 16.4079 10.3368Z"
        fill="currentColor"
      />
      <path
        d="M9.99994 0C7.82565 0 6.06299 1.76261 6.06299 3.93695V10.3118C6.06556 12.4851 7.82671 14.2462 9.99994 14.2488C12.1732 14.2462 13.9343 12.4851 13.9369 10.3118V3.93695C13.9369 1.76261 12.1743 0 9.99994 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Send arrow icon from send_arrow.svg - inherits color (gray when disabled via button) */
export function SendArrowSvgIcon({ className }: { className?: string }) {
  const clipId = useId();
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: 'inherit' }}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M2.01975 1.14062C0.504128 1.14062 -0.472434 2.75391 0.234597 4.09766L2.82053 9.00391L11.4963 10L2.82053 11L0.234597 15.9062C-0.472434 17.25 0.500222 18.8633 2.01975 18.8633C2.29319 18.8633 2.56663 18.8086 2.82053 18.6992L18.8283 11.7852C20.3908 11.1094 20.3908 8.89453 18.8283 8.21875L2.82053 1.30469C2.56663 1.19531 2.29319 1.14062 2.01975 1.14062Z"
          fill="currentColor"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}
