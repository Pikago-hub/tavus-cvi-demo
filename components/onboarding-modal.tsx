"use client";

import { useState, useCallback } from "react";
import { MessageCircle, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/app/components/cvi/components/conversation";
import { cn } from "@/lib/utils";

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startConversation = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/conversation", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to start conversation");
      }

      const data = await response.json();
      setConversationUrl(data.conversation_url);
      setIsOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleLeave = useCallback(() => {
    setIsOpen(false);
    setIsExpanded(false);
    setConversationUrl(null);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <>
      {/* Trigger button - hidden when conversation is open */}
      {!isOpen && (
        <Button
          onClick={startConversation}
          disabled={isLoading}
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
        >
          {isLoading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      )}

      {/* Floating/Expanded conversation widget */}
      {isOpen && conversationUrl && (
        <div
          className={cn(
            "fixed z-50 shadow-2xl transition-all duration-300 ease-in-out",
            isExpanded
              ? "inset-0 w-screen h-screen rounded-none"
              : "bottom-6 right-6 w-[400px] h-[300px] rounded-xl"
          )}
        >
          {/* Expand/Collapse button */}
          <Button
            onClick={toggleExpand}
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3 z-30 h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30"
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4 text-white" />
            ) : (
              <Maximize2 className="h-4 w-4 text-white" />
            )}
          </Button>

          <Conversation
            conversationUrl={conversationUrl}
            onLeave={handleLeave}
          />
        </div>
      )}
    </>
  );
}
