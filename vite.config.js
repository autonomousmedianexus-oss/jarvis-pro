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


const MANUS_CONNECTOR_ENV = [
  { key: "MANUS_API_URL", type: "api" },
  { key: "MANUS_WEBHOOK_URL", type: "webhook" },
  { key: "MANUS_MCP_URL", type: "mcp" },
  { key: "MANUS_BROWSER_OPERATOR_CONNECTOR_URL", type: "browser_operator" },
  { key: "N8N_MANUS_EXECUTION_WEBHOOK", type: "n8n_execution_webhook" },
];

const MANUS_FORBIDDEN_ACTIONS = [
  "login",
  "account_access",
  "submit_forms",
  "purchase",
  "payment",
  "upload",
  "external_effect",
  "run_codex",
  "commit_pr",
  "merge",
  "deploy",
];

function detectManusServerConnector(env) {
  const connector = MANUS_CONNECTOR_ENV.find((item) => Boolean(env[item.key]));
  return {
    status: connector ? "manus_live_connected" : "needs_manus_connector",
    connectorType: connector?.type || "none",
    configuredEnv: connector?.key || "none",
    serverSideOnly: true,
    tokenInFrontend: false,
    checked: ["MANUS_API_KEY", ...MANUS_CONNECTOR_ENV.map((item) => item.key)],
  };
}

function createNeedsManusConnectorResponse(env) {
  return {
    ...detectManusServerConnector(env),
    error: "needs_manus_connector",
    message: "Keine sichere serverseitige Manus API/Webhook/MCP/Browser-Operator/n8n-Execution-Schnittstelle konfiguriert.",
    manualHandoff: true,
    allowedManualActions: ["ManusTask kopieren", "Report manuell einfügen", "CodexTaskDraft manuell vorbereiten"],
  };
}
function joinUrl(baseUrl, path) {
  return `${String(baseUrl || "").replace(/\/+$/, "")}/${String(path || "").replace(/^\/+/, "")}`;
}

function createManusApiV2MessageContent(payload) {
  const manusTask = payload.manusTask || {};
  const title = manusTask.title || manusTask.id || "Jarvis Manus Research Task";
  const objective = manusTask.objective || manusTask.goal || manusTask.summary || title;
  const sourceUserRequest = manusTask.sourceUserRequest || payload.sourceUserRequest || payload.sourceMessage || "Nicht angegeben";

  return `Titel:
${title}

Ziel:
${objective}

Ursprungsauftrag:
${sourceUserRequest}

Aufgabe für COO Manus:
Bitte prüfe die Geschäftsidee operativ. Erstelle einen Bericht mit:
- Zusammenfassung
- Markt-/Zielgruppenprüfung
- Chancen
- Risiken
- erste Handlungsempfehlung
- mögliche Codex-Folgeaufgabe

Erlaubt:
- öffentliche Recherche
- Analyse
- Bericht erstellen

Blockiert:
- Login
- Käufe
- Zahlungen
- Uploads
- Formulare absenden
- Commit/PR
- Merge
- Deploy`;
}

function createManusApiV2TaskBody(payload) {
  return {
    message: {
      content: createManusApiV2MessageContent(payload),
    },
  };
}

function extractManusTaskId(data) {
  return data?.task_id || data?.taskId || data?.manus_task_id || data?.manusTaskId || data?.id || data?.task?.id || data?.task?.task_id || "";
}

function extractManusErrorText(data, fallbackText = "") {
  if (!data || typeof data !== "object") return String(fallbackText || "Manus connector request failed");
  const error = data.error || data.errorMessage || data.message || data.detail || data.details || data.title;
  if (typeof error === "string") return error;
  if (error) return JSON.stringify(error);
  return String(fallbackText || "Manus connector request failed");
}

async function readManusResponse(response) {
  const text = await response.text();
  if (!text) return { data: {}, text: "" };
  try {
    return { data: JSON.parse(text), text };
  } catch {
    return { data: { summary: text }, text };
  }
}

async function fetchManusMessages(endpoint, headers, taskId) {
  if (!taskId) return null;
  const url = `${joinUrl(endpoint, "task.listMessages")}?task_id=${encodeURIComponent(taskId)}`;
  const response = await fetch(url, { method: "GET", headers });
  const { data, text } = await readManusResponse(response);
  if (!response.ok) {
    return { status: "failed", httpStatus: response.status, errorMessage: extractManusErrorText(data, text), raw: data };
  }
  return { status: "report_ready", httpStatus: response.status, raw: data, messages: data.messages || data.data || data.items || [] };
}

function normalizeManusReport(data, messagesResult = null) {
  const source = data?.manusReport || data?.report || data || {};
  const messages = Array.isArray(messagesResult?.messages) ? messagesResult.messages : [];
  const firstMessage = messages.find((message) => message?.content || message?.text || message?.message) || {};
  return {
    status: messagesResult?.status || source.status || "report_ready",
    summary: source.summary || source.output || source.message || firstMessage.content || firstMessage.text || firstMessage.message || "Manus task.create wurde angenommen.",
    findings: Array.isArray(source.findings) ? source.findings : messages.slice(0, 5).map((message) => message.content || message.text || message.message).filter(Boolean),
    risks: Array.isArray(source.risks) ? source.risks : [],
    recommendation: source.recommendation || "ManusReport prüfen und nächstes menschliches GO entscheiden.",
    sourcesChecked: Array.isArray(source.sourcesChecked) ? source.sourcesChecked : [],
    blockers: Array.isArray(source.blockers) ? source.blockers : [],
    codexTaskDraft: source.codexTaskDraft || "",
    approvalNeeded: source.approvalNeeded ?? true,
    messagesStatus: messagesResult?.status || "not_requested",
    messagesHttpStatus: messagesResult?.httpStatus || null,
  };
}

function validateManusTaskPayload(payload) {
  if (!payload?.manusTask || typeof payload.manusTask !== "object") {
    return "manusTask JSON is required";
  }

  const requestedActions = [
    ...(Array.isArray(payload.manusTask.requestedActions) ? payload.manusTask.requestedActions : []),
    ...(Array.isArray(payload.requestedActions) ? payload.requestedActions : []),
  ].map((item) => String(item).toLowerCase());

  const forbidden = MANUS_FORBIDDEN_ACTIONS.find((action) => requestedActions.includes(action));
  if (forbidden) return `Forbidden action requires explicit GO outside this route: ${forbidden}`;
  return "";
}

async function forwardManusTask(env, payload) {
  const connector = detectManusServerConnector(env);
  if (connector.status !== "manus_live_connected") {
    return { statusCode: 503, body: createNeedsManusConnectorResponse(env) };
  }

  const endpoint = env[connector.configuredEnv];
  const isManusApi = connector.connectorType === "api";
  const targetUrl = isManusApi ? joinUrl(endpoint, "task.create") : endpoint;
  const headers = { "Content-Type": "application/json" };
  if (isManusApi && env.MANUS_API_KEY) headers["x-manus-api-key"] = env.MANUS_API_KEY;

  const body = isManusApi
    ? createManusApiV2TaskBody(payload)
    : {
      type: "jarvis_manus_task",
      safetyMode: "research_analysis_codex_draft_only",
      forbiddenActions: MANUS_FORBIDDEN_ACTIONS,
      payload,
    };

  const response = await fetch(targetUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const { data, text } = await readManusResponse(response);

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: {
        status: "failed",
        error: "manus_connector_failed",
        errorMessage: extractManusErrorText(data, text),
        httpStatus: response.status,
        connectorType: connector.connectorType,
      },
    };
  }

  const taskId = extractManusTaskId(data);
  const messagesResult = isManusApi && taskId ? await fetchManusMessages(endpoint, headers, taskId) : null;

  return {
    statusCode: 200,
    body: {
      status: isManusApi ? "task_sent" : (taskId ? "task_sent" : "report_ready"),
      connectorType: connector.connectorType,
      httpStatus: response.status,
      manusTaskId: taskId,
      task_id: taskId,
      manus_task_id: taskId,
      taskUrl: data.taskUrl || data.url || data.link || "",
      report: normalizeManusReport(data, messagesResult),
      messages: messagesResult?.messages || [],
      messagesStatus: messagesResult?.status || "not_requested",
      messagesErrorMessage: messagesResult?.status === "failed" ? messagesResult.errorMessage : "",
    },
  };
}


function jarvisManusDevProxy(env) {
  return {
    name: "jarvis-manus-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/manus/status", async (req, res) => {
        if (req.method !== "GET") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");
        res.end(JSON.stringify(detectManusServerConnector(env)));
      });

      server.middlewares.use("/api/manus/task", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method not allowed");
          return;
        }

        try {
          const payload = await readJsonBody(req);
          const validationError = validateManusTaskPayload(payload);
          if (validationError) {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ status: "blocked", error: validationError }));
            return;
          }

          const result = await forwardManusTask(env, payload);
          res.statusCode = result.statusCode;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-store");
          res.end(JSON.stringify(result.body));
        } catch (error) {
          server.config.logger.error(error);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ status: "failed", error: "Jarvis Manus proxy error" }));
        }
      });
    },
  };
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
    plugins: [react(), jarvisChatGptDevProxy(env), jarvisTtsDevProxy(env), jarvisManusDevProxy(env)],
  };
});
