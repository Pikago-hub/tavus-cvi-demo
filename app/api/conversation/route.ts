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
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        persona_id: personaId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to create conversation" },
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
