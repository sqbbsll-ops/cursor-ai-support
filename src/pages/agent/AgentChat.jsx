import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dash from "./AgentDashboard.module.css";
import styles from "./AgentChat.module.css";

/** @typedef {{ id: string, kind: 'user' | 'ai' | 'aiCard', text: string, unprocessed?: boolean }} HistoryMsg */
/** @typedef {{ text: string, tag: string }} UnprocessedCard */
/** @typedef {{ status: 'done' | 'warning' | 'pending', text: string }} StepItem */
/** @typedef {{ key: string, value: string }} OrderLine */
/** @typedef {{ label: string, color: 'green' | 'orange' | 'red' | 'blue' | 'gray' }} SignalBadge */
/** @typedef {{ emotion: SignalBadge, attitude: SignalBadge, intent: SignalBadge }} SessionSignals */
/** @typedef {{ label: string, value: string, targetMessageId: string }} KeyFact */
/** @typedef {{ text: string, targetMessageId: string }} PotentialIssue */

/**
 * @typedef {{
 *   initials: string;
 *   userName: string;
 *   issue: string;
 *   timer: string;
 *   waitDisplay: string;
 *   priorityLabel: string;
 *   priorityHigh: boolean;
 *   orderHeader: { no: string; route: string; departure: string };
 *   messages: HistoryMsg[];
 *   quickChips: string[];
 *   requestHeadline: string;
 *   requestSubtext: string;
 *   recommendedAction: string;
 *   confidence: SignalBadge;
 *   keyFacts: KeyFact[];
 *   potentialIssues: PotentialIssue[];
 *   summaryBasis: string;
 *   quotes: string[];
 *   signals: SessionSignals;
 *   unprocessedCards: UnprocessedCard[];
 *   steps: StepItem[];
 *   primaryActionLabel?: string;
 *   secondaryActionLabel?: string;
 *   manualHandlingNote?: string;
 * }} ChatSessionData
 */

/** @type {Record<string, ChatSessionData>} */
const CHAT_SESSIONS = {
  "1": {
    initials: "ZW",
    userName: "Zhang Wei",
    issue: "Flight Refund",
    timer: "04:23",
    waitDisplay: "3m 42s",
    priorityLabel: "High",
    priorityHigh: true,
    orderHeader: { no: "C12345678", route: "Shanghai → Beijing", departure: "Apr 28, 14:00" },
    messages: [
      { id: "s1-user-cancel", kind: "user", text: "I'd like to cancel my flight" },
      { id: "s1-ai-lookup", kind: "ai", text: "Got it! Let me look up your recent bookings. One moment please..." },
      {
        id: "s1-order-found",
        kind: "aiCard",
        text: "Flight found: Shanghai (PVG) → Beijing (PEK), Apr 28 14:00, Order C12345678"
      },
      { id: "s1-urgent", kind: "user", text: "Actually I'm in a bit of a rush, I need this done today", unprocessed: true },
      { id: "s1-failed-contact", kind: "user", text: "I tried calling yesterday but no one picked up", unprocessed: true },
      { id: "s1-ai-options", kind: "ai", text: "Would you like to apply for a refund or explore rebooking options?" },
      { id: "s1-rebooking-first", kind: "user", text: "Let's do rebooking first" },
      { id: "s1-ai-rebooking", kind: "ai", text: "Rebooking fee: CNY 120. Next available: Apr 28 18:00." },
      { id: "s1-final-refund", kind: "user", text: "Actually just refund please" },
      { id: "s1-refund-confirmed", kind: "ai", text: "Refund amount: CNY 680, processing fee CNY 50, timeline 3-5 business days." },
      { id: "s1-ok-confirmed", kind: "user", text: "OK confirmed" }
    ],
    quickChips: ["Refund confirmed", "Processing now", "Need more info", "Escalate"],
    requestHeadline: "Refund Application",
    requestSubtext: "Checked rebooking first → confirmed refund",
    recommendedAction: "Process refund directly",
    confidence: { label: "High", color: "green" },
    keyFacts: [
      { label: "Task", value: "Refund Application", targetMessageId: "s1-final-refund" },
      { label: "Order", value: "C12345678", targetMessageId: "s1-order-found" },
      { label: "Status", value: "Refund confirmed", targetMessageId: "s1-refund-confirmed" }
    ],
    potentialIssues: [
      { text: "User in a rush — urgent handling needed", targetMessageId: "s1-urgent" },
      { text: "Previous failed contact attempt", targetMessageId: "s1-failed-contact" }
    ],
    summaryBasis: "Full conversation",
    quotes: [
      "I'm in a bit of a rush, I need this done today.",
      "I tried calling yesterday but no one picked up.",
      "Actually just refund please."
    ],
    signals: {
      emotion: { label: "Anxious", color: "orange" },
      attitude: { label: "Cooperative", color: "green" },
      intent: { label: "Wants fast resolution", color: "orange" }
    },
    unprocessedCards: [
      { text: "I'm in a rush, need this done today", tag: "Urgency" },
      { text: "I tried calling yesterday", tag: "Prior contact" }
    ],
    steps: [
      { status: "done", text: "Order identified" },
      { status: "done", text: "Rebooking reviewed" },
      { status: "done", text: "Refund confirmed" },
      { status: "pending", text: "Agent processing" }
    ],
    primaryActionLabel: "Confirm & Process Refund",
    secondaryActionLabel: "Escalate Case"
  },
  "2": {
    initials: "LM",
    userName: "Li Ming",
    issue: "Hotel Upgrade Inquiry",
    timer: "02:11",
    waitDisplay: "1m 15s",
    priorityLabel: "Standard",
    priorityHigh: false,
    orderHeader: { no: "H98765432", route: "Grand Hyatt Shanghai", departure: "Apr 27-29" },
    messages: [
      { id: "s2-user-change-room", kind: "user", text: "I'd like to change my hotel room" },
      {
        id: "s2-order-found",
        kind: "ai",
        text: "I found your booking: Grand Hyatt Shanghai, Apr 27-29, Order H98765432. Would you like to cancel?"
      },
      { id: "s2-upgrade-request", kind: "user", text: "No I don't want to cancel, I want to upgrade to a suite", unprocessed: true },
      { id: "s2-ai-unable", kind: "ai", text: "I can help you with cancellation or check your booking status." },
      {
        id: "s2-pricing-request",
        kind: "user",
        text: "That's not what I need, I want to know if I can upgrade and how much it costs",
        unprocessed: true
      },
      { id: "s2-frustrated-help", kind: "user", text: "Can anyone help me with this?", unprocessed: true }
    ],
    quickChips: ["Cancel confirmed", "Processing now", "Need more info", "Escalate"],
    requestHeadline: "Room Upgrade Inquiry",
    requestSubtext: "User wants to upgrade to suite — AI unable to process",
    recommendedAction: "Verify upgrade availability manually",
    confidence: { label: "Low", color: "red" },
    keyFacts: [
      { label: "Task", value: "Room Upgrade Inquiry", targetMessageId: "s2-upgrade-request" },
      { label: "Order", value: "H98765432", targetMessageId: "s2-order-found" },
      { label: "Status", value: "Unresolved", targetMessageId: "s2-ai-unable" }
    ],
    potentialIssues: [
      { text: "AI unable to process request — full manual handling required", targetMessageId: "s2-ai-unable" },
      { text: "User expressed frustration", targetMessageId: "s2-frustrated-help" }
    ],
    summaryBasis: "Partial conversation",
    quotes: [
      "I want to upgrade to a suite, not cancel.",
      "I want to know if I can upgrade and how much it costs.",
      "Can anyone help me with this?"
    ],
    signals: {
      emotion: { label: "Frustrated", color: "red" },
      attitude: { label: "AI could not help", color: "red" },
      intent: { label: "Seeking upgrade options", color: "blue" }
    },
    unprocessedCards: [
      { text: "I want to upgrade to a suite", tag: "Upgrade request" },
      { text: "I want to know if I can upgrade and how much it costs", tag: "Pricing inquiry" },
      { text: "Can anyone help me with this?", tag: "Frustration expressed" }
    ],
    steps: [
      { status: "done", text: "Order identified" },
      { status: "warning", text: "Request unrecognized" },
      { status: "pending", text: "Agent assistance needed" }
    ],
    manualHandlingNote: "This case requires manual handling. Use the chat below to assist the customer."
  },
  "3": {
    initials: "WF",
    userName: "Wang Fang",
    issue: "Order Inquiry",
    timer: "01:09",
    waitDisplay: "0m 48s",
    priorityLabel: "Standard",
    priorityHigh: false,
    orderHeader: { no: "C87654321", route: "Shanghai → Beijing", departure: "Apr 28, 14:00" },
    messages: [
      { id: "s3-status-request", kind: "user", text: "I'd like to check my order status" },
      { id: "s3-order-found", kind: "ai", text: "Found your order: Flight C87654321, Shanghai→Beijing" },
      { id: "s3-waited", kind: "user", text: "I've been waiting for 3 days already", unprocessed: true },
      { id: "s3-status-confirmed", kind: "ai", text: "Your order status is: Confirmed. Departure April 28, 14:00." },
      { id: "s3-ok-thanks", kind: "user", text: "OK thanks" }
    ],
    quickChips: ["Status shared", "Processing now", "Need more info", "Escalate"],
    requestHeadline: "Order Status Check",
    requestSubtext: "Customer needed status clarity after a long wait",
    recommendedAction: "Confirm order status and close",
    confidence: { label: "Medium", color: "orange" },
    keyFacts: [
      { label: "Task", value: "Order Status Check", targetMessageId: "s3-status-request" },
      { label: "Order", value: "C87654321", targetMessageId: "s3-order-found" },
      { label: "Status", value: "Confirmed", targetMessageId: "s3-status-confirmed" }
    ],
    potentialIssues: [
      { text: "User waited 3 days — risk of escalation", targetMessageId: "s3-waited" }
    ],
    summaryBasis: "Full conversation",
    quotes: [
      "I've been waiting for 3 days already.",
      "OK thanks."
    ],
    signals: {
      emotion: { label: "Impatient", color: "orange" },
      attitude: { label: "Neutral", color: "gray" },
      intent: { label: "Needs reassurance", color: "blue" }
    },
    unprocessedCards: [{ text: "I've been waiting for 3 days already", tag: "Waiting frustration" }],
    steps: [
      { status: "done", text: "Order identified" },
      { status: "done", text: "Rebooking reviewed" },
      { status: "done", text: "Status confirmed" },
      { status: "pending", text: "Agent processing" }
    ],
    primaryActionLabel: "Mark Resolved",
    secondaryActionLabel: "Escalate Case"
  }
};

const DEFAULT_SESSION_ID = "1";

function getChatSession(sessionId) {
  const id = sessionId && CHAT_SESSIONS[sessionId] ? sessionId : DEFAULT_SESSION_ID;
  return CHAT_SESSIONS[id];
}

function RobotLogoIcon() {
  return (
    <svg className={dash.logoIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="8" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.5" cy="13" r="1.2" fill="currentColor" />
      <circle cx="14.5" cy="13" r="1.2" fill="currentColor" />
      <path d="M9 6.5h6M12 4v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function renderHistoryMessage(msg, activeHighlightId, setMessageRef) {
  const rowClassName = `${msg.kind === "user" ? styles.historyMsgLeft : styles.historyMsgRight} ${
    activeHighlightId === msg.id ? styles.historyMessageHighlight : ""
  }`;

  if (msg.kind === "user") {
    return (
      <div key={msg.id} ref={(node) => setMessageRef(msg.id, node)} className={rowClassName}>
        <div>
          <div className={styles.historyUserBubble}>{msg.text}</div>
          {msg.unprocessed && <div className={styles.unprocessedTag}>⚠ Unprocessed</div>}
        </div>
      </div>
    );
  }
  return (
    <div key={msg.id} ref={(node) => setMessageRef(msg.id, node)} className={rowClassName}>
      <div className={styles.aiLabel}>AI</div>
      <div className={msg.kind === "aiCard" ? styles.historyAiCard : styles.historyAiBubble}>{msg.text}</div>
    </div>
  );
}

function renderAgentUserMessage(msg, i) {
  if (msg.sender === "agent") {
    return (
      <div key={i} className={styles.liveMsgRowRight}>
        <div>
          <div className={styles.liveAgentLabel}>Agent</div>
          <div className={styles.liveAgentBubble}>{msg.text}</div>
        </div>
      </div>
    );
  }
  return (
    <div key={i} className={styles.liveMsgRowLeft}>
      <div className={styles.liveUserBubble}>{msg.text}</div>
    </div>
  );
}

export function AgentChat() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const session = useMemo(() => getChatSession(sessionId), [sessionId]);

  const [replyDraft, setReplyDraft] = useState("");
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [liveMessages, setLiveMessages] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [activeHighlightId, setActiveHighlightId] = useState("");
  const messageRefs = useRef({});
  const highlightTimerRef = useRef(null);

  useEffect(() => {
    setReplyDraft("");
    setIsSummaryExpanded(true);
    setLiveMessages([]);
    setToastMessage("");
    setActiveHighlightId("");
    messageRefs.current = {};
  }, [session]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => navigate("/agent"), 2000);
    return () => window.clearTimeout(timer);
  }, [toastMessage, navigate]);

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const placeholder = `Type your reply to ${session.userName}...`;

  const handleSend = () => {
    const trimmed = replyDraft.trim();
    if (!trimmed) return;
    setLiveMessages((prev) => [...prev, { sender: "agent", text: trimmed }]);
    setReplyDraft("");
  };

  const setMessageRef = (messageId, node) => {
    if (node) {
      messageRefs.current[messageId] = node;
    } else {
      delete messageRefs.current[messageId];
    }
  };

  const focusHistoryMessage = (messageId) => {
    setIsSummaryExpanded(false);
    window.requestAnimationFrame(() => {
      const node = messageRefs.current[messageId];
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveHighlightId(messageId);
      if (highlightTimerRef.current) {
        window.clearTimeout(highlightTimerRef.current);
      }
      highlightTimerRef.current = window.setTimeout(() => {
        setActiveHighlightId("");
      }, 2000);
    });
  };

  return (
    <div className={dash.shell}>
      <aside className={dash.sidebar}>
        <div className={dash.sidebarTop}>
          <div className={dash.logo}>
            <RobotLogoIcon />
            <span>AI Support</span>
          </div>
          <div className={dash.agentBlock}>
            <div className={dash.agentAvatar} aria-hidden="true" />
            <div className={dash.agentMeta}>
              <span className={dash.agentName}>
                Agent: Sarah
                <span className={dash.onlineDot} title="Online" aria-label="Online" />
              </span>
            </div>
          </div>
          <nav className={dash.nav} aria-label="Agent navigation">
            <Link to="/agent" className={`${dash.navItem} ${styles.navItemLink}`}>
              📋 Work Queue
            </Link>
            <button type="button" className={`${dash.navItem} ${dash.navItemActive}`}>
              💬 Active Chats
            </button>
            <button type="button" className={dash.navItem}>
              📊 Statistics
            </button>
            <button type="button" className={dash.navItem}>
              ⚙️ Settings
            </button>
          </nav>
        </div>
        <button type="button" className={dash.logout}>
          Logout
        </button>
      </aside>

      <div className={dash.rightWrap}>
        <header className={styles.chatHeader}>
          <div className={styles.chatHeaderTopRow}>
            <button type="button" className={styles.backBtn} onClick={() => navigate("/agent")}>
              ← Back
            </button>
            <span className={styles.userAvatar}>{session.initials}</span>
            <h1 className={styles.userTitle}>{session.userName}</h1>
            <span className={styles.issuePill}>{session.issue}</span>
            <span className={styles.headerStatus}>
              <span className={styles.sessionDot} />
              Session Active
            </span>
            <span className={styles.timer}>{session.timer}</span>
          </div>
          <div className={styles.chatHeaderMetaRow}>
            <span>Order: {session.orderHeader.no}</span>
            <span>|</span>
            <span>{session.orderHeader.route}</span>
            <span>|</span>
            <span>{session.orderHeader.departure}</span>
            <span>|</span>
            <span>Wait: {session.waitDisplay}</span>
            <span>|</span>
            <span>
              Priority:{" "}
              <span className={session.priorityHigh ? styles.priorityBadge : styles.priorityBadgeStandard}>
                {session.priorityLabel}
              </span>
            </span>
          </div>
        </header>

        <div className={styles.mainLayout}>
          <section className={styles.chatWorkspace}>
            <div className={`${styles.summaryCard} ${!isSummaryExpanded ? styles.summaryCardCollapsed : ""}`}>
              <div className={styles.summaryCardHeader}>
                <div className={styles.summaryCardTitle}>
                  {isSummaryExpanded ? `AI Summary — ${session.userName} · ${session.issue}` : `${session.userName} · AI Summary`}
                </div>
                <button
                  type="button"
                  className={styles.summaryCollapseBtn}
                  onClick={() => setIsSummaryExpanded((prev) => !prev)}
                >
                  {isSummaryExpanded ? "▲ Collapse" : "▼ Expand"}
                </button>
              </div>

              {isSummaryExpanded && (
                <div className={styles.summaryCardBody}>
                  <section className={styles.recommendedActionSection}>
                    <div className={styles.recommendedActionTitle}>Recommended Action</div>
                    <div className={styles.recommendedActionText}>{session.recommendedAction}</div>
                    <div className={styles.confidenceRow}>
                      <span className={styles.confidenceLabel}>Confidence:</span>
                      <span className={`${styles.signalBadge} ${styles[`badge_${session.confidence.color}`]}`}>
                        {session.confidence.label}
                      </span>
                    </div>
                  </section>

                  <section className={styles.summarySection}>
                    <div className={styles.summarySectionLabel}>Key Facts</div>
                    <div className={styles.keyFactsList}>
                      {session.keyFacts.map((fact) => (
                        <div key={fact.label} className={styles.keyFactRow}>
                          <span className={styles.keyFactLabel}>{fact.label}</span>
                          <span className={styles.keyFactValue}>{fact.value}</span>
                          <button
                            type="button"
                            className={styles.jumpBtn}
                            aria-label={`Show ${fact.label} in conversation`}
                            onClick={() => focusHistoryMessage(fact.targetMessageId)}
                          >
                            →
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={styles.summarySection}>
                    <div className={styles.potentialIssuesTitle}>⚠ Potential Issues</div>
                    <div className={styles.potentialIssuesList}>
                      {session.potentialIssues.map((issue) => (
                        <div key={issue.text} className={styles.potentialIssueItem}>
                          <span>{issue.text}</span>
                          <button
                            type="button"
                            className={styles.jumpBtn}
                            aria-label="Show issue in conversation"
                            onClick={() => focusHistoryMessage(issue.targetMessageId)}
                          >
                            →
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className={styles.summaryConfidenceSection}>
                    Summary Confidence: {session.confidence.label} · Based on: {session.summaryBasis}
                  </section>

                  <section className={`${styles.summarySection} ${styles.quotesSection}`}>
                    <div className={styles.summarySectionLabel}>User's Own Words</div>
                    <div className={styles.quotesList}>
                      {session.quotes.map((quote) => (
                        <div key={quote} className={styles.quoteCard}>
                          “{quote}”
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}
            </div>

            <div className={styles.chatScroll}>
            <div className={styles.liveMessagesArea}>
              <div className={styles.liveMessagesInner}>
                {session.messages.map((msg) => renderHistoryMessage(msg, activeHighlightId, setMessageRef))}
                <div className={styles.sessionStartDivider}>— Transferred to human agent —</div>
                {liveMessages.length === 0 ? (
                  <div className={styles.emptyState}>No messages yet. Start the conversation below.</div>
                ) : (
                  liveMessages.map((msg, i) => renderAgentUserMessage(msg, i))
                )}
              </div>
            </div>
            </div>

            <div className={styles.inputBar}>
              <div className={styles.chipsRow}>
                {session.quickChips.map((label) => (
                  <button key={label} type="button" className={styles.quickChip} onClick={() => setReplyDraft(label)}>
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.replyInputRow}>
                <input
                  type="text"
                  className={styles.replyInput}
                  placeholder={placeholder}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <button type="button" className={styles.sendBtn} onClick={handleSend}>
                  Send
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {toastMessage && (
        <div className={styles.toast} role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
