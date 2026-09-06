import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  isSpeechRecognitionSupported,
  requestMicrophonePermission,
} from "@/agent/voice/speechRecognition";

describe("speech recognition browser boundary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      value: undefined,
    });
  });

  it("reports unsupported browsers without throwing", () => {
    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it("stops temporary microphone tracks after permission is granted", async () => {
    const stop = vi.fn();
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue({
          getTracks: () => [{ stop }],
        }),
      },
    });

    await expect(requestMicrophonePermission()).resolves.toBe(true);
    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("returns unavailable when media devices are not exposed", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });

    await expect(requestMicrophonePermission()).resolves.toBe(false);
  });
});
