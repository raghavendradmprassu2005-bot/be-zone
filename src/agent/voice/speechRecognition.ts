export interface SpeechRecognitionAlternativeResult {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeResult;
}

export interface SpeechRecognitionEventLike extends Event {
  results: {
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

export interface SpeechRecognitionErrorEventLike extends Event {
  error: string;
}

export interface BrowserSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

const getSpeechRecognitionConstructor = (): SpeechRecognitionConstructor | null => {
  if (typeof window === "undefined") return null;

  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
};

export const isSpeechRecognitionSupported = (): boolean =>
  getSpeechRecognitionConstructor() !== null;

export const createSpeechRecognition = (): BrowserSpeechRecognition | null => {
  const Constructor = getSpeechRecognitionConstructor();
  return Constructor ? new Constructor() : null;
};

export const requestMicrophonePermission = async (): Promise<boolean> => {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return false;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => track.stop());
  return true;
};
