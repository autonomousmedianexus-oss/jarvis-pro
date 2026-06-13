import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";

const ROLES = {
  CEO_CHATGPT: { label: "CEO ChatGPT", state: "AKTIV" },
  COO_MANUS: { label: "COO Manus", state: "VORBEREITET" },
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

const HUMAN_APPROVAL_TERMS = ["entscheidung", "freigabe", "kritisch", "go"];

function includesAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function createCommandFromMessage(sourceMessage, commandNumber) {
  const normalized = sourceMessage.toLowerCase();
  const matchedRoute = COMMAND_MATCHERS.find((route) =>
    includesAny(normalized, route.terms),
  );
  const requiresHumanApproval = includesAny(normalized, HUMAN_APPROVAL_TERMS);

  if (!matchedRoute && !requiresHumanApproval) return null;

  const assignedRole = requiresHumanApproval && !matchedRoute ? "HUMAN_OWNER" : matchedRoute.role;
  const route = matchedRoute || {
    category: "operations",
    priority: "hoch",
    nextAction: "Entscheidungsvorlage für den menschlichen Owner vorbereiten.",
  };

  return {
    id: `TASK-${String(commandNumber).padStart(3, "0")}`,
    title: `Auftrag aus Nutzerkommando #${String(commandNumber).padStart(3, "0")}`,
    description: sourceMessage,
    sourceMessage,
    assignedRole,
    roleLabel: ROLES[assignedRole].label,
    priority: requiresHumanApproval ? "hoch" : route.priority,
    status: requiresHumanApproval ? "needs_approval" : "draft",
    requiresHumanApproval,
    nextAction: route.nextAction,
    createdAt: new Date().toISOString(),
    category: route.category,
  };
}

function formatStatus(status) {
  const labels = {
    draft: "Entwurf",
    needs_approval: "wartet auf Freigabe",
    planned: "geplant",
    in_progress: "in Arbeit",
    blocked: "blockiert",
    done: "erledigt",
  };

  return labels[status] || status;
}

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("VOICE STANDBY");
  const [time, setTime] = useState(new Date());
  const [commands, setCommands] = useState([]);
  const chatEndRef = useRef(null);
  const latestCommand = commands.at(-1);

  const WEBHOOK_URL =
    "http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    startWakeWordListener();
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const speak = useCallback((text) => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 1;
    utterance.pitch = 0.9;

    window.speechSynthesis.speak(utterance);
  }, []);

  const startWakeWordListener = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceStatus("VOICE NICHT VERFÜGBAR");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "de-DE";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => setVoiceStatus("VOICE ONLINE");

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      if (transcript.includes("hallo jarvis")) {
        const command = transcript.replace("hallo jarvis", "").trim();

        if (command) {
          sendMessage(command);
        } else {
          speak("Ja, Argo?");
        }
      }
    };

    recognition.onerror = () => {
      setVoiceStatus("VOICE BLOCKIERT");
    };

    recognition.onend = () => {
      try {
        recognition.start();
      } catch {
        setVoiceStatus("VOICE NEUSTART FEHLGESCHLAGEN");
      }
    };

    try {
      recognition.start();
    } catch {
      setVoiceStatus("MIKROFON FREIGEBEN");
    }
  }, [speak]);

  async function sendMessage(customMessage) {
    const userMessage = customMessage || message;
    if (!userMessage.trim() || loading) return;

    setMessage("");
    setChat((old) => [...old, { role: "user", text: userMessage }]);
    const command = createCommandFromMessage(userMessage, commands.length + 1);
    if (command) {
      setCommands((old) => [...old, command]);
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

      setChat((old) => [...old, { role: "jarvis", text: answer }]);
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
          <div className="agentCard prepared">
            <span>COO Manus</span>
            <small>VORBEREITET</small>
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
          <small>{voiceStatus}</small>
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
            <span>{voiceStatus}</span>
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
                <span>CEO AKTIV</span>
                <span>COMMAND BUS</span>
                <span>n8n READY</span>
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
                <div className="messageText">{item.text}</div>
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
          <strong>{voiceStatus}</strong>
          <small>Wake Word Monitor</small>
        </div>

        <div className="statusModule online">
          <p>n8n Bridge</p>
          <strong>LINK ACTIVE</strong>
          <small>Payload & Output Mapping unchanged</small>
        </div>
        <div className="statusModule ceoLayer">
          <p>CEO ChatGPT Layer</p>
          <strong>STRATEGIC CONTROL ACTIVE</strong>
          <small>Jarvis ist Oberfläche; CEO interpretiert, priorisiert und schützt Freigaben.</small>
        </div>

        <div className="statusModule commandBus">
          <p>CEO Command Bus</p>
          <strong>{commands.length} Tasks erkannt</strong>
          {latestCommand ? (
            <div className="commandDetails">
              <span>{latestCommand.id}</span>
              <span>Rolle: {latestCommand.roleLabel}</span>
              <span>Status: {formatStatus(latestCommand.status)}</span>
              <span>Priorität: {latestCommand.priority}</span>
              <span>Freigabe: {latestCommand.requiresHumanApproval ? "ja" : "nein"}</span>
              <span>Nächste Aktion: {latestCommand.nextAction}</span>
            </div>
          ) : (
            <small>Noch kein lokaler Command-Bus-Task erkannt.</small>
          )}
        </div>

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
