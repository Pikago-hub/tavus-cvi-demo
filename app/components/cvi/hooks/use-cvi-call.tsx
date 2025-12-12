"use client";

import { useCallback } from "react";
import { useDaily } from "@daily-co/daily-react";

export const useCVICall = (): {
  joinCall: (props: { url: string }) => Promise<void>;
  leaveCall: () => void;
} => {
  const daily = useDaily();

  const joinCall = useCallback(
    async ({ url }: { url: string }) => {
      // Leave any existing meeting first to avoid "already joined" warning
      await daily?.leave();

      daily?.join({
        url: url,
        inputSettings: {
          audio: {
            processor: {
              type: "noise-cancellation",
            },
          },
        },
      });
    },
    [daily]
  );

  const leaveCall = useCallback(() => {
    daily?.leave();
  }, [daily]);

  return { joinCall, leaveCall };
};
