"use client";

import React, { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DailyAudioTrack,
  DailyVideo,
  useDaily,
  useDailyEvent,
  useDevices,
  useLocalSessionId,
  useMeetingState,
  useScreenVideoTrack,
  useVideoTrack,
} from "@daily-co/daily-react";
import {
  MicSelectBtn,
  CameraSelectBtn,
  ScreenShareButton,
} from "../device-select";
import { useLocalScreenshare } from "../../hooks/use-local-screenshare";
import { useReplicaIDs } from "../../hooks/use-replica-ids";
import { useCVICall } from "../../hooks/use-cvi-call";
import { AudioWave } from "../audio-wave";

import styles from "./conversation.module.css";

interface ConversationProps {
  onLeave: () => void;
  conversationUrl: string;
}

const VideoPreview = React.memo(({ id }: { id: string }) => {
  const videoState = useVideoTrack(id);
  const widthVideo = videoState.track?.getSettings()?.width;
  const heightVideo = videoState.track?.getSettings()?.height;
  const isVertical =
    widthVideo && heightVideo ? widthVideo < heightVideo : false;

  return (
    <div
      className={`${styles.previewVideoContainer} ${
        isVertical ? styles.previewVideoContainerVertical : ""
      } ${videoState.isOff ? styles.previewVideoContainerHidden : ""}`}
    >
      <DailyVideo
        automirror
        sessionId={id}
        type="video"
        className={`${styles.previewVideo} ${
          isVertical ? styles.previewVideoVertical : ""
        } ${videoState.isOff ? styles.previewVideoHidden : ""}`}
      />
      <div className={styles.audioWaveContainer}>
        <AudioWave id={id} />
      </div>
    </div>
  );
});
VideoPreview.displayName = "VideoPreview";

const PreviewVideos = React.memo(() => {
  const localId = useLocalSessionId();
  const { isScreenSharing } = useLocalScreenshare();
  const replicaIds = useReplicaIDs();
  const replicaId = replicaIds[0];

  return (
    <>
      {isScreenSharing && <VideoPreview id={replicaId} />}
      <VideoPreview id={localId} />
    </>
  );
});
PreviewVideos.displayName = "PreviewVideos";

const MainVideo = React.memo(() => {
  const replicaIds = useReplicaIDs();
  const localId = useLocalSessionId();
  const videoState = useVideoTrack(replicaIds[0]);
  const screenVideoState = useScreenVideoTrack(localId);
  const isScreenSharing = !screenVideoState.isOff;
  const replicaId = replicaIds[0];

  if (!replicaId) {
    return (
      <div className={styles.waitingContainer}>
        <p>Connecting...</p>
      </div>
    );
  }

  // Switching between replica video and screen sharing video
  return (
    <div
      className={`${styles.mainVideoContainer} ${
        isScreenSharing ? styles.mainVideoContainerScreenSharing : ""
      }`}
    >
      <DailyVideo
        automirror
        sessionId={isScreenSharing ? localId : replicaId}
        type={isScreenSharing ? "screenVideo" : "video"}
        className={`${styles.mainVideo}
				${isScreenSharing ? styles.mainVideoScreenSharing : ""}
				${videoState.isOff ? styles.mainVideoHidden : ""}`}
      />
      <DailyAudioTrack sessionId={replicaId} />
    </div>
  );
});
MainVideo.displayName = "MainVideo";

export const Conversation = React.memo(
  ({ onLeave, conversationUrl }: ConversationProps) => {
    const { joinCall, leaveCall } = useCVICall();
    const meetingState = useMeetingState();
    const { hasMicError } = useDevices();
    const router = useRouter();
    const daily = useDaily();

    useDailyEvent(
      "app-message",
      useCallback(
        (ev) => {
          const data = ev?.data;
          if (data) {
            // Check for navigation tool call
            if (
              data.event_type === "conversation.tool_call" ||
              data.event_type === "tool_call" ||
              data.type === "tool_call"
            ) {
              const toolName =
                data.properties?.name || data.tool_name || data.name;

              if (
                toolName === "navigateToSection" ||
                toolName === "navigate" ||
                toolName === "navigate_to"
              ) {
                let args: { section?: string; path?: string; url?: string } =
                  {};
                try {
                  if (typeof data.properties?.arguments === "string") {
                    args = JSON.parse(data.properties.arguments);
                  } else {
                    args =
                      data.properties?.arguments ||
                      data.tool_args ||
                      data.args ||
                      {};
                  }
                } catch (e) {
                  console.error("Failed to parse tool arguments:", e);
                }

                const section = args.section;
                const pathArg = args.path || args.url;

                let targetPath = pathArg;
                if (!targetPath && section) {
                  targetPath = `/${section}`;
                }

                if (targetPath) {
                  const conversationId =
                    data.conversation_id || data.properties?.conversation_id;
                  const toolCallId =
                    data.inference_id ||
                    data.properties?.tool_call_id ||
                    data.tool_call_id ||
                    data.id;

                  console.log("Tool call details:", {
                    conversationId,
                    toolCallId,
                    toolName,
                    targetPath,
                    fullData: data,
                  });

                  // Navigate first
                  console.log("Navigating to:", targetPath);
                  router.push(targetPath);

                  // Send tool result back to Tavus CVI
                  const toolResultResponse = {
                    message_type: "conversation",
                    event_type: "conversation.tool_call_result",
                    ...(conversationId && {
                      conversation_id: conversationId,
                    }),
                    ...(toolCallId && { inference_id: toolCallId }),
                    properties: {
                      name: toolName,
                      ...(toolCallId && { tool_call_id: toolCallId }),
                      result: JSON.stringify({
                        success: true,
                        navigated_to: targetPath,
                        current_page: targetPath.replace("/", "") || "home",
                      }),
                    },
                  };

                  console.log("Sending tool_call_result:", toolResultResponse);
                  daily?.sendAppMessage(toolResultResponse, "*");
                } else {
                  console.warn(
                    "Navigation tool called but no path/section provided:",
                    data
                  );
                }
              }
            }
          }
        },
        [router, daily]
      )
    );

    useEffect(() => {
      if (meetingState === "error") {
        onLeave();
      }
    }, [meetingState, onLeave]);

    // Initialize call when conversation is available
    useEffect(() => {
      joinCall({ url: conversationUrl });
    }, [joinCall, conversationUrl]);

    const handleLeave = useCallback(() => {
      leaveCall();
      onLeave();
    }, [leaveCall, onLeave]);

    return (
      <div className={styles.container}>
        <div className={styles.videoContainer}>
          {hasMicError && (
            <div className={styles.errorContainer}>
              <p>
                Camera or microphone access denied. Please check your settings
                and try again.
              </p>
            </div>
          )}

          {/* Main video */}
          <div className={styles.mainVideoContainer}>
            <MainVideo />
          </div>

          {/* Self view */}
          <div className={styles.selfViewContainer}>
            <PreviewVideos />
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerControls}>
            <MicSelectBtn />
            <CameraSelectBtn />
            <ScreenShareButton />
            <button
              type="button"
              className={styles.leaveButton}
              onClick={handleLeave}
            >
              <span className={styles.leaveButtonIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  role="img"
                  aria-label="Leave Call"
                >
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }
);
Conversation.displayName = "Conversation";
