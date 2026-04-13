import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

export interface Ticket {
  id: string;
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const { tickets } = await req.json();
    if (!tickets || tickets.length === 0) {
      return NextResponse.json({ error: "No tickets provided" }, { status: 400 });
    }

    const ticketList = tickets.map((t: Ticket, i: number) => `[Ticket ${i + 1}] ${t.text}`).join("\n\n");

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a support engineering assistant. Always respond with valid JSON only. No markdown, no backticks, no explanation.",
        },
        {
          role: "user",
          content: `Analyze these support tickets and return this exact JSON shape:
{
  "clusters": [
    {
      "category": "short category name",
      "emoji": "single relevant emoji",
      "count": number of tickets in this cluster,
      "tickets": ["ticket text truncated to 80 chars", ...],
      "priority": "critical" | "high" | "medium" | "low",
      "pattern_summary": "1-2 sentence description of what's going wrong",
      "draft_response": "warm, helpful 2-3 sentence draft reply for users in this cluster",
      "suggest_doc": true or false,
      "doc_title": "suggested help doc title if suggest_doc is true"
    }
  ],
  "total_tickets": total number,
  "top_issue": "the single biggest issue in one short sentence",
  "health_score": number from 0-100 (0=everything on fire, 100=all good)
}

TICKETS:
${ticketList}`,
        },
      ],
    });

    const raw = completion.choices[0].message.content ?? "";
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}