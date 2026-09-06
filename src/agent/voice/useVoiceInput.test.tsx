import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useVoiceInput } from "@/agent/voice/useVoiceInput";
import type {
  BrowserSpeechRecognition,
  SpeechRecognitionErrorEventLike,
  SpeechRecognitionEventLike,
} from "@/agent/voice/speechRecognition";

class FakeRecognition implements BrowserSpeechRecognition {
  continuous = false;
  interimResults = false;
  lang = "";
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null = null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null = null;
  start = vi.fn(() => this.onstart?.());
  stop = vi.fn(() => this.onend?.());
}

describe("useVoiceInput continuous session", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: FakeRecognition,
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop: vi.fn() }],
        }),
      },
    });
  });

  it("starts recognition automatically after permission and restarts after onend", async () => {
    const recognition = new FakeRecognition();
    const constructor = vi.fn(() => recognition);
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: constructor,
    });
    const { result } = renderHook(() => useVoiceInput({ onTranscript: vi.fn() }));

    await act(async () => {
      await result.current.enableVoice();
    });

    expect(constructor).toHaveBeenCalledTimes(1);
    expect(recognition.continuous).toBe(true);
    expect(recognition.start).toHaveBeenCalledTimes(1);

    act(() => recognition.onend?.());
    act(() => vi.advanceTimersByTime(350));
    expect(constructor).toHaveBeenCalledTimes(2);
  });

  it("submits final speech once and does not restart while B is speaking", async () => {
    const recognition = new FakeRecognition();
    const constructor = vi.fn(() => recognition);
    const onTranscript = vi.fn();
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: constructor,
    });
    const { result } = renderHook(() => useVoiceInput({ onTranscript }));

    await act(async () => {
      await result.current.enableVoice();
    });

    const event = {
      results: [
        {
          isFinal: true,
          length: 1,
          0: { transcript: "Show me cleanser", confidence: 0.9 },
        },
      ],
    } as unknown as SpeechRecognitionEventLike;
    act(() => recognition.onresult?.(event));
    act(() => recognition.onresult?.(event));
    expect(onTranscript).toHaveBeenCalledTimes(1);

    act(() => result.current.beginSpeaking());
    act(() => recognition.onend?.());
    act(() => vi.advanceTimersByTime(700));
    expect(constructor).toHaveBeenCalledTimes(1);
  });
});
