import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

type Msg = { role: "user" | "assistant"; content: string };

export const Route = createFileRoute("/api/tutor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const geminiKey = process.env["GEMINI_API_KEY"];

        const { mode, messages } = (await request.json()) as { mode: string; messages: Msg[] };
        const systemPrompt = `You are TOPIT, a friendly AI tutor for Indian school students (Classes 9-12, CBSE/ICSE/State boards). Current mode: "${String(mode).slice(0, 40)}". Follow that mode: e.g. Explain Simply = short plain words; Create Quiz/Test Me = numbered questions with options, answers at the end; Check My Answer = grade and correct; Make Revision Notes = crisp bullet points. Stay on school topics. Use plain text and simple bullets, no markdown headings.`;

        // Live Gemini API Key available
        if (geminiKey) {
          try {
            const ai = new GoogleGenAI({ apiKey: geminiKey });
            const contents = (messages ?? []).slice(-20).map((m) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: String(m.content).slice(0, 4000) }],
            }));

            const responseStream = await ai.models.generateContentStream({
              model: "gemini-2.5-flash",
              contents:
                contents.length > 0 ? contents : [{ role: "user", parts: [{ text: "Hello!" }] }],
              config: {
                systemInstruction: systemPrompt,
              },
            });

            const stream = new ReadableStream({
              async start(controller) {
                try {
                  for await (const chunk of responseStream) {
                    if (chunk.text) {
                      controller.enqueue(new TextEncoder().encode(chunk.text));
                    }
                  }
                  controller.close();
                } catch (err) {
                  controller.error(err);
                }
              },
            });

            return new Response(stream, {
              headers: {
                "Content-Type": "text/plain; charset=utf-8",
                "Transfer-Encoding": "chunked",
              },
            });
          } catch (err) {
            console.error("Gemini stream error:", err);
          }
        }

        // Offline / simulated response when no API key is provided
        const lastUserMsg =
          messages?.filter((m) => m.role === "user").pop()?.content || "the question";
        const fallbackText = `👋 Hello! I am TOPIT AI Tutor.\n\nMode: ${mode}\nTopic: "${lastUserMsg}"\n\n📌 Quick Concept Overview:\n• Review key definitions and formulas in NCERT.\n• Solve previous 5 years' question papers (available in the Papers tab).\n• Practice stepwise derivations and diagram labeling.\n\n💡 Note: To enable live real-time AI responses, configure GEMINI_API_KEY in your environment.`;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(fallbackText));
            controller.close();
          },
        });

        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      },
    },
  },
});
