import process from "node:process";
import { Buffer } from "node:buffer";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const TTS_MODEL = "gpt-4o-mini-tts";
const DEFAULT_TTS_VOICE = "cedar";
const JARVIS_TTS_INSTRUCTIONS =
  "Sprich auf Deutsch, ruhig, präzise, männlich, souverän, wie eine technische KI-Kommandozentrale. Nicht übertrieben emotional. Kurze Pausen zwischen wichtigen Sätzen.";

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), jarvisTtsDevProxy(env)],
  };
});
