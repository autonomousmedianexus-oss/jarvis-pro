import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("VOICE STANDBY");
  const [time, setTime] = useState(new Date());
  const chatEndRef = useRef(null);

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

  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 1;
    utterance.pitch = 0.9;

    window.speechSynthesis.speak(utterance);
  }

  function startWakeWordListener() {
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
      } catch {}
    };

    try {
      recognition.start();
    } catch {
      setVoiceStatus("MIKROFON FREIGEBEN");
    }
  }

  async function sendMessage(customMessage) {
    const userMessage = customMessage || message;
    if (!userMessage.trim() || loading) return;

    setMessage("");
    setChat((old) => [...old, { role: "user", text: userMessage }]);
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
        <h2>JARVIS</h2>

        <button className="newChat" onClick={() => setChat([])}>
          + Neuer Chat
        </button>

        <div className="sideSection">
          <p>AGENTEN</p>
          <span>Jarvis Core</span>
          <span>Geschäftsplan-Agent</span>
          <span>Marketing-Agent</span>
          <span>Video-Agent</span>
          <span>n8n-Agent</span>
          <span>Erinnerungen</span>
          <span>Automationen</span>
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
          <p>IRON HUD SYSTEM INTERFACE</p>
        </header>

        <section className="chatBox">
          {chat.length === 0 && (
            <div className="welcome">
              Sag <b>„Hallo Jarvis“</b> oder schreibe unten deine Anfrage.
            </div>
          )}

          {chat.map((item, index) => (
            <div
              key={index}
              className={`messageRow ${
                item.role === "user" ? "userRow" : "jarvisRow"
              }`}
            >
              <div className="avatar">{item.role === "user" ? "Du" : "J"}</div>
              <div className={`bubble ${item.role}`}>{item.text}</div>
            </div>
          ))}

          {loading && (
            <div className="messageRow jarvisRow">
              <div className="avatar">J</div>
              <div className="bubble jarvis analyzing">
                Jarvis analysiert<span>.</span><span>.</span><span>.</span>
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
    </div>
  );
}

export default App;