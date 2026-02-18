import { useCallback, useEffect, useRef, useState } from "react";

const INITIAL_SILENCE_MS = 4000;
const AFTER_SPEECH_SILENCE_MS = 1000;

const SpeechRecognition =
  typeof window !== "undefined" && (window as any).SpeechRecognition != null
    ? (window as any).SpeechRecognition
    : (window as any).webkitSpeechRecognition;

export function useSpeechRecognition(
  onTranscript: (text: string, isFinal: boolean) => void,
  onSilence: (transcript: string) => void,
) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<InstanceType<typeof SpeechRecognition> | null>(
    null,
  );
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transcriptRef = useRef<string>("");
  const hasReceivedSpeechRef = useRef(false);
  const isShuttingDownRef = useRef(false);

  const resetSilenceTimer = useCallback(
    (stop: () => void) => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      const delayMs = hasReceivedSpeechRef.current
        ? AFTER_SPEECH_SILENCE_MS
        : INITIAL_SILENCE_MS;
      silenceTimerRef.current = setTimeout(() => {
        silenceTimerRef.current = null;
        isShuttingDownRef.current = true;
        const finalTranscript = transcriptRef.current;
        stop();
        onSilence(finalTranscript);
      }, delayMs);
    },
    [onSilence],
  );

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;
    if (recognitionRef.current) return;

    const rec = new SpeechRecognition() as InstanceType<
      typeof SpeechRecognition
    >;
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (
      event: typeof rec extends { onresult: (e: infer E) => void } ? E : any,
    ) => {
      let fullTranscript = "";
      const results = event.results;
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const transcript = result[0]?.transcript ?? "";
        fullTranscript += transcript;
      }
      if (fullTranscript.trim() && !isShuttingDownRef.current) {
        const trimmed = fullTranscript.trim();
        transcriptRef.current = trimmed;
        hasReceivedSpeechRef.current = true;
        const isFinal = results[results.length - 1]?.isFinal ?? false;
        onTranscript(trimmed, isFinal);
        resetSilenceTimer(stopListening);
      }
    };

    rec.onerror = (event: any) => {
      if (event?.error === "no-speech" || event?.error === "aborted") return;
      stopListening();
    };

    rec.onend = () => {
      if (recognitionRef.current === rec) {
        recognitionRef.current = null;
        setIsListening(false);
      }
    };

    try {
      transcriptRef.current = "";
      hasReceivedSpeechRef.current = false;
      isShuttingDownRef.current = false;
      rec.start();
      recognitionRef.current = rec;
      setIsListening(true);
      resetSilenceTimer(stopListening);
    } catch {
      setIsListening(false);
    }
  }, [onTranscript, onSilence, resetSilenceTimer, stopListening]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  useEffect(() => {
    setIsSupported(!!SpeechRecognition);
    return () => {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
}
