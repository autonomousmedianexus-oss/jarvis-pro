import process from "node:process";
import { Buffer } from "node:buffer";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const TTS_MODEL = "gpt-4o-mini-tts";
const DEFAULT_TTS_VOICE = "cedar";
const DEFAULT_CHAT_MODEL = "gpt-4.1-mini";
const JARVIS_TTS_INSTRUCTIONS =
  "Sprich auf Deutsch, ruhig, präzise, männlich, souverän, wie eine technische KI-Kommandozentrale. Nicht übertrieben emotional. Kurze Pausen zwischen wichtigen Sätzen.";
const CEO_CHATGPT_CONVERSATION_PROMPT = `
Du bist CEO ChatGPT im Jarvis-Pro Board und sprichst über Jarvis direkt mit dem Inhaber.
Conversational Mode ist der Standard. Antworte auf Deutsch natürlich, beratend, strategisch und dialogisch wie ein normales ChatGPT-Gespräch.

Wichtig:
- Eine Idee, ein Satz, eine Frage oder ein Thema ist noch kein Auftrag.
- Starte keine Agentenkette, keinen Command Bus, keine Executive Summary und keinen ManusTask.
- Verwende keine nummerierte CEO-Ausführungskette.
- Wenn der Nutzer nur ein Thema nennt, greife es als Gesprächseinstieg auf, ordne es kurz ein und stelle bei Bedarf eine sinnvolle Folgefrage.
- Bleibe risikobewusst und unternehmerisch, aber ohne operative Delegation.
`.trim();

const CEO_CHATGPT_DELEGATION_PROMPT = `
Du bist CEO ChatGPT im Jarvis-Pro Board.
Delegation Mode ist nur aktiv, weil der Nutzer explizit eine CEO-Einschätzung, Executive Summary, Research-Freigabe, Manus-Vorbereitung oder einen operativen Auftrag ausgelöst hat.
Antworte auf Deutsch, direkt, souverän und umsetzungsorientiert.
Bewerte den expliziten Nutzerauftrag nach:
- Ziel
- Risiko
- Priorität
- Freigabebedarf durch den Menschen
- nächster sinnvoller Agent im Board
- vorbereitender ManusTask für eine spätere COO-Manus-Ausführung

Sicherheitsregeln:
- Keine bindenden externen Aktionen ohne explizites menschliches GO.
- Kein Merge, Deploy, Kauf, Login, Upload oder Datenlöschung ohne GO.
- Weise klar auf Risiken, offene Freigaben und den nächsten Schritt hin.

Format:
1. CEO Einschätzung
2. Ziel
3. Risiko
4. Priorität
5. Freigabebedarf
6. Nächster Agent
7. ManusTask Vorbereitung
8. Antwort an den Nutzer
`.trim();

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

function jarvisTtsDevProxy(env) {
  return {
    name: "jarvis-tts-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/tts", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "OpenAI TTS nicht konfiguriert" }));
          return;
        }

        try {
          const chunks = [];
          for await (const chunk of req) chunks.push(chunk);
          const payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
          const text = String(payload.text || "").trim();
          const voice = String(payload.voice || env.JARVIS_TTS_VOICE || DEFAULT_TTS_VOICE);
          const instructions = String(payload.instructions || JARVIS_TTS_INSTRUCTIONS);

          if (!text) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "text is required" }));
            return;
          }

          const ttsResponse = await fetch("https://api.openai.com/v1/audio/speech", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: env.JARVIS_TTS_MODEL || TTS_MODEL,
              voice,
              input: text,
              instructions,
              response_format: "mp3",
            }),
          });

          if (!ttsResponse.ok) {
            res.statusCode = ttsResponse.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "OpenAI TTS request failed" }));
            return;
          }

          const audio = Buffer.from(await ttsResponse.arrayBuffer());
          res.statusCode = 200;
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Cache-Control", "no-store");
          res.end(audio);
        } catch (error) {
          server.config.logger.error(error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Jarvis TTS proxy error" }));
        }
      });
    },
  };
}

function jarvisChatGptDevProxy(env) {
  return {
    name: "jarvis-chatgpt-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/chatgpt", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey || env.JARVIS_CHAT_PROVIDER !== "openai") {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "CEO ChatGPT direct connection is not configured" }));
          return;
        }

        try {
          const payload = await readJsonBody(req);
          const userMessage = String(payload.message || payload.chatInput || "").trim();
          const requestMode = payload.mode === "delegation" ? "delegation" : "conversation";
          const systemPrompt = requestMode === "delegation" ? CEO_CHATGPT_DELEGATION_PROMPT : CEO_CHATGPT_CONVERSATION_PROMPT;

          if (!userMessage) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "message is required" }));
            return;
          }

          const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: env.JARVIS_CHAT_MODEL || DEFAULT_CHAT_MODEL,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userMessage },
              ],
              temperature: 0.3,
            }),
          });

          if (!chatResponse.ok) {
            res.statusCode = chatResponse.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "CEO ChatGPT direct request failed" }));
            return;
          }

          const data = await chatResponse.json();
          const answer = data.choices?.[0]?.message?.content || "Keine Antwort erhalten.";

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify({
            output: answer,
            status: "connected_direct",
            provider: "openai",
            model: env.JARVIS_CHAT_MODEL || DEFAULT_CHAT_MODEL,
            mode: requestMode,
          }));
        } catch (error) {
          server.config.logger.error(error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "CEO ChatGPT direct proxy error" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), jarvisChatGptDevProxy(env), jarvisTtsDevProxy(env)],
  };
});
