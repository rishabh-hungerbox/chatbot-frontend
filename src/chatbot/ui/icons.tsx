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

/** Copy icon from copy_icon.svg */
export function CopySvgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 0.833984H3.33333C2.32081 0.833984 1.5 1.6548 1.5 2.66732V10.6673C1.5 11.6798 2.32081 12.5007 3.33333 12.5007H10C11.0125 12.5007 11.8333 11.6798 11.8333 10.6673V2.66732C11.8333 1.6548 11.0125 0.833984 10 0.833984Z"
        fill="currentColor"
      />
      <path
        d="M12.6665 15.1667H5.99984C5.51372 15.1663 5.0476 14.973 4.70386 14.6293C4.36012 14.2856 4.16686 13.8195 4.1665 13.3333V5.33333C4.16686 4.84721 4.36012 4.3811 4.70386 4.03736C5.0476 3.69362 5.51372 3.50035 5.99984 3.5H12.6665C13.1526 3.50035 13.6187 3.69362 13.9625 4.03736C14.3062 4.3811 14.4995 4.84721 14.4998 5.33333V13.3333C14.4995 13.8195 14.3062 14.2856 13.9625 14.6293C13.6187 14.973 13.1526 15.1663 12.6665 15.1667ZM5.99984 4.5C5.77893 4.50035 5.56718 4.58826 5.41097 4.74447C5.25477 4.90067 5.16686 5.11243 5.1665 5.33333V13.3333C5.16686 13.5542 5.25477 13.766 5.41097 13.9222C5.56718 14.0784 5.77893 14.1663 5.99984 14.1667H12.6665C12.8874 14.1663 13.0992 14.0784 13.2554 13.9222C13.4116 13.766 13.4995 13.5542 13.4998 13.3333V5.33333C13.4995 5.11243 13.4116 4.90067 13.2554 4.74447C13.0992 4.58826 12.8874 4.50035 12.6665 4.5H5.99984Z"
        fill="currentColor"
      />
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
  return <ThumbsUpSvgIcon filled={filled} />;
}

export function ThumbsDownIcon({ filled }: { filled?: boolean }) {
  return <ThumbsDownSvgIcon filled={filled} />;
}

/** Thumbs up from thumbs.svg (flipped) - gray when not selected, primary color when selected */
export function ThumbsUpSvgIcon({ filled, className }: { filled?: boolean; className?: string }) {
  const fillColor = filled ? '#3A1593' : '#C7C7C7';
  return (
    <svg
      className={className}
      width="15"
      height="14"
      viewBox="0 0 15 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'scale(-1,-1)', transformOrigin: 'center' }}
    >
      <path d="M9.33333 0H3.33333C2.78 0 2.30667 0.333333 2.10667 0.813333L0.0933333 5.51333C0.0333333 5.66667 0 5.82667 0 6V7.33333C0 8.06667 0.6 8.66667 1.33333 8.66667H5.54L4.90667 11.7133L4.88667 11.9267C4.88667 12.2 5 12.4533 5.18 12.6333L5.88667 13.3333L10.28 8.94C10.52 8.7 10.6667 8.36667 10.6667 8V1.33333C10.6667 0.6 10.0667 0 9.33333 0ZM12 0V8H14.6667V0H12Z" fill={fillColor} />
    </svg>
  );
}

/** Download icon from download_button.svg - for Download Chart button */
export function DownloadChartSvgIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.61328 3.01011V5.77331C6.61328 6.54032 7.23507 7.16211 8.00208 7.16211C8.76909 7.16211 9.39088 6.54032 9.39088 5.77331V3.01011C9.39088 2.2431 8.76909 1.62131 8.00208 1.62131C7.23507 1.62131 6.61328 2.2431 6.61328 3.01011Z"
        fill="currentColor"
      />
      <path
        d="M5.45886 5.95591H10.5437C10.6464 5.96004 10.7465 5.99006 10.8345 6.04319C10.9226 6.09632 10.9958 6.17083 11.0473 6.25982C11.0989 6.3488 11.1271 6.44936 11.1294 6.55217C11.1317 6.65498 11.108 6.75671 11.0605 6.84791L8.51726 11.2519C8.46542 11.3427 8.3905 11.4182 8.30009 11.4706C8.20968 11.5231 8.107 11.5508 8.00246 11.5508C7.89792 11.5508 7.79523 11.5231 7.70482 11.4706C7.61441 11.4182 7.53949 11.3427 7.48766 11.2519L4.94206 6.84871C4.89457 6.75745 4.87089 6.65569 4.8732 6.55285C4.87551 6.45001 4.90374 6.34941 4.95528 6.26038C5.00681 6.17136 5.07998 6.09677 5.16801 6.04355C5.25604 5.99033 5.35608 5.96018 5.45886 5.95591Z"
        fill="currentColor"
      />
      <path
        d="M13.5992 11.9746H2.39922C1.73648 11.9746 1.19922 12.5119 1.19922 13.1746C1.19922 13.8374 1.73648 14.3746 2.39922 14.3746H13.5992C14.262 14.3746 14.7992 13.8374 14.7992 13.1746C14.7992 12.5119 14.262 11.9746 13.5992 11.9746Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Thumbs down from thumbs.svg - gray when not selected, primary color when selected */
export function ThumbsDownSvgIcon({ filled, className }: { filled?: boolean; className?: string }) {
  const fillColor = filled ? '#3A1593' : '#C7C7C7';
  return (
    <svg className={className} width="15" height="14" viewBox="0 0 15 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.33333 0H3.33333C2.78 0 2.30667 0.333333 2.10667 0.813333L0.0933333 5.51333C0.0333333 5.66667 0 5.82667 0 6V7.33333C0 8.06667 0.6 8.66667 1.33333 8.66667H5.54L4.90667 11.7133L4.88667 11.9267C4.88667 12.2 5 12.4533 5.18 12.6333L5.88667 13.3333L10.28 8.94C10.52 8.7 10.6667 8.36667 10.6667 8V1.33333C10.6667 0.6 10.0667 0 9.33333 0ZM12 0V8H14.6667V0H12Z" fill={fillColor} />
    </svg>
  );
}

export function InfoIcon({ className }: { className?: string }) {
  return <InfoSvgIcon className={className} />;
}

/** Info icon from info_icon.svg */
export function InfoSvgIcon({ className }: { className?: string }) {
  const clipId = useId();
  return (
    <svg className={className} width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M6 10.5C8.48528 10.5 10.5 8.48528 10.5 6C10.5 3.51472 8.48528 1.5 6 1.5C3.51472 1.5 1.5 3.51472 1.5 6C1.5 8.48528 3.51472 10.5 6 10.5Z"
          fill="#F4F6FF"
        />
        <path
          d="M6.75 3.375C6.75 2.96079 6.41421 2.625 6 2.625C5.58579 2.625 5.25 2.96079 5.25 3.375C5.25 3.78921 5.58579 4.125 6 4.125C6.41421 4.125 6.75 3.78921 6.75 3.375Z"
          fill="#FF5148"
        />
        <path
          d="M6.75 5.625C6.75 5.21079 6.41421 4.875 6 4.875C5.58579 4.875 5.25 5.21079 5.25 5.625V8.625C5.25 9.03921 5.58579 9.375 6 9.375C6.41421 9.375 6.75 9.03921 6.75 8.625V5.625Z"
          fill="#3A1593"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="12" height="12" fill="white" />
        </clipPath>
      </defs>
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

/** History/clock icon from history_icon.svg - for Previous Chats button */
export function HistorySvgIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 12.5C10.4853 12.5 12.5 10.4853 12.5 8C12.5 5.51472 10.4853 3.5 8 3.5C5.51472 3.5 3.5 5.51472 3.5 8C3.5 10.4853 5.51472 12.5 8 12.5Z"
        fill="#3A1593"
      />
      <path
        d="M8 1C6.56971 1.00142 5.17402 1.44 4 2.25696V2C4 1.86739 3.94732 1.74021 3.85355 1.64645C3.75979 1.55268 3.63261 1.5 3.5 1.5C3.36739 1.5 3.24021 1.55268 3.14645 1.64645C3.05268 1.74021 3 1.86739 3 2V3.5C2.99996 3.56567 3.01287 3.63071 3.03798 3.69139C3.0631 3.75207 3.09993 3.8072 3.14636 3.85364C3.1928 3.90007 3.24793 3.9369 3.30861 3.96202C3.36929 3.98713 3.43433 4.00004 3.5 4H5C5.13261 4 5.25979 3.94732 5.35355 3.85355C5.44732 3.75979 5.5 3.63261 5.5 3.5C5.5 3.36739 5.44732 3.24021 5.35355 3.14645C5.25979 3.05268 5.13261 3 5 3H4.68963C5.80398 2.26322 7.13241 1.91959 8.46424 2.0236C9.79607 2.12761 11.0551 2.6733 12.0415 3.57414C13.028 4.47498 13.6854 5.67938 13.9096 6.99632C14.1337 8.31327 13.9118 9.66736 13.2789 10.8438C12.6461 12.0203 11.6385 12.9518 10.4161 13.4906C9.19371 14.0294 7.8264 14.1446 6.53105 13.818C5.23571 13.4914 4.08649 12.7417 3.26566 11.6877C2.44483 10.6337 1.9994 9.33589 2 8C2 7.86739 1.94732 7.74021 1.85355 7.64645C1.75979 7.55268 1.63261 7.5 1.5 7.5C1.36739 7.5 1.24021 7.55268 1.14645 7.64645C1.05268 7.74021 1 7.86739 1 8C1 9.38447 1.41054 10.7378 2.17971 11.889C2.94888 13.0401 4.04213 13.9373 5.32122 14.4672C6.6003 14.997 8.00776 15.1356 9.36563 14.8655C10.7235 14.5954 11.9708 13.9287 12.9497 12.9497C13.9287 11.9708 14.5954 10.7235 14.8655 9.36563C15.1356 8.00776 14.997 6.6003 14.4672 5.32122C13.9373 4.04213 13.0401 2.94888 11.889 2.17971C10.7378 1.41054 9.38447 1 8 1Z"
        fill="#3A1593"
      />
      <path
        d="M9.77734 8.584L8.5 7.73242V5.5C8.5 5.36739 8.44732 5.24021 8.35355 5.14645C8.25979 5.05268 8.13261 5 8 5C7.86739 5 7.74021 5.05268 7.64645 5.14645C7.55268 5.24021 7.5 5.36739 7.5 5.5V8C7.50002 8.08231 7.52035 8.16334 7.55919 8.23591C7.59803 8.30847 7.65418 8.37033 7.72265 8.416L9.22266 9.416C9.333 9.48802 9.4673 9.51357 9.59638 9.48711C9.72546 9.46064 9.83887 9.38429 9.91196 9.27465C9.98506 9.16502 10.0119 9.03097 9.98671 8.90164C9.9615 8.77231 9.88626 8.65816 9.77734 8.584Z"
        fill="#FFCE1A"
      />
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

/** Red cross close icon - circle with X */
export function RedCrossCloseSvgIcon({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 4.05768e-06C8.02219 4.05768e-06 6.08879 0.586494 4.4443 1.68531C2.79981 2.78412 1.51809 4.34591 0.761209 6.17317C0.00433284 8.00043 -0.193701 10.0111 0.192152 11.9509C0.578004 13.8907 1.53041 15.6725 2.92894 17.0711C4.32746 18.4696 6.10929 19.422 8.0491 19.8079C9.98891 20.1937 11.9996 19.9957 13.8268 19.2388C15.6541 18.4819 17.2159 17.2002 18.3147 15.5557C19.4135 13.9112 20 11.9778 20 10C20.0012 8.68645 19.7433 7.38556 19.2412 6.17177C18.7391 4.95798 18.0025 3.85512 17.0737 2.9263C16.1449 1.99747 15.042 1.26093 13.8282 0.758798C12.6144 0.25667 11.3136 -0.00117974 10 4.05768e-06ZM15 13.59L13.59 15L10 11.41L6.41 15L5 13.59L8.59 10L5 6.41L6.41 5L10 8.59L13.59 5L15 6.41L11.41 10L15 13.59Z"
        fill="#FF5148"
      />
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

/** Long back arrow (long_back_aero.svg) - for mobile close/back button */
export function LongBackAeroSvgIcon({ className }: { className?: string }) {
  const clipId = useId();
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M9.51892 20.0607C9.63798 20.1822 9.77996 20.2789 9.93661 20.3452C10.0933 20.4114 10.2615 20.446 10.4316 20.4469C10.6017 20.4477 10.7703 20.4149 10.9276 20.3502C11.0849 20.2855 11.2279 20.1902 11.3482 20.0699C11.4684 19.9497 11.5637 19.8067 11.6284 19.6494C11.6931 19.4921 11.726 19.3235 11.7251 19.1534C11.7242 18.9833 11.6897 18.815 11.6234 18.6584C11.5571 18.5017 11.4604 18.3598 11.3389 18.2407L6.39392 13.2957H20.7129C21.0543 13.2957 21.3816 13.1601 21.623 12.9187C21.8643 12.6774 21.9999 12.35 21.9999 12.0087C21.9999 11.6674 21.8643 11.34 21.623 11.0987C21.3816 10.8573 21.0543 10.7217 20.7129 10.7217H6.39293L11.3389 5.7757C11.5763 5.53353 11.7084 5.20747 11.7067 4.86839C11.705 4.52932 11.5696 4.20461 11.3298 3.96484C11.09 3.72508 10.7653 3.58962 10.4262 3.58791C10.0872 3.58619 9.7611 3.71837 9.51892 3.9557L2.37593 11.0977C2.1346 11.3391 1.99902 11.6664 1.99902 12.0077C1.99902 12.349 2.1346 12.6763 2.37593 12.9177L9.51892 20.0607Z"
          fill="#3A1593"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <rect width="24" height="24" fill="white" />
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
      version="1.1"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      transform="matrix(-1,0,0,1,0,0)"
    >
      <path
        d="M7.84033 6.83352L12.9853 11.989L7.84033 17.1445L9.42433 18.7285L16.1638 11.989L9.42433 5.24952L7.84033 6.83352Z"
        fill="black"
        fillOpacity="0.87"
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

/** Upload image icon from upload_image_icon.svg - for image attachment */
export function UploadImageSvgIcon({ className }: { className?: string }) {
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
        d="M10.0005 18.958C7.98047 18.958 6.52047 18.958 5.34547 18.8005C4.02297 18.623 3.13047 18.238 2.44547 17.5555C1.76297 16.873 1.37797 15.978 1.20047 14.6555C1.04297 13.4805 1.04297 12.0205 1.04297 10.0005C1.04297 7.98047 1.04297 6.52047 1.20047 5.34547C1.37797 4.02297 1.76297 3.13047 2.44547 2.44547C3.12797 1.76047 4.02297 1.37797 5.34547 1.20047C6.52047 1.04297 7.98047 1.04297 10.0005 1.04297C10.3455 1.04297 10.6255 1.32297 10.6255 1.66797C10.6255 2.01297 10.3455 2.29297 10.0005 2.29297C6.25047 2.29297 4.36797 2.29297 3.33047 3.33047C2.29297 4.36797 2.29297 6.25047 2.29297 10.0005C2.29297 13.7505 2.29297 15.633 3.33047 16.6705C4.36797 17.708 6.25047 17.708 10.0005 17.708C13.7505 17.708 15.633 17.708 16.6705 16.6705C17.708 15.633 17.708 13.7505 17.708 10.0005C17.708 9.65547 17.988 9.37547 18.333 9.37547C18.678 9.37547 18.958 9.65547 18.958 10.0005C18.958 12.0205 18.958 13.4805 18.8005 14.6555C18.623 15.978 18.238 16.8705 17.5555 17.5555C16.873 18.238 15.978 18.623 14.6555 18.8005C13.4805 18.958 12.0205 18.958 10.0005 18.958Z"
        fill="currentColor"
      />
      <path
        d="M17.5007 16.0438C17.3507 16.0438 17.2032 15.9913 17.0832 15.8838L17.5007 16.8683C16.7357 16.1758 17.2325 16.485 16.5 17C15.5875 17.6425 14.2875 18.79 13.5 18H8.5C4 18 3.22823 16.4208 2.71823 16.8683L2.08073 10.8913C1.82073 11.1188 1.42573 11.0913 1.19823 10.8313C0.970728 10.5713 0.998228 10.1763 1.25823 9.94882L2.71823 8.67132C3.72073 7.79382 5.24573 7.84382 6.18823 8.78632L9.76323 12.3613C10.1232 12.7213 10.6832 12.7688 11.0982 12.4763C11.7207 12.0388 12.4532 11.7888 13.1582 11.7738C13.9457 11.7588 14.6657 12.0213 15.2357 12.5363L17.9207 14.9538C18.1782 15.1838 18.1982 15.5788 17.9682 15.8363C17.8407 15.9738 17.6707 16.0438 17.5007 16.0438Z"
        fill="currentColor"
      />
      <path
        d="M14.1682 1.04297C14.0082 1.04297 13.8482 1.10297 13.7257 1.22547L11.2257 3.72547C10.9807 3.97047 10.9807 4.36547 11.2257 4.61047C11.4707 4.85547 11.8657 4.85547 12.1107 4.61047L13.5432 3.17797V9.16797C13.5432 9.51297 13.8232 9.79297 14.1682 9.79297C14.5132 9.79297 14.7932 9.51297 14.7932 9.16797V3.17797L16.2257 4.61047C16.4707 4.85547 16.8657 4.85547 17.1107 4.61047C17.3557 4.36547 17.3557 3.97047 17.1107 3.72547L14.6107 1.22547C14.4882 1.10547 14.3282 1.04297 14.1682 1.04297Z"
        fill="currentColor"
      />
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

/** Reasoning step icon - human head with gear (execution details timeline) */
export function ReasoningStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
      <path d="M16.5 7.5l1.2-1.2a1.5 1.5 0 0 1 2.1 2.1l-1.2 1.2" />
      <path d="M15 9l2-2" />
    </svg>
  );
}

/** Data Processing step icon - spinning/sync arrows (execution details timeline) */
export function DataProcessingStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}

/** Query step icon - document (execution details timeline) */
export function QueryStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

/** Tool Call step icon - gear (execution details timeline) */
export function ToolCallStepIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Option tick icon from option_tick.svg - for selected option choices */
export function OptionTickSvgIcon({ className }: { className?: string }) {
  const clipId = useId();
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          d="M18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10Z"
          fill="#3A1593"
        />
        <path
          d="M17 10C17 6.13401 13.866 3 10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10Z"
          stroke="#3A1593"
          strokeWidth="2"
        />
        <path
          d="M8.0744 13.3901H7.98627C7.85707 13.3761 7.73233 13.3358 7.61932 13.2717C7.50632 13.2075 7.40746 13.1208 7.32929 13.017L5.55438 10.5761C5.45914 10.483 5.38528 10.3703 5.33783 10.2459C5.29038 10.1215 5.27039 9.98815 5.27948 9.85528C5.28857 9.72242 5.32637 9.5932 5.39032 9.47638C5.45427 9.35956 5.54305 9.25802 5.65009 9.17877C5.75712 9.09952 5.88004 9.04435 6.01044 9.01727C6.14083 8.99019 6.27548 8.99183 6.40521 9.02191C6.53495 9.05199 6.65673 9.10989 6.7619 9.19159C6.86708 9.27329 6.9531 9.37679 7.01434 9.49505L8.17645 11.0881L12.7934 6.76312C12.8804 6.67426 12.9844 6.60388 13.0993 6.55633C13.2142 6.50879 13.3377 6.48497 13.4621 6.48639C13.5865 6.48781 13.7091 6.51448 13.8229 6.56464C13.9367 6.61479 14.0393 6.68743 14.1242 6.77826C14.2092 6.86909 14.2749 6.97618 14.3173 7.09308C14.3598 7.20997 14.3779 7.33426 14.371 7.45843C14.3641 7.5826 14.3322 7.70413 14.277 7.81561C14.2219 7.92709 14.145 8.02625 14.0505 8.10712L8.67328 13.1411C8.51119 13.2951 8.29796 13.3838 8.0744 13.3901Z"
          fill="white"
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

/** Stop icon - square for cancelling ongoing request */
export function StopSvgIcon({ className }: { className?: string }) {
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
      <rect x="4" y="4" width="12" height="12" rx="2" fill="currentColor" />
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
