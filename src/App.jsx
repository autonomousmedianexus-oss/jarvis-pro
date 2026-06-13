import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";

const ROLES = {
  CEO_CHATGPT: { label: "CEO ChatGPT", state: "AKTIV" },
  COO_MANUS: { label: "COO Manus", state: "DELEGATION AKTIV" },
  CTO_CODEX: { label: "CTO Codex", state: "VORBEREITET" },
  CSO_CLAUDE: { label: "CSO Claude", state: "VORBEREITET" },
  CFO_FINANCE: { label: "CFO Finance", state: "GEPLANT" },
  N8N_AUTOMATION: { label: "n8n Agent", state: "AKTIV" },
  HUMAN_OWNER: { label: "Mensch", state: "ENTSCHEIDET" },
};

const COMMAND_MATCHERS = [
  {
    role: "CTO_CODEX",
    category: "coding",
    priority: "hoch",
    nextAction: "Codex-Prompt vorbereiten und auf menschliche Freigabe warten.",
    terms: ["codex", "code", "repo", "github", "bauen", "implementieren"],
  },
  {
    role: "COO_MANUS",
    category: "project_management",
    priority: "mittel",
    nextAction: "Manus-COO Briefing und Task-Breakdown vorbereiten.",
    terms: ["manus", "sprint", "plan", "projektmanagement", "aufgaben", "roadmap"],
  },
  {
    role: "CSO_CLAUDE",
    category: "strategy",
    priority: "mittel",
    nextAction: "Strategie- und Risikoanalyse als CSO-Briefing strukturieren.",
    terms: ["claude", "strategie", "analyse", "risiko"],
  },
  {
    role: "CFO_FINANCE",
    category: "finance",
    priority: "mittel",
    nextAction: "Finanz- oder Budgetprüfung für spätere CFO-Logik vormerken.",
    terms: ["finanzen", "budget", "kosten", "portfolio", "umsatz"],
  },
  {
    role: "N8N_AUTOMATION",
    category: "automation",
    priority: "mittel",
    nextAction: "n8n-Workflow-Idee dokumentieren; keine Automation ohne Freigabe ausführen.",
    terms: ["n8n", "workflow", "automatisierung", "webhook"],
  },
];

const HUMAN_APPROVAL_TERMS = ["entscheidung", "freigabe", "kritisch", "go", "approval", "bestätigung"];
const EXTERNAL_EXECUTION_ROLES = new Set([
  "CTO_CODEX",
  "COO_MANUS",
  "CSO_CLAUDE",
  "CFO_FINANCE",
  "N8N_AUTOMATION",
]);

const VOICE_CONFIG = {
  preferredLanguage: "de-DE",
  rate: 1.18,
  pitch: 0.86,
  volume: 0.92,
  provider: import.meta.env.VITE_JARVIS_TTS_PROVIDER || "openai",
  voice: import.meta.env.VITE_JARVIS_TTS_VOICE || "cedar",
  fallbackVoice: "marin",
  fallbackVoiceStrategy: "prefer-local-german-then-premium-system-voice",
};

const JARVIS_TTS_INSTRUCTIONS =
  "Sprich auf Deutsch, ruhig, präzise, männlich, souverän, wie eine technische KI-Kommandozentrale. Nicht übertrieben emotional. Kurze Pausen zwischen wichtigen Sätzen.";

const VOICE_STATUS_LABELS = {
  ready: "bereit",
  speaking: "spricht",
  blocked: "blockiert",
  fallback: "fallback",
  error: "fehler",
};

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function commandNeedsApproval(route, normalized) {
  if (!route) return includesAny(normalized, HUMAN_APPROVAL_TERMS);

  const approvalByText = includesAny(normalized, HUMAN_APPROVAL_TERMS);
  const approvalByNextAction = /freigabe|approval|mensch|owner|warten|nicht ausführen/i.test(
    route.nextAction,
  );
  const preparesExternalAction = EXTERNAL_EXECUTION_ROLES.has(route.role);

  return approvalByText || approvalByNextAction || preparesExternalAction;
}

function createVisibleSummary(text) {
  const normalized = String(text || "").replace(/\s+/g, " ").trim();
  if (normalized.length <= 260) return normalized;
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const summary = sentences.slice(0, 2).join(" ").trim();
  return summary.length > 260 ? `${summary.slice(0, 257)}...` : summary;
}

function generateExecutiveDecision(sourceMessage, context = {}) {
  const normalized = sourceMessage.toLowerCase();
  const matchedRoutes = COMMAND_MATCHERS.filter((route) => includesAny(normalized, route.terms));
  const recommendedRoles = matchedRoutes.length > 0 ? matchedRoutes.map((route) => route.role) : ["CEO_CHATGPT"];
  const technical = recommendedRoles.includes("CTO_CODEX");
  const operational = recommendedRoles.includes("COO_MANUS");
  const riskTerms = ["ändern", "deploy", "commit", "pr", "kosten", "budget", "löschen", "kritisch", "api", "extern"];
  const riskLevel = technical || includesAny(normalized, riskTerms) ? "mittel" : "niedrig";
  const requiresHumanApproval = recommendedRoles.some((role) => EXTERNAL_EXECUTION_ROLES.has(role)) || includesAny(normalized, HUMAN_APPROVAL_TERMS) || riskLevel !== "niedrig";
  const priority = includesAny(normalized, ["go", "dringend", "hoch", "sprint", "codex", "manus"]) ? "hoch" : "mittel";
  const routeText = matchedRoutes.map((route) => ROLES[route.role].label).join(" + ") || "CEO ChatGPT";

  return {
    id: `EXEC-${String((context.decisionNumber || 1)).padStart(3, "0")}`,
    sourceMessage,
    intentSummary: operational && technical
      ? "Sprintplanung + technische Prüfung"
      : `Nutzerabsicht aus Jarvis-Kommando: ${createVisibleSummary(sourceMessage)}`,
    strategicAssessment: operational && technical
      ? "CEO Assessment: operative Planung an Manus, technische Prüfung an Codex. Beide bleiben unter CEO-Steuerung und warten auf menschliches GO."
      : `CEO Assessment: ${routeText} als zuständige Rolle(n) vorbereiten; keine kritische Aktion ohne menschliche Freigabe.`,
    recommendedRoles,
    priority,
    riskLevel,
    requiresHumanApproval,
    approvalReason: requiresHumanApproval
      ? "Human Approval First: lokale Delegation/Prompts sind erlaubt, externe Ausführung oder Code-/Automationsänderungen benötigen menschliches GO."
      : "Kein kritischer externer Ausführungsschritt erkannt; CEO Layer hält trotzdem die Freigabe-Kontrolle sichtbar.",
    nextExecutiveAction: "Command Bus Task(s) strukturieren, Delegationsbriefings ablegen und Freigabe durch den Menschen abwarten.",
    createdAt: new Date().toISOString(),
  };
}

function generateManusBriefing(task, executiveDecision, context = {}) {
  if (!task) return "";
  const codexTask = context.tasks?.find((item) => item.assignedRole === "CTO_CODEX" && item.sourceMessage === task.sourceMessage);
  const codexFollowUp = codexTask
    ? "Codex-Folgeauftrag: technische Prüfung vorbereiten; keine Änderung, kein Commit, kein PR ohne menschliches GO."
    : "Mögliche Codex-Folgeaufgabe: technische Prüfung nur als Entwurf anlegen, falls der Owner sie freigibt.";
  return `Rolle: COO Manus
Projekt: PROJEKT JARVIS
CEO-Kontext: ${executiveDecision.intentSummary} · ${executiveDecision.strategicAssessment}
Ziel: ${task.description}
Kontext: Jarvis-Web ist Oberfläche und Kommandozentrale. CEO ChatGPT priorisiert; Command Bus routet; Mensch entscheidet.
Aufgaben:
- Sprintplan und Task-Breakdown strukturieren
- operative Abhängigkeiten, Blocker und Rückfragen sichtbar machen
- Statusbericht für Jarvis-Web formulieren
- ${codexFollowUp}
Priorität: ${task.priority}
Abhängigkeiten: CEO Decision ${executiveDecision.id}; Human Approval; externe Manus-Integration nicht verbunden.
Offene Fragen: Welche Ziele, Fristen, Ressourcen und Akzeptanzkriterien muss der Mensch bestätigen?
Gewünschter Output: Sprintplan, Task-Liste, Blocker-Liste, Rückfragen und vorbereitete Codex-Folgeaufgabe.
Freigabe-Regeln: Status bleibt wartet auf Freigabe/freigegeben lokal. Keine externe Manus-Ausführung vortäuschen.
Mögliche Codex-Folgeaufgabe: ${codexFollowUp}`;
}

function generateCodexPrompt(task, executiveDecision) {
  if (!task) return "";
  return `Rolle: CTO Codex
CEO-Kontext: ${executiveDecision.intentSummary} · ${executiveDecision.strategicAssessment}
Ziel: ${task.description}
Kontext: Jarvis Pro Phase 2.6; CEO ChatGPT steht vor Command Bus und Agentenrouting.
Dateien/Module falls ableitbar: Frontend src/App.jsx, src/App.css; Dokumentation README.md und docs/*; keine n8n-Änderung ohne Notwendigkeit.
Anforderungen:
- technische Prüfung strukturieren
- betroffene Dateien/Module benennen
- sichere Umsetzungsschritte vorschlagen
Nicht brechen: n8n-Vertrag bleibt { chatInput: userMessage } und data.output; Voice First bleibt aktiv; keine Secrets ins Frontend.
Tests: npm run lint, npm run build, Secret Scan.
Secret-Regeln: Keine API-Keys, Passwörter oder Tokens einfügen.
Nach Umsetzung: Commit + PR erstellen, nicht mergen.
Warten auf menschliche Prüfung: Keine Änderung, kein Commit, kein PR ohne menschliches GO.`;
}

function generateExecutiveSummary(executiveDecision, tasks = []) {
  const roles = tasks.map((task) => task.roleLabel).join(", ") || "CEO ChatGPT";
  return `Executive Summary (${executiveDecision.id})\nIntent: ${executiveDecision.intentSummary}\nAssessment: ${executiveDecision.strategicAssessment}\nBetroffene Rollen: ${roles}\nPriorität: ${executiveDecision.priority}\nRisiko: ${executiveDecision.riskLevel}\nFreigabe: ${executiveDecision.requiresHumanApproval ? "menschliches GO erforderlich" : "lokal beobachtet"}\nNächster Schritt: ${executiveDecision.nextExecutiveAction}`;
}

function createCommandTask(sourceMessage, route, commandNumber, taskOffset, normalized, executiveDecision) {
  const requiresHumanApproval = commandNeedsApproval(route, normalized) || executiveDecision.requiresHumanApproval;
  const sequence = commandNumber + taskOffset;

  return {
    id: `TASK-${String(sequence).padStart(3, "0")}`,
    title: `Aufgabe-D${String(sequence).padStart(2, "0")}`,
    description: sourceMessage,
    sourceMessage,
    executiveDecisionId: executiveDecision.id,
    assignedRole: route.role,
    roleLabel: ROLES[route.role].label,
    priority: executiveDecision.priority || (requiresHumanApproval ? "hoch" : route.priority),
    status: requiresHumanApproval ? "needs_approval" : "draft",
    requiresHumanApproval,
    nextAction: route.nextAction,
    createdAt: new Date().toISOString(),
    category: route.category,
    externalStatus: "extern nicht verbunden",
  };
}

function createCommandsFromDecision(sourceMessage, commandNumber, executiveDecision) {
  const normalized = sourceMessage.toLowerCase();
  const matchedRoutes = COMMAND_MATCHERS.filter((route) => includesAny(normalized, route.terms));

  if (matchedRoutes.length === 0) {
    return executiveDecision.requiresHumanApproval ? [{
      id: `TASK-${String(commandNumber).padStart(3, "0")}`,
      title: `Aufgabe-D${String(commandNumber).padStart(2, "0")}`,
      description: sourceMessage,
      sourceMessage,
      executiveDecisionId: executiveDecision.id,
      assignedRole: "HUMAN_OWNER",
      roleLabel: ROLES.HUMAN_OWNER.label,
      priority: executiveDecision.priority,
      status: "needs_approval",
      requiresHumanApproval: true,
      nextAction: "Entscheidungsvorlage für den menschlichen Owner vorbereiten.",
      createdAt: new Date().toISOString(),
      category: "operations",
      externalStatus: "lokale Freigabe erforderlich",
    }] : [];
  }

  return matchedRoutes.map((route, index) => createCommandTask(sourceMessage, route, commandNumber, index, normalized, executiveDecision));
}

function formatStatus(status) {
  const labels = {
    draft: "Entwurf",
    needs_approval: "wartet auf Freigabe",
    planned: "geplant",
    in_progress: "in Arbeit",
    blocked: "blockiert",
    done: "erledigt",
    approved_local: "freigegeben lokal",
    ready_for_external_handoff: "bereit für externe Übergabe",
  };

  return labels[status] || status;
}


function splitSpeechIntoChunks(text) {
  return String(text)
    .replace(/\s+/g, " ")
    .match(/[^.!?;:]+[.!?;:]?|[^.!?;:]+$/g)
    ?.map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce((chunks, sentence) => {
      const last = chunks.at(-1);
      if (last && `${last} ${sentence}`.length <= 220) {
        chunks[chunks.length - 1] = `${last} ${sentence}`;
      } else {
        chunks.push(sentence);
      }
      return chunks;
    }, []) || [];
}

function scoreVoice(voice) {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();
  let score = 0;

  if (lang === "de-de") score += 70;
  else if (lang.startsWith("de")) score += 55;
  else if (lang.startsWith("en")) score += 25;

  if (voice.localService) score += 12;
  if (/premium|enhanced|natural|neural|google|microsoft|apple|anna|katja|helena|markus/.test(name)) {
    score += 18;
  }

  return score;
}

function selectJarvisVoice(voices) {
  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}
function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("ready");
  const [ttsProvider, setTtsProvider] = useState("OpenAI");
  const [voiceFirst, setVoiceFirst] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [localApprovals, setLocalApprovals] = useState({});
  const [copyNotice, setCopyNotice] = useState("");
  const [time, setTime] = useState(new Date());
  const [commands, setCommands] = useState([]);
  const [executiveDecisions, setExecutiveDecisions] = useState([]);
  const chatEndRef = useRef(null);
  const voiceQueueRef = useRef([]);
  const selectedVoiceRef = useRef(null);
  const sendMessageRef = useRef(null);
  const latestCommand = commands.at(-1);
  const latestDecision = executiveDecisions.at(-1);
  const recentCommands = commands.slice(-4).reverse();
  const latestManusTask = [...commands].reverse().find((command) => command.assignedRole === "COO_MANUS");
  const latestCodexTask = [...commands].reverse().find((command) => command.assignedRole === "CTO_CODEX");
  const latestManusDecision = executiveDecisions.find((decision) => decision.id === latestManusTask?.executiveDecisionId) || latestDecision;
  const latestCodexDecision = executiveDecisions.find((decision) => decision.id === latestCodexTask?.executiveDecisionId) || latestDecision;
  const latestManusBriefing = latestManusTask && latestManusDecision ? generateManusBriefing(latestManusTask, latestManusDecision, { tasks: commands }) : "";
  const latestCodexPrompt = latestCodexTask && latestCodexDecision ? generateCodexPrompt(latestCodexTask, latestCodexDecision, { tasks: commands }) : "";
  const latestExecutiveSummary = latestDecision ? generateExecutiveSummary(latestDecision, commands.filter((task) => task.executiveDecisionId === latestDecision.id)) : "";
  const voiceStatusLabel = VOICE_STATUS_LABELS[voiceStatus] || voiceStatus;

  const copyToClipboard = async (text, notice) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setCopyNotice(notice);
    window.setTimeout(() => setCopyNotice(""), 2200);
  };

  const markTask = (taskId, status) => {
    setLocalApprovals((old) => ({ ...old, [taskId]: status }));
    setCommands((old) => old.map((task) => task.id === taskId ? { ...task, status } : task));
  };

  const WEBHOOK_URL =
    "http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6";

  const speakWithBrowser = useCallback((text) => {
    if (!("speechSynthesis" in window) || !text) {
      setVoiceStatus("blocked");
      return;
    }

    try {
      window.speechSynthesis.cancel();
      voiceQueueRef.current = splitSpeechIntoChunks(text);

      const speakNextChunk = () => {
        const nextChunk = voiceQueueRef.current.shift();
        if (!nextChunk) {
          setVoiceStatus("ready");
          return;
        }

        const voices = window.speechSynthesis.getVoices();
        selectedVoiceRef.current = selectedVoiceRef.current || selectJarvisVoice(voices);

        const utterance = new SpeechSynthesisUtterance(nextChunk);
        utterance.lang = selectedVoiceRef.current?.lang || VOICE_CONFIG.preferredLanguage;
        utterance.voice = selectedVoiceRef.current;
        utterance.rate = VOICE_CONFIG.rate;
        utterance.pitch = VOICE_CONFIG.pitch;
        utterance.volume = VOICE_CONFIG.volume;
        utterance.onstart = () => setVoiceStatus("speaking");
        utterance.onend = speakNextChunk;
        utterance.onerror = () => {
          voiceQueueRef.current = [];
          setVoiceStatus("blocked");
        };

        window.speechSynthesis.speak(utterance);
      };

      speakNextChunk();
    } catch (error) {
      console.error(error);
      setVoiceStatus("blocked");
    }
  }, []);

  const speak = useCallback(async (text) => {
    if (!text) return;
    if (VOICE_CONFIG.provider !== "openai") {
      setTtsProvider("Browser Fallback");
      speakWithBrowser(text);
      return;
    }

    try {
      setVoiceStatus("speaking");
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: VOICE_CONFIG.voice, instructions: JARVIS_TTS_INSTRUCTIONS }),
      });

      if (!response.ok) throw new Error(`TTS unavailable: ${response.status}`);
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setVoiceStatus("ready");
      };
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        setTtsProvider("Browser Fallback");
        setVoiceStatus("fallback");
        speakWithBrowser(text);
      };
      setTtsProvider("OpenAI");
      await audio.play();
    } catch (error) {
      console.warn("OpenAI TTS fallback active", error);
      setTtsProvider("Browser Fallback");
      setVoiceStatus("fallback");
      speakWithBrowser(text);
    }
  }, [speakWithBrowser]);

  const startWakeWordListener = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus("blocked");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setVoiceStatus("ready");

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (transcript.includes("hallo jarvis")) {
        const command = transcript.replace("hallo jarvis", "").trim();

        if (command) {
          sendMessageRef.current?.(command);
        } else {
          speak("Ja, Argo?");
        }
      }
    };

    recognition.onerror = () => {
      setVoiceStatus("blocked");
    };

    recognition.onend = () => {
      try {
        recognition.start();
      } catch {
        setVoiceStatus("error");
      }
    };

    try {
      recognition.start();
    } catch {
      setVoiceStatus("blocked");
    }
  }, [speak]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const wakeTimer = window.setTimeout(startWakeWordListener, 0);
    return () => {
      clearInterval(timer);
      window.clearTimeout(wakeTimer);
      window.speechSynthesis?.cancel();
    };
  }, [startWakeWordListener]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) {
      return undefined;
    }

    const refreshVoices = () => {
      selectedVoiceRef.current = selectJarvisVoice(window.speechSynthesis.getVoices());
      setVoiceStatus((current) =>
        current === "blocked" ? "ready" : current,
      );
    };

    const voiceTimer = window.setTimeout(refreshVoices, 0);
    window.speechSynthesis.onvoiceschanged = refreshVoices;

    return () => {
      window.clearTimeout(voiceTimer);
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);



  async function sendMessage(customMessage) {
    const userMessage = customMessage || message;
    if (!userMessage.trim() || loading) return;

    setMessage("");
    setChat((old) => [...old, { role: "user", text: userMessage }]);
    const executiveDecision = generateExecutiveDecision(userMessage, { decisionNumber: executiveDecisions.length + 1 });
    const draftedCommands = createCommandsFromDecision(userMessage, commands.length + 1, executiveDecision);
    setExecutiveDecisions((old) => [...old, executiveDecision]);
    if (draftedCommands.length > 0) {
      setCommands((old) => [...old, ...draftedCommands]);
    }
    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: userMessage }),
      });

      const data = await response.json();
      const answer = data.output || "Keine Antwort erhalten.";

      setChat((old) => [...old, { role: "jarvis", text: answer, summary: createVisibleSummary(answer) }]);
      speak(answer);
    } catch (error) {
      console.error(error);
      setChat((old) => [
        ...old,
        { role: "jarvis", text: "Fehler: Verbindung zu Jarvis fehlgeschlagen." },
      ]);
    }

    setLoading(false);
  }

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="layout">
      <div className="particles"></div>
      <div className="scanlines"></div>

      <aside className="sidebar">
        <div className="brandPanel">
          <span className="eyebrow">Executive Board</span>
          <h2>JARVIS</h2>
          <small>CEO Layer + Command Bus</small>
        </div>

        <button
          className="newChat"
          onClick={() => {
            setChat([]);
            setCommands([]);
            setExecutiveDecisions([]);
            setLocalApprovals({});
          }}
        >
          + Neuer Chat
        </button>

        <div className="sideSection">
          <p>EXECUTIVE BOARD</p>
          <div className="agentCard active">
            <span>CEO ChatGPT</span>
            <small>AKTIV</small>
          </div>
          <div className="agentCard active delegation">
            <span>COO Manus</span>
            <small>DELEGATION AKTIV</small>
          </div>
          <div className="agentCard prepared">
            <span>CTO Codex</span>
            <small>VORBEREITET</small>
          </div>
          <div className="agentCard prepared">
            <span>CSO Claude</span>
            <small>VORBEREITET</small>
          </div>
          <div className="agentCard planned">
            <span>CFO Finance</span>
            <small>GEPLANT</small>
          </div>
        </div>

        <div className="sideSection automationSection">
          <p>AUTOMATION LAYER</p>
          <div className="agentCard active bridge">
            <span>n8n Agent</span>
            <small>AKTIV</small>
          </div>
          <div className="agentCard future">
            <span>LangGraph</span>
            <small>FUTURE</small>
          </div>
          <div className="agentCard planned">
            <span>Research Agent</span>
            <small>PLANNED</small>
          </div>
          <div className="agentCard planned">
            <span>Memory Agent</span>
            <small>PLANNED</small>
          </div>
        </div>

        <div className="sideFooter">
          <p>SYSTEMSTATUS</p>
          <strong>ONLINE</strong>
          <small>{voiceStatusLabel}</small>
        </div>
      </aside>

      <main className="app">
        <div className="hudCore">
          <div className="ring ring1"></div>
          <div className="ring ring2"></div>
          <div className="ring ring3"></div>
          <div className="ring ring4"></div>
          <div className="ring ring5"></div>
          <div className="coreDot"></div>
        </div>

        <header className="header">
          <div className="statusBar">
            <span>CPU 12%</span>
            <span>RAM 31%</span>
            <span>GPU 07%</span>
            <span>NET ONLINE</span>
            <span>{time.toLocaleTimeString("de-CH")}</span>
            <span>VOICE {voiceStatusLabel.toUpperCase()}</span>
          </div>

          <h1>JARVIS PRO</h1>
          <p>CEO CHATGPT LAYER · COMMAND BUS · HUMAN APPROVAL FIRST</p>
        </header>

        <section className="chatBox">
          {chat.length === 0 && (
            <div className="welcome">
              <span className="welcomeKicker">Command Console bereit</span>
              <h3>Executive AI Operations Hub</h3>
              <p>
                Sag <b>„Hallo Jarvis“</b> oder schreibe unten deine Anfrage. CEO ChatGPT
                steuert strategisch, der Command Bus strukturiert Aufgaben, und der
                Mensch bleibt höchste Entscheidungsinstanz.
              </p>
              <div className="welcomeGrid">
                <span>JARVIS INTERFACE</span>
                <span>CEO VOR COMMAND BUS</span>
                <span>HUMAN APPROVAL</span>
              </div>
            </div>
          )}

          {chat.map((item, index) => (
            <div
              key={index}
              className={`messageRow ${
                item.role === "user" ? "userRow" : "jarvisRow"
              }`}
            >
              <div className="avatar">{item.role === "user" ? "DU" : "AI"}</div>
              <div className={`bubble ${item.role}`}>
                <span className="messageLabel">
                  {item.role === "user" ? "USER COMMAND" : "JARVIS RESPONSE"}
                </span>
                <div className="messageText">
                  {item.role === "jarvis" && voiceFirst ? item.summary || createVisibleSummary(item.text) : item.text}
                </div>
                {item.role === "jarvis" && voiceFirst && item.text !== (item.summary || createVisibleSummary(item.text)) && (
                  <details
                    className="fullAnswer"
                    open={Boolean(expandedMessages[index])}
                    onToggle={(event) =>
                      setExpandedMessages((old) => ({ ...old, [index]: event.currentTarget.open }))
                    }
                  >
                    <summary>Volltext anzeigen</summary>
                    <div>{item.text}</div>
                  </details>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="messageRow jarvisRow">
              <div className="avatar">AI</div>
              <div className="bubble jarvis analyzing">
                <span className="messageLabel">ANALYSE MODUL</span>
                <div className="analyzerGrid">
                  <i></i>
                  <i></i>
                  <i></i>
                  <i></i>
                </div>
                <div className="analyzerText">
                  Jarvis analysiert<span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </section>

        <footer className="inputArea">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Schreibe oder sage: "Hallo Jarvis ..."'
            rows="2"
          />

          <button onClick={() => sendMessage()} disabled={loading}>
            Senden
          </button>
        </footer>
      </main>

      <aside className="statusPanel">
        <div className="statusModule primary">
          <p>Voice Status</p>
          <strong>{voiceStatusLabel}</strong>
          <small>Voice First: {voiceFirst ? "aktiv" : "inaktiv"} · TTS Provider: {ttsProvider}</small>
          <small>{ttsProvider === "Browser Fallback" ? "OpenAI TTS nicht konfiguriert – Browser-Stimme aktiv." : "OpenAI TTS lokal über /api/tts vorbereitet."}</small>
          <button className="miniAction" onClick={() => setVoiceFirst((current) => !current)}>
            Voice First {voiceFirst ? "deaktivieren" : "aktivieren"}
          </button>
        </div>

        <div className="statusModule online">
          <p>n8n Bridge</p>
          <strong>LINK ACTIVE</strong>
          <small>Payload & Output Mapping unchanged</small>
        </div>
        <div className="statusModule ceoLayer">
          <p>CEO ChatGPT Layer</p>
          <strong>STRATEGIC CONTROL ACTIVE</strong>
          <small>Jarvis → CEO ChatGPT → Command Bus → Agent Routing. CEO interpretiert, priorisiert und schützt Freigaben.</small>
          {latestDecision ? (
            <details className="briefingBox" open>
              <summary>Executive Summary anzeigen</summary>
              <pre className="promptBox">{latestExecutiveSummary}</pre>
              <button className="miniAction" onClick={() => copyToClipboard(latestExecutiveSummary, "Executive Summary kopiert")}>
                Executive Summary kopieren
              </button>
            </details>
          ) : <small>Noch keine Executive Decision.</small>}
        </div>

        <div className="statusModule integrationMap">
          <p>Agenten-Brücke / Integrationsstatus</p>
          <strong>LOCAL BRIDGE ACTIVE</strong>
          <ul>
            <li>CEO ChatGPT Layer: aktiv</li>
            <li>OpenAI: lokal konfiguriert / n8n-Antworten</li>
            <li>n8n: aktiv</li>
            <li>Voice/TTS: {ttsProvider} oder Browser Fallback</li>
            <li>Command Bus: aktiv</li>
            <li>Manus COO: lokale Delegation aktiv, externe Integration nicht verbunden</li>
            <li>Codex CTO: PR-/Prompt-Workflow vorbereitet, direkte externe Ausführung nicht verbunden</li>
            <li>GitHub: Repo-Kontext vorbereitet</li>
            <li>Human Approval: aktiv</li>
          </ul>
        </div>

        <div className="statusModule commandBus">
          <p>CEO Command Bus</p>
          <strong>
            {commands.length} {commands.length === 1 ? "Aufgabe" : "Aufgaben"} erkannt
          </strong>
          {latestCommand ? (
            <div className="commandDetails">
              {recentCommands.map((command) => (
                <article className="commandTaskCard" key={command.id}>
                  <span className="commandTaskId">{command.id}</span>
                  <span>Rolle: {command.roleLabel}</span>
                  <span>Status: {formatStatus(command.status)}</span>
                  <span>Priorität: {command.priority}</span>
                  <span>Freigabe: {command.requiresHumanApproval ? "ja" : "nein"}</span>
                  <span>Nächste Aktion: {command.nextAction}</span>
                </article>
              ))}
            </div>
          ) : (
            <small>0 Aufgaben erkannt · Noch kein lokaler Command-Bus-Task.</small>
          )}
        </div>


        <div className="statusModule manusPanel">
          <p>COO Manus</p>
          <strong>DELEGATION AKTIV</strong>
          <small>Lokale COO-Delegation: aktiv · Externe Manus-Integration: nicht verbunden / vorbereitet · Ausführung: wartet auf menschliche Freigabe</small>
          {latestManusTask ? (
            <div className="manusDetails">
              <span>Letzter Task: {latestManusTask.title}</span>
              <span>Status: {formatStatus(latestManusTask.status)} · {latestManusTask.externalStatus}</span>
              <span>Briefing verfügbar: ja</span>
              <details className="briefingBox">
                <summary>Manus-Briefing anzeigen</summary>
                <pre className="promptBox">{latestManusBriefing}</pre>
              </details>
              <button className="miniAction" onClick={() => copyToClipboard(latestManusBriefing, "Manus-Auftrag kopiert")}>
                Manus-Auftrag kopieren
              </button>
              <button className="miniAction" onClick={() => markTask(latestManusTask.id, "approved_local")}>
                Freigabe lokal markieren
              </button>
              <button className="miniAction" onClick={() => markTask(latestManusTask.id, "ready_for_external_handoff")}>
                Als bereit für externe Übergabe markieren
              </button>
              <small>{localApprovals[latestManusTask.id] ? "Status lokal geändert – keine externe Ausführung gestartet." : "Status: wartet auf Freigabe"}</small>
            </div>
          ) : (
            <small>Kein Manus-Task erkannt · Briefing wird bei Manus-/Sprint-Aufgaben erzeugt.</small>
          )}
        </div>

        <div className="statusModule codexPanel">
          <p>CTO Codex</p>
          <strong>PROMPT WORKFLOW VORBEREITET</strong>
          <small>Direkte externe Ausführung: nicht verbunden · kein Commit/PR ohne menschliches GO.</small>
          {latestCodexTask ? (
            <div className="manusDetails">
              <span>Letzter Task: {latestCodexTask.title}</span>
              <span>Status: {formatStatus(latestCodexTask.status)} · {latestCodexTask.externalStatus}</span>
              <details className="briefingBox">
                <summary>Codex-Folgeauftrag anzeigen</summary>
                <pre className="promptBox">{latestCodexPrompt}</pre>
              </details>
              <button className="miniAction" onClick={() => copyToClipboard(latestCodexPrompt, "Codex-Auftrag kopiert")}>
                Codex-Auftrag kopieren
              </button>
              <button className="miniAction" onClick={() => markTask(latestCodexTask.id, "approved_local")}>
                Freigabe lokal markieren
              </button>
            </div>
          ) : <small>Kein Codex-Task erkannt · Folgeauftrag wird bei Technik-/Codex-Aufgaben erzeugt.</small>}
        </div>

        {copyNotice && <div className="copyToast">{copyNotice}</div>}

        <div className="statusModule">
          <p>Chat Session</p>
          <strong>{chat.length} Messages</strong>
          <small>{loading ? "Analysis stream pending" : "Console idle"}</small>
        </div>

        <div className="statusModule futureSystems">
          <p>Future Systems</p>
          <ul>
            <li>LangGraph FUTURE</li>
            <li>Agent Mesh PLANNED</li>
            <li>Finance Console PLANNED</li>
          </ul>
        </div>

        <div className="statusModule diagnostics">
          <p>Diagnostics / HUD SIM</p>
          <div className="diagnosticRow"><span>HUD</span><b>SIM</b></div>
          <div className="diagnosticRow"><span>API</span><b>NO CHANGE</b></div>
          <div className="diagnosticRow"><span>OWNER</span><b>HUMAN</b></div>
          <div className="diagnosticRow"><span>VOICE</span><b>MONITOR</b></div>
        </div>
      </aside>
    </div>
  );
}

export default App;
