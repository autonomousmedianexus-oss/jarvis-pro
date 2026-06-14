import { useState, useRef, useEffect, useCallback } from "react";
import "./App.css";

const BOARD_AGENTS = [
  "HUMAN_OWNER",
  "JARVIS_INTERFACE",
  "CEO_CHATGPT",
  "COO_MANUS",
  "CTO_CODEX",
  "CSO_CLAUDE",
  "CFO_FINANCE",
  "N8N_AUTOMATION",
];

const ROLES = {
  JARVIS_INTERFACE: { label: "Jarvis", state: "INTERFACE AKTIV" },
  CEO_CHATGPT: { label: "CEO ChatGPT", state: "AKTIV" },
  COO_MANUS: { label: "COO Manus", state: "DELEGATION AKTIV" },
  CTO_CODEX: { label: "CTO Codex", state: "VORBEREITET" },
  CSO_CLAUDE: { label: "CSO Claude", state: "VORBEREITET" },
  CFO_FINANCE: { label: "CFO Finance", state: "GEPLANT" },
  N8N_AUTOMATION: { label: "n8n Agent", state: "AKTIV" },
  HUMAN_OWNER: { label: "Mensch", state: "ENTSCHEIDET" },
};



const MANUS_CONNECTOR_STATUS = import.meta.env.VITE_MANUS_SERVER_CONNECTOR === "true"
  ? "manus_live_connected"
  : "needs_manus_connector";

const MANUS_TASK_STATUS = "task_prepared";

const MANUS_TASK_TYPES = {
  research: "research",
  review: "review",
  planning: "planning",
  codexPreparation: "codex_prompt_preparation",
};


const MANUS_WEB_CAPABILITIES = [
  "business_model_research",
  "website_review",
  "competitor_scan",
  "monetization_analysis",
  "ux_flow_analysis",
  "landing_page_requirements",
  "saas_idea_validation",
  "task_breakdown",
  "codex_prompt_preparation",
  "progress_report",
  "blocker_detection",
];

const APPROVAL_LEVELS = [
  { id: "research_only", label: "Recherche erlaubt", rule: "Manus darf öffentlich zugängliche Informationen analysieren." },
  { id: "login_required", label: "Login nur nach GO", rule: "Anmelden oder Account-Zugriff nur nach expliziter menschlicher Freigabe." },
  { id: "external_action", label: "Externe Aktionen nur nach GO", rule: "Klicks mit Wirkung, Änderungen, Käufe, Uploads oder Vertragsaktionen sind verboten, bis der Owner zustimmt." },
  { id: "code_generation", label: "Code vorbereiten", rule: "Codex darf technische Umsetzung nur als freigegebenen Auftrag vorbereiten." },
  { id: "commit_pr", label: "Commit + PR", rule: "Commit und PR nur nach GO; nicht mergen." },
  { id: "merge_deploy", label: "Merge/Deploy nur Mensch", rule: "Merge, Deploy und produktive Freigaben bleiben ausschließlich beim Menschen." },
];

const MANUS_WEB_ALLOWED_ACTIONS = [
  "Öffentlich zugängliche Webseiten und Märkte analysieren",
  "Geschäftsmodelle, Zielgruppen, Angebote und Monetarisierung strukturieren",
  "Chancen, Risiken, technische Anforderungen und MVP-Scope dokumentieren",
  "Codex-Aufträge, Sprintpläne, Blocker und Rückfragen vorbereiten",
];

const MANUS_WEB_FORBIDDEN_ACTIONS = [
  "Keine Logins, Account-Änderungen, Käufe, Zahlungen oder Vertragsabschlüsse ohne explizites GO",
  "Keine Daten löschen, Uploads auslösen oder rechtlich/finanziell bindende Aktionen ausführen",
  "Keine geschützten, proprietären Inhalte oder fremden Code kopieren",
  "Keine externe Manus-Ausführung behaupten, solange keine echte Integration verbunden ist",
];

const CONNECTION_STATUS = {
  CEO_CHATGPT: {
    component: "CEO ChatGPT / OpenAI",
    status: "direct_ready",
    possible: "CEO-Entscheidung lokal erzeugen; Direct Backend versucht /api/chatgpt zuerst und nutzt n8n nur als Fallback.",
    missing: "OpenAI Direct benötigt serverseitig OPENAI_API_KEY, JARVIS_CHAT_PROVIDER=openai und JARVIS_CHAT_MODEL.",
    allowedAfterGo: "Strategische Bewertung, Priorisierung, Risiko- und Freigabeprüfung.",
    blocked: "Keine Secrets im Frontend; keine bindenden Aktionen ohne Owner-GO.",
  },
  COO_MANUS: {
    component: "COO Manus",
    status: MANUS_CONNECTOR_STATUS,
    possible: "Lokale Manus-Aufträge, Research-Briefings, Sprintpläne und operative Review-Templates erstellen.",
    missing: "Manus API/Webhook/MCP nicht konfiguriert; Login nur manuell nach GO.",
    allowedAfterGo: "Research-GO und Login-GO lokal markieren; externes Handoff nur bei später verbundener Integration.",
    blocked: "Keine externe Manus-Ausführung, kein Login und keine Web-Aktion aus Jarvis heraus.",
  },
  CTO_CODEX: {
    component: "CTO Codex",
    status: "prepared",
    possible: "Codex-Auftrag und GitHub-Issue-Draft kopierbar vorbereiten.",
    missing: "Codex direkte Ausführung nicht verbunden; kein Workflow-Trigger konfiguriert.",
    allowedAfterGo: "Codex-Handoff lokal markieren und Auftrag manuell übergeben.",
    blocked: "Kein Merge, Deploy, externer Commit oder PR aus der UI.",
  },
  GITHUB: {
    component: "GitHub",
    status: import.meta.env.VITE_GITHUB_CONNECTOR_STATUS || "needs_secret",
    allowedStatuses: ["connected", "needs_secret", "needs_connector", "prepared", "unavailable", "failed"],
    possible: "Repo-Kontext, Codex-Handoff, GitHub-Issue-Draft und manuelle PR-Statusübernahme lokal vorbereiten; echte API-Aktionen nur über sichere serverseitige Verbindung.",
    missing: "GitHub Issue/PR/Checks API nicht verbunden. Erforderlich: serverseitiger GitHub Connector, n8n Credential oder MCP/GitHub Tool; kein Token im Browser.",
    allowedAfterGo: "Issue-Draft kopieren, Codex-PR-Status manuell übernehmen oder lokale Freigabe markieren; echte Issue-/PR-Live-Lesung erst mit sicherem Backend-/n8n-/MCP-Connector.",
    blocked: "Keine Issue/PR API-Aktion aus dem Frontend; kein Token im Browser; kein Merge/Deploy.",
  },
  N8N_AUTOMATION: {
    component: "n8n",
    status: "connected",
    possible: "Bestehender Chat-Webhook aktiv vorbereitet; Request bleibt { chatInput: userMessage }, Response data.output.",
    missing: "Separater Execution-Handoff-Workflow ist nur geplant/dokumentiert.",
    allowedAfterGo: "Chat-Orchestrierung; spätere Execution-Tasks nur in separatem Workflow mit Secrets in n8n.",
    blocked: "Bestehenden Chat-Vertrag nicht brechen; keine Secrets committen.",
  },
  MCP_GATEWAY: {
    component: "MCP Gateway / Tool Layer",
    status: "mcp_ready",
    possible: "Capability Detection, lokale Task-State-Tools und Handoff-Drafts modelliert.",
    missing: "Keine externe MCP-Server-Ausführung im Frontend verbunden.",
    allowedAfterGo: "Task-State exportieren und Freigaben markieren.",
    blocked: "Keine verdeckte externe Tool-Ausführung.",
  },
  LOCAL_TASK_STORE: {
    component: "Local Task Store",
    status: "local_active",
    possible: "Executive Decisions, Board Chains, Command Tasks und Approvals in localStorage speichern/exportieren.",
    missing: "Keine serverseitige Datenbank; Browserdaten können lokal gelöscht werden.",
    allowedAfterGo: "Export/Clear durch UI-Aktion.",
    blocked: "Keine Secrets speichern.",
  },
};

const TOOL_REGISTRY = [
  { name: "detectCapabilities", mode: "local" },
  { name: "createManusTask", mode: "prepared" },
  { name: "detectManusLiveConnector", mode: "local" },
  { name: "sendManusLiveAfterGo", mode: "server_required" },
  { name: "createCodexTask", mode: "prepared" },
  { name: "createGitHubIssueDraft", mode: "prepared" },
  { name: "copyGitHubIssueDraft", mode: "local" },
  { name: "checkGitHubIssueCreation", mode: "local" },
  { name: "createGitHubIssueAfterHumanGo", mode: "server_required" },
  { name: "readGitHubIssueOrPrStatus", mode: "server_required" },
  { name: "updateGitHubReturnChannelStatus", mode: "local" },
  { name: "copyCodexPrStatusForJarvis", mode: "local" },
  { name: "markHumanApproval", mode: "local" },
  { name: "prepareN8nExecution", mode: "api_ready" },
  { name: "readTaskState", mode: "local" },
  { name: "writeTaskState", mode: "local" },
  { name: "exportTaskState", mode: "local" },
  { name: "create_manus_web_research_task", mode: "prepared" },
  { name: "copy_manus_web_research_brief", mode: "local" },
  { name: "mark_research_approved", mode: "local" },
  { name: "mark_login_approved", mode: "local" },
  { name: "attach_manus_report", mode: "prepared" },
  { name: "generate_codex_prompt_from_manus_report", mode: "local" },
  { name: "prepare_monetization_sprint", mode: "prepared" },
  { name: "export_research_task_state", mode: "local" },
];

const CEO_CONNECTION_STATUS_LABELS = {
  pending: "CEO ChatGPT: pending",
  connected_direct: "CEO ChatGPT: connected_direct",
  fallback_n8n: "CEO ChatGPT: fallback_n8n",
  failed: "CEO ChatGPT: failed",
};


const GITHUB_RETURN_CHANNEL_DEFAULT = {
  issueUrl: "",
  issueNumber: "",
  branchName: "",
  commitSha: "",
  prUrl: "",
  prNumber: "",
  prStatus: "not_connected",
  checksStatus: "not_connected",
  reviewStatus: "not_connected",
  blockerNotes: "Live-GitHub-Rückkanal ist noch nicht verbunden. Status kann manuell aus Codex/GitHub übernommen werden.",
  lastUpdatedAt: "",
  humanApprovalRequired: true,
};

const GITHUB_RETURN_CHANNEL_FIELDS = [
  { key: "issueUrl", label: "GitHub Issue URL", placeholder: "https://github.com/org/repo/issues/123" },
  { key: "issueNumber", label: "Issue Nummer", placeholder: "123" },
  { key: "branchName", label: "Branch Name", placeholder: "phase-3-0a-github-return-channel" },
  { key: "commitSha", label: "Commit SHA", placeholder: "abc1234" },
  { key: "prUrl", label: "PR URL", placeholder: "https://github.com/org/repo/pull/456" },
  { key: "prNumber", label: "PR Nummer", placeholder: "456" },
  { key: "prStatus", label: "PR Status", placeholder: "draft | open | ready_for_review | merged-disabled" },
  { key: "checksStatus", label: "Checks", placeholder: "pending | passing | failing | not_connected" },
  { key: "reviewStatus", label: "Review Status", placeholder: "required | approved | changes_requested" },
  { key: "blockerNotes", label: "Blocker", placeholder: "Keine Blocker / fehlende Secrets / Review offen" },
];

function createGitHubReturnChannelStatus(overrides = {}) {
  return {
    ...GITHUB_RETURN_CHANNEL_DEFAULT,
    lastUpdatedAt: new Date().toISOString(),
    ...overrides,
  };
}

const GITHUB_HANDOFF_STATUS_VALUES = [
  "draft",
  "copied",
  "locally_approved",
  "issue_ready",
  "issue_created",
  "codex_pending",
  "codex_in_progress",
  "pr_created",
  "pr_review_required",
  "approved_by_human",
  "blocked",
  "failed",
];

const MANUS_WEB_STATUS_VALUES = [
  "draft",
  "needs_approval",
  "approved_for_research",
  "approved_for_login",
  "in_research",
  "report_ready",
  "codex_prompt_ready",
  "blocked",
  "done",
];

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
    terms: ["manus", "sprint", "plan", "projektmanagement", "aufgaben", "roadmap", "webseite", "geschäftsidee", "monetarisierung", "monetization", "business model", "landing page", "competitor"],
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

function getConversationIntent(text) {
  const normalized = String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
  const statusTerms = ["status", "verbunden", "verbindung", "direktverbindung", "connected", "connector", "manus verbunden", "chatgpt verbunden", "aktueller status"];
  const explicitDelegationTerms = [
    "erstelle eine ceo-einschätzung", "erstelle eine ceo einschätzung", "ceo-einschätzung erstellen", "ceo einschätzung erstellen",
    "erstelle eine executive summary", "executive summary erstellen",
    "bereite manus vor", "erstelle einen manustask", "erstelle einen manus task", "gib das an manus weiter",
    "starte research", "go research", "go manus",
    "mach daraus einen operativen auftrag", "prüfe diese idee operativ mit manus", "prüf diese idee operativ mit manus",
    "erstelle codex-auftrag", "bereite umsetzung vor", "research-go", "manus-task", "manus task",
  ];
  const ambiguousTerms = ["mach das", "tu das", "setz das um", "starte das", "weiter damit"];

  if (includesAny(normalized, statusTerms)) return "status";
  if (includesAny(normalized, ambiguousTerms) && normalized.length < 80) return "clarify";
  if (includesAny(normalized, explicitDelegationTerms)) return "delegation";
  return "conversation";
}

function generateConversationalCeoReply(text) {
  const normalized = String(text || "").toLowerCase().trim();
  if (/^(hallo|hi|hey|test)\b/.test(normalized)) {
    return "Hallo. Ich bin verbunden. Sag mir einfach, worüber wir sprechen sollen — ich antworte normal im CEO-Modus und starte Manus erst bei klarem Auftrag oder GO.";
  }
  if (normalized.includes("unsicher")) {
    return "Verstanden. Dann lass uns es ruhig sortieren: Was ist die Entscheidung, welche Optionen siehst du, und welches Risiko macht dich gerade unsicher? Ich helfe dir, die beste nächste Entscheidung zu finden — ohne etwas zu delegieren.";
  }
  if (normalized.includes("welche option") || normalized.includes("empfehlen") || normalized.includes("was hältst du")) {
    return "Meine CEO-Sicht: Wir sollten zuerst Ziel, Aufwand, Risiko und Reversibilität vergleichen. Die bessere Option ist meistens die, die schnell validierbar ist, wenig irreversible Kosten erzeugt und einen klaren nächsten Lernschritt liefert. Wenn du mir die Optionen gibst, bewerte ich sie direkt.";
  }
  if (normalized.includes("wie gehen wir weiter")) {
    return "Nächster sinnvoller Schritt: Wir klären Ziel, gewünschtes Ergebnis und Grenzen. Danach entscheide ich mit dir, ob es nur ein Gespräch bleibt oder ob Manus einen vorbereiteten Auftrag bekommen soll.";
  }
  return "Verstanden. Ich bleibe in der CEO-Rolle: strategisch, priorisierend und risikobewusst. Erzähl mir kurz den Kontext oder die Optionen, dann gebe ich dir eine direkte Einschätzung — ohne Agenten zu starten, solange du keinen klaren Auftrag oder GO gibst.";
}

function generateStatusReply({ ceoStatus, manusCapability }) {
  return `Status kurz:\n- CEO ChatGPT: ${CEO_CONNECTION_STATUS_LABELS[ceoStatus] || ceoStatus}\n- COO Manus Connector: ${manusCapability.status}\n- Manus Live senden: ${manusCapability.canSendLive ? "bereit nach GO" : "deaktiviert, sicherer serverseitiger Connector fehlt"}\n- n8n Fallback: aktiv; Vertrag bleibt { chatInput: userMessage } → data.output\n- Delegation: keine gestartet.`;
}

function detectManusCapability() {
  const serverConnector = import.meta.env.VITE_MANUS_SERVER_CONNECTOR === "true";
  const connectorType = import.meta.env.VITE_MANUS_CONNECTOR_TYPE || "none";
  const status = serverConnector ? "manus_live_connected" : "needs_manus_connector";
  return {
    status,
    connectorType: serverConnector ? connectorType : "none",
    serverSideOnly: true,
    tokenInFrontend: false,
    canSendLive: serverConnector,
    missing: serverConnector ? "" : "Keine sichere Manus API/MCP/Webhook/Browser-Operator-Bridge serverseitig konfiguriert.",
  };
}

function inferManusTaskType(text) {
  const normalized = text.toLowerCase();
  if (includesAny(normalized, ["recherch", "research", "wettbewerb", "competitor"])) return MANUS_TASK_TYPES.research;
  if (includesAny(normalized, ["website", "webseite", "prüf", "review"])) return MANUS_TASK_TYPES.review;
  if (includesAny(normalized, ["codex", "umsetzung", "implementierung"])) return MANUS_TASK_TYPES.codexPreparation;
  return MANUS_TASK_TYPES.planning;
}

function createManusTaskModel(sourceMessage, sequence) {
  const now = new Date().toISOString();
  const taskType = inferManusTaskType(sourceMessage);
  return {
    id: `MANUS-${String(sequence).padStart(3, "0")}`,
    title: `COO Manus Auftrag ${String(sequence).padStart(2, "0")}`,
    objective: "Klaren CEO-Auftrag operativ prüfen, Research vorbereiten und nächste Entscheidung für den Owner ableiten.",
    sourceUserRequest: sourceMessage,
    assignedBy: "CEO ChatGPT",
    assignedTo: "COO Manus",
    taskType,
    researchQuestions: ["Was ist das Ziel?", "Welche Chancen, Risiken und Abhängigkeiten gibt es?", "Welche nächsten Schritte sind ohne Login oder externe Wirkung erlaubt?"],
    allowedActions: ["Öffentliche Recherche vorbereiten", "Analyseauftrag formulieren", "Wettbewerbsanalyse vorbereiten", "Website-Prüfung vorbereiten", "Codex-Prompt später vorbereiten"],
    blockedActions: ["Login", "Account-Zugriff", "Formulare absenden", "Käufe", "Zahlungen", "Uploads", "externe Aktionen mit Wirkung", "Merge", "Deploy"],
    approvalRequired: true,
    requiredApprovalType: "Research-GO; Login-GO und Action-GO separat erforderlich",
    expectedOutput: "ManusReport mit status, summary, findings, risks, recommendation, sourcesChecked, blockers, codexTaskDraft und approvalNeeded.",
    status: MANUS_TASK_STATUS,
    createdAt: now,
    updatedAt: now,
  };
}

function createManusReportModel() {
  return { status: "pending", summary: "", findings: [], risks: [], recommendation: "", sourcesChecked: [], blockers: [], codexTaskDraft: "", approvalNeeded: true };
}

function generateExecutiveDecision(sourceMessage, context = {}) {
  const normalized = sourceMessage.toLowerCase();
  const matchedRoutes = COMMAND_MATCHERS.filter((route) => includesAny(normalized, route.terms));
  const recommendedRoles = matchedRoutes.length > 0 ? matchedRoutes.map((route) => route.role) : ["CEO_CHATGPT"];
  const technical = recommendedRoles.includes("CTO_CODEX");
  const operational = recommendedRoles.includes("COO_MANUS");
  const riskTerms = ["ändern", "deploy", "commit", "pr", "kosten", "budget", "löschen", "kritisch", "api", "extern", "login", "zahlung", "kauf", "vertrag"];
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
    boardFlow: createBoardExecutionChain(recommendedRoles, requiresHumanApproval),
    involvedAgents: recommendedRoles,
    recommendedRoles,
    priority,
    riskLevel,
    requiresHumanApproval,
    approvalReason: requiresHumanApproval
      ? "Human Approval First: lokale Delegation/Prompts sind erlaubt, externe Ausführung oder Code-/Automationsänderungen benötigen menschliches GO."
      : "Kein kritischer externer Ausführungsschritt erkannt; CEO Layer hält trotzdem die Freigabe-Kontrolle sichtbar.",
    nextStep: "Board Execution Chain starten: Jarvis → CEO → Manus → Codex → Manus → CEO → Jarvis → Mensch.",
    nextExecutiveAction: "Command Bus Task(s) strukturieren, Delegationsbriefings ablegen und Freigabe durch den Menschen abwarten.",
    createdAt: new Date().toISOString(),
  };
}


function isManusWebResearchIntent(text) {
  const normalized = text.toLowerCase();
  return includesAny(normalized, ["webseite", "website", "url", "geschäftsidee", "business", "monetarisierung", "monetization", "saas", "landing page", "competitor", "wettbewerb"]);
}

function extractTargetUrl(text) {
  return text.match(/https?:\/\/[^\s)]+/i)?.[0] || "vom Owner nachreichen lassen";
}

function createManusWebResearchTask(sourceMessage, sequence, executiveDecision) {
  return {
    id: `MANUS-WEB-${String(sequence).padStart(3, "0")}`,
    type: "MANUS_WEB_RESEARCH_TASK",
    title: `Manus Web Research ${String(sequence).padStart(2, "0")}`,
    targetUrl: extractTargetUrl(sourceMessage),
    businessModelHypothesis: "Hypothese aus Nutzerauftrag ableiten; falls unklar, Rückfrage an den Menschen formulieren.",
    researchGoal: "Webseite/Geschäftsidee prüfen und Monetarisierungsmöglichkeiten mit Risiken, MVP und Codex-Folgeauftrag strukturieren.",
    allowedActions: MANUS_WEB_ALLOWED_ACTIONS,
    forbiddenActions: MANUS_WEB_FORBIDDEN_ACTIONS,
    requiredApprovalBeforeLogin: true,
    requiredApprovalBeforeExternalAction: true,
    expectedOutput: "Kurzfazit, Geschäftsmodell, Zielgruppe, Angebot, Monetarisierung, Traffic-Kanäle, technische Anforderungen, Risiken, MVP-Vorschlag, Codex-Auftrag, nächste Entscheidung.",
    codexFollowUpExpected: true,
    status: "needs_approval",
    priority: executiveDecision.priority,
    riskLevel: executiveDecision.riskLevel === "niedrig" ? "mittel" : executiveDecision.riskLevel,
  };
}

function generateManusReportTemplate(task) {
  return `Manus-Report-Format für ${task?.id || "MANUS_WEB_RESEARCH_TASK"}
- Kurzfazit:
- Geschäftsmodell:
- Zielgruppe:
- Angebot:
- Monetarisierung:
- Traffic-Kanäle:
- technische Anforderungen:
- Risiken:
- MVP-Vorschlag:
- Codex-Auftrag:
- nächste Entscheidung für den Menschen:`;
}

function generateManusBriefing(task, executiveDecision, context = {}) {
  if (!task) return "";
  const codexTask = context.tasks?.find((item) => item.assignedRole === "CTO_CODEX" && item.sourceMessage === task.sourceMessage);
  const codexFollowUp = codexTask
    ? "Codex-Folgeauftrag: technische Prüfung vorbereiten; keine Änderung, kein Commit, kein PR ohne menschliches GO."
    : "Mögliche Codex-Folgeaufgabe: technische Prüfung nur als Entwurf anlegen, falls der Owner sie freigibt.";
  const webTask = task.webResearchTask;
  const webSection = webTask ? `
MANUS_WEB_RESEARCH_TASK:
- id: ${webTask.id}
- title: ${webTask.title}
- targetUrl: ${webTask.targetUrl}
- businessModelHypothesis: ${webTask.businessModelHypothesis}
- researchGoal: ${webTask.researchGoal}
- allowedActions: ${webTask.allowedActions.join("; ")}
- forbiddenActions: ${webTask.forbiddenActions.join("; ")}
- requiredApprovalBeforeLogin: ${webTask.requiredApprovalBeforeLogin}
- requiredApprovalBeforeExternalAction: ${webTask.requiredApprovalBeforeExternalAction}
- expectedOutput: ${webTask.expectedOutput}
- codexFollowUpExpected: ${webTask.codexFollowUpExpected}
- status: ${webTask.status}
- priority: ${webTask.priority}
- riskLevel: ${webTask.riskLevel}

Manus-Report-Format:
${generateManusReportTemplate(webTask)}
` : "";
  return `Rolle: COO Manus
Projekt: PROJEKT JARVIS
CEO-Kontext: ${executiveDecision.intentSummary} · ${executiveDecision.strategicAssessment}
Ziel: ${task.description}
Kontext: Jarvis-Web ist Oberfläche und Kommandozentrale. CEO ChatGPT priorisiert; Command Bus routet; Mensch entscheidet.
${webSection}
Aufgaben:
- Sprintplan und Task-Breakdown strukturieren
- operative Abhängigkeiten, Blocker und Rückfragen sichtbar machen
- Statusbericht für Jarvis-Web formulieren
- ${codexFollowUp}
Priorität: ${task.priority}
Abhängigkeiten: CEO Decision ${executiveDecision.id}; Human Approval; externe Manus-Integration nicht verbunden.
Offene Fragen: Welche Ziele, Fristen, Ressourcen und Akzeptanzkriterien muss der Mensch bestätigen?
Gewünschter Output: Sprintplan, Task-Liste, Blocker-Liste, Rückfragen und vorbereitete Codex-Folgeaufgabe.
Freigabe-Regeln: research_only erlaubt nur Analyse. Login, externe Aktionen, Code-Generation, Commit/PR und Merge/Deploy brauchen separates GO. Status bleibt lokal; keine externe Manus-Ausführung vortäuschen.
Sicherheitsregeln: Keine Secrets, keine API-Keys im Frontend, keine Passwörter im Code, keine geschützten/proprietären Inhalte oder fremden Code kopieren.
Mögliche Codex-Folgeaufgabe: ${codexFollowUp}`;
}

function generateCodexPrompt(task, executiveDecision, context = {}) {
  if (!task) return "";
  const manuscript = context.manusReport || (task.webResearchTask ? generateManusReportTemplate(task.webResearchTask) : "Noch kein externer Manus-Report angehängt; Briefing/Report-Template als Grundlage nutzen.");
  return `Rolle: CTO Codex
CEO-Kontext: ${executiveDecision.intentSummary} · ${executiveDecision.strategicAssessment}
Ziel: ${task.description}
Kontext: Jarvis Pro Phase 2.7; CEO ChatGPT steht vor Command Bus/MCP Gateway/Tool Registry und steuert Manus sowie Codex.
Manus-Ergebnis: ${manuscript}
Gewünschte Umsetzung: technische Anforderungen aus dem Manus-Report originär/eigenständig umsetzen; keine fremden geschützten Inhalte kopieren.
Dateien/Module falls ableitbar: Frontend src/App.jsx, src/App.css; Dokumentation README.md und docs/*; keine n8n-Änderung ohne Notwendigkeit.
Anforderungen:
- technische Prüfung strukturieren
- betroffene Dateien/Module benennen
- UI/UX-Anforderungen aus Manus ableiten
- sichere Umsetzungsschritte vorschlagen
- Human Approval First sichtbar halten
Nicht brechen: n8n-Vertrag bleibt { chatInput: userMessage } und data.output; Voice First bleibt aktiv; keine Secrets ins Frontend.
Tests: npm run lint, npm run build, Secret Scan.
Secret-Regeln: Keine API-Keys, Passwörter oder Tokens einfügen; keine Secrets ins Frontend; keine geschützten Inhalte kopieren; eigene Umsetzung bauen.
Nach Umsetzung: Commit + PR erstellen, nicht mergen.
Warten auf menschliche Prüfung: Keine Änderung, kein Commit, kein PR ohne menschliches GO.`;
}

function createBoardExecutionChain(involvedAgents = [], requiresHumanApproval = true) {
  const hasManus = involvedAgents.includes("COO_MANUS");
  const hasCodex = involvedAgents.includes("CTO_CODEX");
  return [
    { step: 1, title: "Auftrag empfangen", agent: "JARVIS_INTERFACE", status: "done", current: false, next: false, approvalRequired: false, connection: "local_active" },
    { step: 2, title: "Ziel, Risiko, Priorität bewerten", agent: "CEO_CHATGPT", status: "active", current: true, next: false, approvalRequired: requiresHumanApproval, connection: CONNECTION_STATUS.CEO_CHATGPT.status },
    { step: 3, title: hasManus ? "Operativen Plan / Research erstellen" : "Operativen Plan vorbereiten", agent: "COO_MANUS", status: hasManus ? "ready" : "prepared", current: false, next: true, approvalRequired: true, connection: CONNECTION_STATUS.COO_MANUS.status },
    { step: 4, title: hasCodex ? "Technische Umsetzung / PR-Handoff vorbereiten" : "Technisches Handoff vorbereiten", agent: "CTO_CODEX", status: hasCodex ? "ready" : "prepared", current: false, next: false, approvalRequired: true, connection: CONNECTION_STATUS.CTO_CODEX.status },
    { step: 5, title: "Ergebnis operativ prüfen", agent: "COO_MANUS", status: "prepared", current: false, next: false, approvalRequired: false, connection: CONNECTION_STATUS.COO_MANUS.status },
    { step: 6, title: "Final Assessment und Empfehlung", agent: "CEO_CHATGPT", status: "prepared", current: false, next: false, approvalRequired: false, connection: CONNECTION_STATUS.CEO_CHATGPT.status },
    { step: 7, title: "Human Report anzeigen", agent: "JARVIS_INTERFACE", status: "prepared", current: false, next: false, approvalRequired: false, connection: "local_active" },
    { step: 8, title: "Freigabe / Änderung / Ablehnung", agent: "HUMAN_OWNER", status: "waiting", current: false, next: false, approvalRequired: true, connection: "local_active" },
  ];
}

function createCodexHandoff(task, executiveDecision, context = {}) {
  if (!task) return null;
  const manusPlan = context.manusBriefing || "COO Manus erstellt Sprintplan, Blocker, Rückfragen und Übergabe an CTO Codex; externe Aktion wartet auf GO.";
  return {
    title: `${task.title} – CTO Codex Technical Handoff`,
    objective: task.description,
    ceoContext: `${executiveDecision?.intentSummary || "Keine Executive Decision"} · ${executiveDecision?.strategicAssessment || ""}`,
    manusPlan,
    implementationRequirements: [
      "Technische Umsetzung aus Jarvis-Auftrag ableiten",
      "Board Execution Chain sichtbar beibehalten",
      "GitHub/Codex-Handoff lokal vorbereiten",
      "n8n-Chat-Vertrag nicht brechen",
    ],
    filesLikelyAffected: ["src/App.jsx", "src/App.css", "README.md", "docs/*"],
    constraints: ["Keine Secrets", "Keine API-Keys im Frontend", "Kein Merge", "Kein Deploy", "Externe Aktionen nur nach menschlichem GO"],
    securityRules: ["GitHub Token nur serverseitig/.env/n8n Credentials/MCP", "Keine Passwörter im Code", "Keine geschützten Inhalte kopieren"],
    testPlan: ["npm run lint", "npm run build", "Secret Scan", "n8n-Vertrag prüfen: { chatInput: userMessage } und data.output"],
    expectedOutput: context.codexPrompt || "Umsetzung mit Commit und PR nach Freigabe; PR nicht mergen; Status/Risiken an Jarvis zurückmelden.",
    branchPrRules: "Nicht direkt in main arbeiten; Commit + PR nach Umsetzung; kein Merge ohne menschliches GO.",
    humanApprovalRules: "Handoff, Issue-Erstellung, PR-Status-API, Merge und Deploy brauchen explizites GO; bei fehlender Verbindung nur lokal markieren.",
  };
}

function formatCodexHandoff(handoff) {
  return handoff ? JSON.stringify(handoff, null, 2) : "";
}

function createGitHubIssueDraft(task, executiveDecision, codexHandoff, manusPlan = "") {
  if (!task) return null;
  const relatedManusTask = task.assignedRole === "COO_MANUS" ? task.id : "falls vorhanden über Board Chain verknüpfen";
  const draft = {
    title: `${task.title} – GitHub/Codex Handoff`,
    labels: ["jarvis", "codex-handoff", "human-approval-required"],
    priority: task.priority,
    relatedBoardChainId: executiveDecision?.id ? `${executiveDecision.id}-BOARD` : "local-board-chain",
    relatedExecutiveDecisionId: executiveDecision?.id || "unknown",
    relatedManusTaskId: relatedManusTask,
    relatedCodexTaskId: task.id,
    humanApprovalRequired: true,
    riskNotes: ["GitHub API ist nur über sicheren serverseitigen/n8n/MCP-Connector erlaubt", "Kein Merge/Deploy ohne separates GO", "n8n-Chat-Vertrag darf nicht brechen"],
    acceptanceCriteria: ["Command-Bus-Zähler zählt dieselbe sichtbare Liste wie die gerenderten Karten", "Codex-Handoff ist sichtbar und kopierbar", "GitHub Issue Draft ist sichtbar und kopierbar", "Issue-Erstellung bleibt disabled, solange kein sicherer Connector verbunden ist"],
    testPlan: ["npm run lint", "npm run build", "Secret Scan", "n8n-Vertrag prüfen"],
    noSecretsNotice: "Keine Secrets, Tokens, API-Keys oder Passwörter committen oder im Frontend verwenden.",
    noMergeNotice: "Nach Umsetzung Commit + PR erstellen, aber nicht mergen; menschliche Prüfung abwarten.",
  };
  draft.body = `# ${draft.title}

## CEO-Kontext
${executiveDecision?.intentSummary || "Keine Executive Decision"}
${executiveDecision?.strategicAssessment || ""}

## Manus-Plan
${manusPlan || "COO Manus plant Sprint/Tasks/Blocker und prüft nach Umsetzung operativ."}

## Codex-Auftrag
${formatCodexHandoff(codexHandoff)}

## Betroffene Dateien/Module
${(codexHandoff?.filesLikelyAffected || ["src/App.jsx", "src/App.css", "README.md", "docs/*"]).map((item) => `- ${item}`).join("\n")}

## Anforderungen
${draft.acceptanceCriteria.map((item) => `- ${item}`).join("\n")}

## Nicht brechen
- Frontend sendet weiterhin { chatInput: userMessage }
- Frontend liest weiterhin data.output
- Keine Secrets/API-Keys im Frontend

## Tests
${draft.testPlan.map((item) => `- ${item}`).join("\n")}

## Sicherheitsregeln
- ${draft.noSecretsNotice}
- ${draft.noMergeNotice}
- Externe GitHub-/Codex-Aktionen nur nach menschlichem GO.

## Nach Umsetzung
Commit + PR erstellen, nicht mergen, auf menschliche Prüfung warten.`;
  return draft;
}

function formatGitHubIssueDraft(draft) {
  return draft ? JSON.stringify(draft, null, 2) : "";
}

function detectGitHubCapability() {
  const configuredStatus = CONNECTION_STATUS.GITHUB.status;
  const serverConnector = import.meta.env.VITE_GITHUB_SERVER_CONNECTOR === "true";
  const n8nOrchestrator = CONNECTION_STATUS.N8N_AUTOMATION.status === "connected";
  const connected = configuredStatus === "connected" && serverConnector;
  return {
    status: connected ? "connected" : configuredStatus,
    hasServerSideGitHubConfig: serverConnector,
    hasLocalEnvToken: false,
    hasN8nOrchestrator: n8nOrchestrator,
    canCreateIssueFromJarvis: connected,
    canReadPrStatus: connected,
    canUpdateManualStatus: true,
    liveStatusConnected: connected,
    missing: connected ? "" : CONNECTION_STATUS.GITHUB.missing,
    issueCreationDisabledReason: connected ? "" : CONNECTION_STATUS.GITHUB.missing,
    prStatusDisabledReason: connected ? "" : "Live-Status nicht verbunden: PR/Checks/Review bitte manuell aus Codex/GitHub übernehmen.",
  };
}

function createReturnPathReport(task, executiveDecision) {
  return {
    codexResultReport: { summary: "Noch kein externer Live-Codex-Rückkanal verbunden.", changedFiles: [], tests: [], risks: ["Externe Codex-Ausführung nicht verbunden", "GitHub Live-Status nicht verbunden"], openQuestions: ["Soll der vorbereitete Auftrag manuell an Codex übergeben werden?"], prInfo: "Kein Live-PR-Status verbunden; manuelle Statusübernahme möglich" },
    manusOperationalReview: { matchesPlan: "offen", missingItems: ["Manus-Report fehlt"], blockers: ["Manus API/Webhook/MCP nicht konfiguriert"], recommendation: "Research zuerst manuell/extern nach GO durchführen." },
    ceoFinalAssessment: { riskLevel: executiveDecision?.riskLevel || "mittel", recommendation: "Erst Handoff prüfen, dann menschliches GO einholen.", approveRecommendation: false, requiresHumanDecision: true },
    jarvisHumanReport: { whatHappened: task ? `${task.roleLabel}-Handoff wurde lokal vorbereitet.` : "Noch kein Task vorbereitet.", risks: "Keine externe Ausführung erfolgt; Verbindungen fehlen teilweise.", recommendation: "Freigabe für Research oder Codex-Handoff bewusst setzen.", requiredDecision: "GO / Änderung / Ablehnung", possibleActions: ["Research-GO", "Login-GO", "Codex-Handoff-GO", "Ablehnen"] },
  };
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
    externalStatus: route.role === "COO_MANUS" ? MANUS_CONNECTOR_STATUS : "extern nicht verbunden",
    manusTask: route.role === "COO_MANUS" ? createManusTaskModel(sourceMessage, sequence) : null,
    manusReport: route.role === "COO_MANUS" ? createManusReportModel() : null,
    githubHandoffStatus: route.role === "CTO_CODEX" ? "draft" : undefined,
    githubIssue: null,
    githubReturnChannel: route.role === "CTO_CODEX" ? createGitHubReturnChannelStatus() : undefined,
    webResearchTask: route.role === "COO_MANUS" && isManusWebResearchIntent(sourceMessage)
      ? createManusWebResearchTask(sourceMessage, sequence, executiveDecision)
      : null,
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
      githubHandoffStatus: "draft",
      githubIssue: null,
      githubReturnChannel: createGitHubReturnChannelStatus(),
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
    locally_approved: "lokal freigegeben",
    issue_ready: "Issue bereit",
    issue_created: "Issue erstellt",
    codex_pending: "Codex wartet",
    codex_in_progress: "Codex arbeitet",
    pr_created: "PR erstellt",
    pr_review_required: "PR Review nötig",
    approved_by_human: "vom Menschen freigegeben",
    failed: "fehlgeschlagen",
    approved_for_research: "für Recherche freigegeben",
    approved_for_login: "Login freigegeben",
    ready_for_external_handoff: "bereit für externe Übergabe",
    in_research: "in Recherche",
    report_ready: "Report bereit",
    codex_prompt_ready: "Codex-Prompt bereit",
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
  const [ceoConnectionStatus, setCeoConnectionStatus] = useState("pending");
  const [voiceStatus, setVoiceStatus] = useState("ready");
  const [ttsProvider, setTtsProvider] = useState("OpenAI");
  const [voiceFirst, setVoiceFirst] = useState(true);
  const [expandedMessages, setExpandedMessages] = useState({});
  const [localApprovals, setLocalApprovals] = useState(() => JSON.parse(localStorage.getItem("jarvis.approvals") || "{}"));
  const [copyNotice, setCopyNotice] = useState("");
  const [time, setTime] = useState(new Date());
  const [executiveDecisions, setExecutiveDecisions] = useState(() => JSON.parse(localStorage.getItem("jarvis.executiveDecisions") || "[]"));
  const [commands, setCommands] = useState(() => JSON.parse(localStorage.getItem("jarvis.commandTasks") || "[]"));
  const [manualGitHubStatus, setManualGitHubStatus] = useState(() => JSON.parse(localStorage.getItem("jarvis.githubReturnChannel") || "null") || createGitHubReturnChannelStatus());
  const [conversationMode, setConversationMode] = useState("Gespräch");
  const chatEndRef = useRef(null);
  const voiceQueueRef = useRef([]);
  const selectedVoiceRef = useRef(null);
  const sendMessageRef = useRef(null);
  const latestDecision = executiveDecisions.at(-1);
  const visibleCommandTasks = commands.slice(-4).reverse();
  const visibleCommandTaskCount = visibleCommandTasks.length;
  const latestManusTask = [...commands].reverse().find((command) => command.assignedRole === "COO_MANUS");
  const latestCodexTask = [...commands].reverse().find((command) => command.assignedRole === "CTO_CODEX");
  const latestManusDecision = executiveDecisions.find((decision) => decision.id === latestManusTask?.executiveDecisionId) || latestDecision;
  const latestCodexDecision = executiveDecisions.find((decision) => decision.id === latestCodexTask?.executiveDecisionId) || latestDecision;
  const latestManusBriefing = latestManusTask && latestManusDecision ? generateManusBriefing(latestManusTask, latestManusDecision, { tasks: commands }) : "";
  const latestCodexPrompt = latestCodexTask && latestCodexDecision ? generateCodexPrompt(latestCodexTask, latestCodexDecision, { tasks: commands }) : "";
  const latestExecutiveSummary = latestDecision ? generateExecutiveSummary(latestDecision, commands.filter((task) => task.executiveDecisionId === latestDecision.id)) : "";
  const activeBoardChain = latestDecision?.boardFlow || createBoardExecutionChain([], false);
  const githubCapability = detectGitHubCapability();
  const manusCapability = detectManusCapability();
  const latestCodexHandoff = latestCodexTask && latestCodexDecision ? createCodexHandoff(latestCodexTask, latestCodexDecision, { manusBriefing: latestManusBriefing, codexPrompt: latestCodexPrompt }) : null;
  const latestCodexHandoffText = formatCodexHandoff(latestCodexHandoff);
  const latestGitHubIssueDraft = latestCodexTask && latestCodexDecision ? createGitHubIssueDraft(latestCodexTask, latestCodexDecision, latestCodexHandoff, latestManusBriefing) : null;
  const latestGitHubIssueDraftText = formatGitHubIssueDraft(latestGitHubIssueDraft);
  const latestGitHubReturnStatus = latestCodexTask?.githubReturnChannel || manualGitHubStatus;
  const nextGitHubApproval = latestGitHubReturnStatus.humanApprovalRequired
    ? "Menschliche Prüfung/Freigabe erforderlich: Status prüfen, Blocker klären, PR reviewen. Kein Merge/Deploy in Jarvis."
    : "Keine nächste Freigabe markiert; Merge/Deploy bleiben trotzdem außerhalb von Jarvis.";
  const latestReturnPathReport = createReturnPathReport(latestCodexTask || latestManusTask, latestDecision);
  const voiceStatusLabel = VOICE_STATUS_LABELS[voiceStatus] || voiceStatus;

  const copyToClipboard = async (text, notice) => {
    if (!text) return;
    await navigator.clipboard?.writeText(text);
    setCopyNotice(notice);
    window.setTimeout(() => setCopyNotice(""), 2200);
  };

  const updateGitHubReturnStatus = (field, value) => {
    const updated = createGitHubReturnChannelStatus({ ...latestGitHubReturnStatus, [field]: value });
    setManualGitHubStatus(updated);
    if (latestCodexTask) {
      setCommands((old) => old.map((task) => task.id === latestCodexTask.id ? { ...task, githubReturnChannel: updated } : task));
    }
  };

  const importGitHubReturnStatus = () => {
    const pasted = window.prompt("Codex/GitHub Status als JSON einfügen");
    if (!pasted) return;
    try {
      const parsed = JSON.parse(pasted);
      const updated = createGitHubReturnChannelStatus(parsed);
      setManualGitHubStatus(updated);
      if (latestCodexTask) {
        setCommands((old) => old.map((task) => task.id === latestCodexTask.id ? { ...task, githubReturnChannel: updated } : task));
      }
      setCopyNotice("GitHub Rückkanal manuell übernommen");
      window.setTimeout(() => setCopyNotice(""), 2200);
    } catch {
      setCopyNotice("Ungültiges JSON für GitHub Rückkanal");
      window.setTimeout(() => setCopyNotice(""), 2200);
    }
  };

  const markTask = (taskId, status) => {
    setLocalApprovals((old) => ({ ...old, [taskId]: status }));
    setCommands((old) => old.map((task) => {
      if (task.id !== taskId) return task;
      const githubHandoffStatus = GITHUB_HANDOFF_STATUS_VALUES.includes(status) ? status : task.githubHandoffStatus;
      return { ...task, status, githubHandoffStatus };
    }));
  };

  const WEBHOOK_URL =
    "http://localhost:5678/webhook/929fb2f5-1f53-4f22-bf25-315d165f72f6";
  const DIRECT_CHATGPT_URL = "/api/chatgpt";

  async function requestChatGptAnswer(userMessage, mode = "conversation") {
    try {
      const directResponse = await fetch(DIRECT_CHATGPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, mode }),
      });

      if (!directResponse.ok) throw new Error(`Direct CEO ChatGPT unavailable: ${directResponse.status}`);
      const directData = await directResponse.json();
      return {
        answer: directData.output || "Keine Antwort erhalten.",
        ceoStatus: directData.status || "connected_direct",
      };
    } catch {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatInput: userMessage }),
      });

      const data = await response.json();
      return {
        answer: data.output || "Keine Antwort erhalten.",
        ceoStatus: "fallback_n8n",
      };
    }
  }

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

  useEffect(() => {
    localStorage.setItem("jarvis.executiveDecisions", JSON.stringify(executiveDecisions));
  }, [executiveDecisions]);

  useEffect(() => {
    localStorage.setItem("jarvis.commandTasks", JSON.stringify(commands));
  }, [commands]);

  useEffect(() => {
    localStorage.setItem("jarvis.approvals", JSON.stringify(localApprovals));
  }, [localApprovals]);

  useEffect(() => {
    localStorage.setItem("jarvis.githubReturnChannel", JSON.stringify(manualGitHubStatus));
  }, [manualGitHubStatus]);



  async function sendMessage(customMessage) {
    const userMessage = customMessage || message;
    if (!userMessage.trim() || loading) return;

    setMessage("");
    setChat((old) => [...old, { role: "user", text: userMessage }]);
    const conversationIntent = getConversationIntent(userMessage);

    setConversationMode(conversationIntent === "delegation" ? "Delegation" : "Gespräch");

    if (conversationIntent === "clarify") {
      const clarification = "Was genau soll Manus prüfen oder vorbereiten? Formuliere bitte Ziel, Kontext und gewünschtes Ergebnis — dann erstelle ich den ManusTask.";
      setChat((old) => [...old, { role: "jarvis", text: clarification, summary: clarification }]);
      speak(clarification);
      return;
    }

    if (conversationIntent === "status") {
      const statusAnswer = generateStatusReply({ ceoStatus: ceoConnectionStatus, manusCapability });
      setChat((old) => [...old, { role: "jarvis", text: statusAnswer, summary: statusAnswer }]);
      speak(statusAnswer);
      return;
    }

    if (conversationIntent === "conversation") {
      setLoading(true);

      try {
        const { answer, ceoStatus } = await requestChatGptAnswer(userMessage, "conversation");
        setCeoConnectionStatus(ceoStatus);
        setChat((old) => [...old, { role: "jarvis", text: answer, summary: createVisibleSummary(answer) }]);
        speak(answer);
      } catch (error) {
        console.error(error);
        setCeoConnectionStatus("failed");
        const fallbackAnswer = generateConversationalCeoReply(userMessage);
        setChat((old) => [...old, { role: "jarvis", text: fallbackAnswer, summary: fallbackAnswer }]);
        speak(fallbackAnswer);
      }

      setLoading(false);
      return;
    }

    const executiveDecision = generateExecutiveDecision(userMessage, { decisionNumber: executiveDecisions.length + 1 });
    const draftedCommands = createCommandsFromDecision(userMessage, commands.length + 1, executiveDecision);
    setExecutiveDecisions((old) => [...old, executiveDecision]);
    if (draftedCommands.length > 0) {
      setCommands((old) => [...old, ...draftedCommands]);
    }
    setLoading(true);

    try {
      const { answer, ceoStatus } = await requestChatGptAnswer(userMessage, "delegation");
      setCeoConnectionStatus(ceoStatus);

      setChat((old) => [...old, { role: "jarvis", text: answer, summary: createVisibleSummary(answer) }]);
      speak(answer);
    } catch (error) {
      console.error(error);
      setCeoConnectionStatus("failed");
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
            localStorage.removeItem("jarvis.executiveDecisions");
            localStorage.removeItem("jarvis.commandTasks");
            localStorage.removeItem("jarvis.approvals");
            setManualGitHubStatus(createGitHubReturnChannelStatus());
            localStorage.removeItem("jarvis.githubReturnChannel");
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
            <span>{CEO_CONNECTION_STATUS_LABELS[ceoConnectionStatus].toUpperCase()}</span>
            <span>MODUS: {conversationMode.toUpperCase()}</span>
          </div>

          <h1>JARVIS PRO</h1>
          <p>BOARD EXECUTION CHAIN · HUMAN APPROVAL FIRST</p>
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
                <span>MODUS: {conversationMode}</span>
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
          <strong>{CEO_CONNECTION_STATUS_LABELS[ceoConnectionStatus]}</strong>
          <small>Modus: {conversationMode}</small>
          <small>Jarvis → /api/chatgpt → OpenAI zuerst. Bei Nichtverfügbarkeit bleibt der bestehende n8n-Fallback mit {`{ chatInput: userMessage }`} und data.output aktiv.</small>
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
          <p>Live Connectivity</p>
          <strong>{BOARD_AGENTS.length} BOARD-ROLLEN · VERBINDUNGEN EHRLICH GEPRÜFT</strong>
          <ul>
            {Object.entries(CONNECTION_STATUS).map(([key, item]) => (
              <li key={key}><b>{item.component}: {item.status}</b><br />Möglich: {item.possible}<br />Fehlt: {item.missing}<br />Nach GO: {item.allowedAfterGo}<br />Blockiert: {item.blocked}</li>
            ))}
          </ul>
        </div>

        <div className="statusModule integrationMap">
          <p>Manus Web Governance</p>
          <strong>COO WEB OPERATOR PREPARED</strong>
          <small>Capabilities: {MANUS_WEB_CAPABILITIES.join(", ")}</small>
          <small>Statuswerte: {MANUS_WEB_STATUS_VALUES.join(", ")}</small>
          <ul>
            {APPROVAL_LEVELS.map((level) => <li key={level.id}>{level.label}: {level.rule}</li>)}
          </ul>
        </div>

        <div className="statusModule boardChain">
          <p>Board Execution Chain</p>
          <strong>{activeBoardChain.find((step) => step.current)?.title || "bereit"}</strong>
          <div className="chainList">
            {activeBoardChain.map((step) => (
              <article className={`chainStep ${step.current ? "current" : ""} ${step.next ? "next" : ""}`} key={`${step.step}-${step.agent}`}>
                <span>{step.step}. {step.title}</span>
                <small>Zuständig: {ROLES[step.agent]?.label || step.agent}</small>
                <small>Status: {step.status} · Nächster Schritt: {step.next ? "ja" : "nein"}</small>
                <small>Freigabe erforderlich: {step.approvalRequired ? "ja" : "nein"} · Verbindung: {step.connection}</small>
              </article>
            ))}
          </div>
        </div>

        <div className="statusModule commandBus">
          <p>CEO Command Bus</p>
          <strong>
            {visibleCommandTaskCount} {visibleCommandTaskCount === 1 ? "Aufgabe" : "Aufgaben"} sichtbar
          </strong>
          {visibleCommandTaskCount > 0 ? (
            <div className="commandDetails">
              {visibleCommandTasks.map((command) => (
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
          <strong>ChatGPT → Manus Bridge: {latestManusTask ? "task_prepared" : "bereit"}</strong>
          <small>Manus Connector Status: {manusCapability.status} · Live senden: {manusCapability.canSendLive ? "nach GO möglich" : "disabled"} · Research-GO benötigt: {latestManusTask ? "ja" : "nein"}</small>
          {latestManusTask ? (
            <div className="manusDetails">
              <span>Letzter Task: {latestManusTask.title}</span>
              <span>Status: {latestManusTask.manusTask?.status || formatStatus(latestManusTask.status)} · Connector: {manusCapability.status}</span>
              <span>ManusTask vorhanden: {latestManusTask.manusTask?.id || "nein"}</span>
              <span>Research-GO benötigt: ja · Login-GO separat: ja · Action-GO separat: ja</span>
              <span>Web Research Task: {latestManusTask.webResearchTask?.id || "nicht erforderlich"}</span>
              <span>Browser/Login: nur mit expliziter Freigabe · Live-Ausführung: {manusCapability.canSendLive ? "serverseitig vorbereitet" : "nicht verbunden"}</span>
              <details className="briefingBox">
                <summary>Manus-Briefing anzeigen</summary>
                <pre className="promptBox">{JSON.stringify({ manusTask: latestManusTask.manusTask, briefing: latestManusBriefing, reportTemplate: latestManusTask.manusReport }, null, 2)}</pre>
              </details>
              <button className="miniAction" onClick={() => copyToClipboard(JSON.stringify({ manusTask: latestManusTask.manusTask, briefing: latestManusBriefing, reportTemplate: latestManusTask.manusReport }, null, 2), "Manus-Auftrag kopiert")}>
                Manus-Auftrag kopieren
              </button>
              <button className="miniAction" onClick={() => markTask(latestManusTask.id, "approved_for_research")}>
                Research-Freigabe lokal markieren
              </button>
              <button className="miniAction" onClick={() => markTask(latestManusTask.id, "approved_for_login")}>
                Login-Freigabe lokal markieren
              </button>
              <button className="miniAction" onClick={() => copyToClipboard(generateCodexPrompt(latestManusTask, latestManusDecision, { tasks: commands }), "Codex-Folgeauftrag aus Manus kopiert")}>
                Codex-Folgeauftrag erzeugen/kopieren
              </button>
              <button className="miniAction" disabled={!manusCapability.canSendLive} title={manusCapability.missing || "Nur nach Research-GO"}>
                Manus live senden{manusCapability.canSendLive ? " (nach GO)" : " disabled"}
              </button>
              <button className="miniAction" onClick={() => copyToClipboard(JSON.stringify(latestManusTask.manusTask, null, 2), "ManusTask Handoff kopiert")}>
                Copy/Handoff ManusTask
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
              <span>GitHub: {githubCapability.status} · Live-Rückkanal: {githubCapability.liveStatusConnected ? "verbunden" : "nicht verbunden"}</span>
              <span>Handoff-Status: {latestCodexTask.githubHandoffStatus || "draft"} · Modell: {GITHUB_HANDOFF_STATUS_VALUES.length} Statuswerte</span>
              <div className="githubReturnChannel">
                <strong>GitHub Rückkanal / Codex PR Status</strong>
                <small className={githubCapability.liveStatusConnected ? "connectorLive" : "connectorWarning"}>
                  {githubCapability.liveStatusConnected
                    ? "Live-Status über sicheren Connector verbunden."
                    : `Live-Status nicht verbunden (${githubCapability.status}). Manuelle Copy/Paste-Statusübernahme ist aktiv; GitHub-Buttons bleiben deaktiviert.`}
                </small>
                <div className="githubStatusGrid">
                  <span><b>GitHub Issue URL</b>{latestGitHubReturnStatus.issueUrl || "nicht gesetzt"}</span>
                  <span><b>Branch Name</b>{latestGitHubReturnStatus.branchName || "nicht gesetzt"}</span>
                  <span><b>Commit SHA</b>{latestGitHubReturnStatus.commitSha || "nicht gesetzt"}</span>
                  <span><b>PR URL</b>{latestGitHubReturnStatus.prUrl || "nicht gesetzt"}</span>
                  <span><b>PR Status</b>{latestGitHubReturnStatus.prStatus}</span>
                  <span><b>Checks</b>{latestGitHubReturnStatus.checksStatus}</span>
                  <span><b>Review Status</b>{latestGitHubReturnStatus.reviewStatus}</span>
                  <span><b>Blocker</b>{latestGitHubReturnStatus.blockerNotes || "keine Angabe"}</span>
                  <span><b>Nächste notwendige Freigabe</b>{nextGitHubApproval}</span>
                  <span><b>Zuletzt aktualisiert</b>{latestGitHubReturnStatus.lastUpdatedAt || "noch nie"}</span>
                </div>
                <details className="briefingBox">
                  <summary>Manuelle Statusübernahme bearbeiten</summary>
                  <div className="manualStatusForm">
                    {GITHUB_RETURN_CHANNEL_FIELDS.map((field) => (
                      <label key={field.key}>
                        {field.label}
                        <input
                          value={latestGitHubReturnStatus[field.key] || ""}
                          placeholder={field.placeholder}
                          onChange={(event) => updateGitHubReturnStatus(field.key, event.target.value)}
                        />
                      </label>
                    ))}
                    <label className="checkboxLine">
                      <input
                        type="checkbox"
                        checked={latestGitHubReturnStatus.humanApprovalRequired}
                        onChange={(event) => updateGitHubReturnStatus("humanApprovalRequired", event.target.checked)}
                      />
                      Menschliche Freigabe weiterhin erforderlich
                    </label>
                  </div>
                </details>
                <button className="miniAction" onClick={() => copyToClipboard(JSON.stringify(latestGitHubReturnStatus, null, 2), "Codex PR Status kopiert")}>Codex PR Status kopieren</button>
                <button className="miniAction" onClick={importGitHubReturnStatus}>Manuellen Status einfügen</button>
              </div>
              <details className="briefingBox">
                <summary>Codex-Handoff anzeigen</summary>
                <pre className="promptBox">{latestCodexHandoffText}</pre>
              </details>
              <button className="miniAction" onClick={() => copyToClipboard(latestCodexHandoffText, "Codex-Handoff kopiert")}>
                Codex-Handoff kopieren
              </button>
              <button className="miniAction" onClick={() => markTask(latestCodexTask.id, "locally_approved")}>
                Als Codex-Handoff freigegeben markieren
              </button>
              <details className="briefingBox">
                <summary>GitHub-Issue-Entwurf anzeigen</summary>
                <pre className="promptBox">{latestGitHubIssueDraftText}</pre>
              </details>
              <button className="miniAction" onClick={() => copyToClipboard(latestGitHubIssueDraftText, "GitHub Issue Draft kopiert")}>
                GitHub-Issue-Entwurf kopieren
              </button>
              <button className="miniAction" onClick={() => copyToClipboard(JSON.stringify(githubCapability, null, 2), "GitHub-Prüfung kopiert")}>
                GitHub-Issue-Erstellung prüfen
              </button>
              <button className="miniAction" disabled={!githubCapability.canCreateIssueFromJarvis} title={githubCapability.issueCreationDisabledReason || "Nur nach menschlichem GO"}>
                GitHub Issue erstellen{githubCapability.canCreateIssueFromJarvis ? " (nach GO)" : " deaktiviert"}
              </button>
              <button className="miniAction" disabled={!githubCapability.canReadPrStatus} title={githubCapability.prStatusDisabledReason || "Nur nach menschlichem GO"}>PR-/Issue-Status live prüfen{githubCapability.canReadPrStatus ? " (nach GO)" : " deaktiviert"}</button>
              {!githubCapability.canCreateIssueFromJarvis && <small>{githubCapability.issueCreationDisabledReason}</small>}
              {!githubCapability.canReadPrStatus && <small>{githubCapability.prStatusDisabledReason}</small>}
            </div>
          ) : <small>Kein Codex-Task erkannt · Folgeauftrag wird bei Technik-/Codex-Aufgaben erzeugt.</small>}
        </div>

        {copyNotice && <div className="copyToast">{copyNotice}</div>}

        <div className="statusModule returnPath">
          <p>Rückweg / Human Report</p>
          <strong>{latestReturnPathReport.jarvisHumanReport.requiredDecision}</strong>
          <small>{latestReturnPathReport.jarvisHumanReport.whatHappened}</small>
          <small>CEO Empfehlung: {latestReturnPathReport.ceoFinalAssessment.recommendation}</small>
          <small>Manus Review: {latestReturnPathReport.manusOperationalReview.recommendation}</small>
          <small>Aktionen: {latestReturnPathReport.jarvisHumanReport.possibleActions.join(" · ")}</small>
        </div>

        <div className="statusModule">
          <p>Chat Session</p>
          <strong>{chat.length} Messages</strong>
          <small>{loading ? "Analysis stream pending" : "Console idle"}</small>
        </div>

        <div className="statusModule integrationMap">
          <p>MCP/API Tool Layer</p>
          <strong>PREPARED · MCP READY</strong>
          <ul>
            {TOOL_REGISTRY.map((tool) => <li key={tool.name}>{tool.name}: {tool.mode}</li>)}
          </ul>
        </div>

        <div className="statusModule taskStore">
          <p>Local Task Store</p>
          <strong>{CONNECTION_STATUS.LOCAL_TASK_STORE.status}</strong>
          <button className="miniAction" onClick={() => copyToClipboard(JSON.stringify({ executiveDecisions, boardChains: executiveDecisions.map((decision) => decision.boardFlow), commandTasks: commands, approvals: localApprovals, manusCapability }, null, 2), "Task State exportiert")}>Export Task State</button>
          <button className="miniAction" onClick={() => { setCommands([]); setExecutiveDecisions([]); setLocalApprovals({}); localStorage.removeItem("jarvis.executiveDecisions"); localStorage.removeItem("jarvis.commandTasks"); localStorage.removeItem("jarvis.approvals"); }}>Clear Task State</button>
          <small>Speichert keine Secrets; nur lokale Board-/Task-/Approval-Daten.</small>
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
