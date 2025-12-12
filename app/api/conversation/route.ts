import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const apiKey = process.env.TAVUS_API_KEY;
  const personaId = process.env.TAVUS_PERSONA_ID;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TAVUS_API_KEY is not configured" },
      { status: 500 }
    );
  }

  if (!personaId) {
    return NextResponse.json(
      { error: "TAVUS_PERSONA_ID is not configured" },
      { status: 500 }
    );
  }

  try {
    const payload = {
      persona_id: personaId,
      conversational_context: "The user has just entered the application for a demo session.",
      // The greeting is handled here, ensuring the CVI speaks first.
      custom_greeting: "Hi! I'm Danny, your onboarding tour guide. Welcome! I'm here to help you get settled in quickly. To get us started, could you tell me a little bit about what brings you to the app today?",
      properties: {
        max_call_duration: 3600,
        participant_left_timeout: 60,
      },
    };

    console.log("Creating Tavus conversation with payload:", JSON.stringify(payload, null, 2));

    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Tavus API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      return NextResponse.json(
        { error: errorData.message || "Failed to create conversation", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ conversation_url: data.conversation_url });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
