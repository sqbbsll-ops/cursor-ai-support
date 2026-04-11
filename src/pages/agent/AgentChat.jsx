import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dash from "./AgentDashboard.module.css";
import styles from "./AgentChat.module.css";

/** @typedef {{ kind: 'user' | 'ai' | 'aiCard', text: string, unprocessed?: boolean }} HistoryMsg */

/** @typedef {{ text: string, tag: string }} UnprocessedCard */

/** @typedef {{ done: boolean, text: string }} StepItem */

/** @typedef {{ key: string, value: string, highlight?: boolean }} RequestLine */

/**
 * @typedef {{
 *   userName: string;
 *   issue: string;
 *   waitDisplay: string;
 *   priority: { variant: 'high' | 'standard'; label: string };
 *   messages: HistoryMsg[];
 *   orderLines: { key: string; value: string }[];
 *   requestLines: RequestLine[];
 *   unprocessedCards: UnprocessedCard[];
 *   steps: StepItem[];
 *   primaryAction: string;
 *   secondaryAction: string;
 *   quickChips: string[];
 * }} ChatSessionData
 */

/** @type {Record<string, ChatSessionData>} */
const CHAT_SESSIONS = {
  "1": {
    userName: "Zhang Wei",
    issue: "Flight Refund",
    waitDisplay: "3m 42s",
    priority: { variant: "high", label: "High" },
    messages: [
      { kind: "user", text: "I'd like to cancel my flight" },
      {
        kind: "ai",
        text: "Got it! Let me look up your recent bookings. One moment please..."
      },
      {
        kind: "aiCard",
        text: "Flight found: Shanghai (PVG) → Beijing (PEK), Apr 28 14:00, Order C12345678"
      },
      {
        kind: "user",
        text: "Actually I'm in a bit of a rush, I need this done today",
        unprocessed: true
      },
      {
        kind: "user",
        text: "I tried calling yesterday but no one picked up",
        unprocessed: true
      },
      {
        kind: "ai",
        text: "Would you like to apply for a refund or explore rebooking options?"
      },
      { kind: "user", text: "Let's do rebooking first" },
      {
        kind: "ai",
        text: "Rebooking fee: CNY 120. Next available: Apr 28 18:00."
      },
      { kind: "user", text: "Actually just refund please" },
      {
        kind: "ai",
        text: "Refund amount: CNY 680, processing fee CNY 50, timeline 3-5 business days."
      },
      { kind: "user", text: "OK confirmed" }
    ],
    orderLines: [
      { key: "Order No.", value: "C12345678" },
      { key: "Route", value: "Shanghai → Beijing" },
      { key: "Departure", value: "April 28, 14:00" }
    ],
    requestLines: [
      { key: "Final Need", value: "Refund Application", highlight: true },
      { key: "Also Checked", value: "Rebooking options" },
      { key: "Decision", value: "Confirmed refund" }
    ],
    unprocessedCards: [
      { text: "I'm in a bit of a rush, I need this done today", tag: "Urgency expressed" },
      { text: "I tried calling yesterday but no one picked up", tag: "Previous contact attempt" }
    ],
    steps: [
      { done: true, text: "Order identified" },
      { done: true, text: "Rebooking options reviewed" },
      { done: true, text: "Switched to refund" },
      { done: true, text: "Refund policy confirmed" },
      { done: false, text: "Process refund (pending)" }
    ],
    primaryAction: "Confirm Refund",
    secondaryAction: "Escalate Case",
    quickChips: ["Refund confirmed", "Need more info", "Processing now"]
  },
  "2": {
    userName: "Li Ming",
    issue: "Hotel Cancellation",
    waitDisplay: "1m 15s",
    priority: { variant: "standard", label: "Standard" },
    messages: [
      { kind: "user", text: "I'd like to cancel my hotel booking" },
      {
        kind: "ai",
        text: "Found your booking: Grand Hyatt Shanghai, Apr 27-29, Order H98765432"
      },
      {
        kind: "user",
        text: "The hotel was really bad last time too",
        unprocessed: true
      },
      {
        kind: "ai",
        text: "Would you like to confirm the cancellation?"
      },
      {
        kind: "user",
        text: "Can you make sure I get a full refund?",
        unprocessed: true
      },
      { kind: "user", text: "Yes confirm cancellation" },
      {
        kind: "ai",
        text: "Cancellation confirmed. Refund: CNY 1,200, timeline 3-5 business days."
      }
    ],
    orderLines: [
      { key: "Order No.", value: "H98765432" },
      { key: "Hotel", value: "Grand Hyatt Shanghai" },
      { key: "Stay", value: "Apr 27–29" }
    ],
    requestLines: [{ key: "Final Need", value: "Hotel Cancellation", highlight: true }],
    unprocessedCards: [
      { text: "The hotel was really bad last time too", tag: "Previous bad experience" },
      { text: "Can you make sure I get a full refund?", tag: "Specific refund request" }
    ],
    steps: [
      { done: true, text: "Order identified" },
      { done: true, text: "Cancellation confirmed" },
      { done: false, text: "Process refund (pending)" }
    ],
    primaryAction: "Confirm Cancellation",
    secondaryAction: "Escalate Case",
    quickChips: ["Refund confirmed", "Need more info", "Processing now"]
  },
  "3": {
    userName: "Wang Fang",
    issue: "Order Inquiry",
    waitDisplay: "0m 48s",
    priority: { variant: "standard", label: "Standard" },
    messages: [
      { kind: "user", text: "I'd like to check my order status" },
      {
        kind: "ai",
        text: "Found your order: Flight C87654321, Shanghai→Beijing"
      },
      {
        kind: "user",
        text: "I've been waiting for 3 days already",
        unprocessed: true
      },
      {
        kind: "ai",
        text: "Your order status is: Confirmed. Departure April 28, 14:00."
      },
      { kind: "user", text: "OK thanks" }
    ],
    orderLines: [
      { key: "Order No.", value: "C87654321" },
      { key: "Route", value: "Shanghai → Beijing" }
    ],
    requestLines: [{ key: "Final Need", value: "Order Status Check", highlight: true }],
    unprocessedCards: [
      { text: "I've been waiting for 3 days already", tag: "Waiting frustration" }
    ],
    steps: [
      { done: true, text: "Order identified" },
      { done: true, text: "Status checked" },
      { done: false, text: "Follow up (pending)" }
    ],
    primaryAction: "Mark Resolved",
    secondaryAction: "Escalate Case",
    quickChips: ["Thanks sent", "Need follow-up", "Closing chat"]
  }
};

const DEFAULT_SESSION_ID = "1";

function getChatSession(sessionId) {
  const id = sessionId && CHAT_SESSIONS[sessionId] ? sessionId : DEFAULT_SESSION_ID;
  return { id, data: CHAT_SESSIONS[id] };
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

function renderHistoryMessage(msg, i) {
  if (msg.kind === "user") {
    return (
      <div key={i} className={styles.msgBlock}>
        <div className={styles.msgRowUser}>
          <div>
            <div className={styles.userBubble}>{msg.text}</div>
            {msg.unprocessed && <div className={styles.unprocessedTag}>⚠ Unprocessed by AI</div>}
          </div>
        </div>
      </div>
    );
  }
  if (msg.kind === "ai") {
    return (
      <div key={i} className={styles.msgBlock}>
        <div className={styles.msgRowAi}>
          <span className={styles.aiLabel}>AI</span>
          <div className={styles.aiBubble}>{msg.text}</div>
        </div>
      </div>
    );
  }
  if (msg.kind === "aiCard") {
    return (
      <div key={i} className={styles.msgBlock}>
        <div className={styles.msgRowAi}>
          <span className={styles.aiLabel}>AI</span>
          <div className={styles.bookingCard}>{msg.text}</div>
        </div>
      </div>
    );
  }
  return null;
}

export function AgentChat() {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const [replyDraft, setReplyDraft] = useState("");

  const { data: session } = useMemo(() => getChatSession(sessionId), [sessionId]);

  const placeholder = `Type your reply to ${session.userName}...`;

  const priorityClass =
    session.priority.variant === "high" ? styles.priorityBadge : styles.priorityBadgeStandard;

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
          <div className={styles.chatHeaderLeft}>
            <button type="button" className={styles.backBtn} aria-label="Back to queue" onClick={() => navigate("/agent")}>
              ←
            </button>
            <h1 className={styles.userTitle}>{session.userName}</h1>
            <span className={styles.issuePill}>{session.issue}</span>
          </div>
          <div className={styles.chatHeaderCenter}>
            <span className={styles.sessionDot} aria-hidden="true" />
            Session Active
          </div>
          <div className={styles.chatHeaderRight}>
            <button type="button" className={styles.closeSessionBtn} onClick={() => navigate("/agent")}>
              Close Session
            </button>
            <span className={styles.timer} aria-label="Session timer">
              04:23
            </span>
          </div>
        </header>

        <div className={styles.mainColumns}>
          <section className={styles.colHistory} aria-label="Full conversation">
            <div className={styles.columnHeader}>
              <h2 className={styles.columnTitle}>Full Conversation</h2>
              <p className={styles.columnSubtitle}>All messages including unprocessed</p>
            </div>

            <div className={styles.historyScroll}>
              {session.messages.map((m, i) => renderHistoryMessage(m, i))}
              <div className={styles.systemDivider}>
                <span className={styles.systemDividerLine} aria-hidden="true" />
                <span>— Transferred to human agent —</span>
                <span className={styles.systemDividerLine} aria-hidden="true" />
              </div>
            </div>

            <div className={styles.historyFooter}>
              <div className={styles.replyInputRow}>
                <input
                  type="text"
                  className={styles.replyInput}
                  placeholder={placeholder}
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  aria-label={placeholder}
                />
                <button type="button" className={styles.sendBtn}>
                  Send
                </button>
              </div>
              <div className={styles.chipsRow}>
                {session.quickChips.map((label) => (
                  <button key={label} type="button" className={styles.quickChip} onClick={() => setReplyDraft(label)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className={styles.colSummary} aria-label="AI summary">
            <div className={`${styles.columnHeader} ${styles.columnHeaderSummary}`}>
              <h2 className={`${styles.columnTitle} ${styles.columnTitleBlue}`}>AI Summary</h2>
              <p className={styles.columnSubtitle}>Auto-generated</p>
            </div>

            <div className={styles.summaryScroll}>
              <div className={styles.summarySection}>
                <div className={styles.summarySectionLabel}>Customer</div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Name:</span> {session.userName}
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Wait time:</span> {session.waitDisplay}
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryKey}>Priority:</span>{" "}
                  <span className={priorityClass}>{session.priority.label}</span>
                </div>
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summarySectionLabel}>Order Identified</div>
                {session.orderLines.map((line) => (
                  <div key={line.key} className={styles.summaryRow}>
                    <span className={styles.summaryKey}>{line.key}:</span> {line.value}
                  </div>
                ))}
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summarySectionLabel}>Request</div>
                {session.requestLines.map((line) => (
                  <div key={line.key} className={styles.summaryRow}>
                    <span className={styles.summaryKey}>{line.key}:</span>{" "}
                    {line.highlight ? <span className={styles.valBlue}>{line.value}</span> : line.value}
                  </div>
                ))}
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summarySectionTitleOrange}>⚠ Unprocessed Messages</div>
                {session.unprocessedCards.map((card) => (
                  <div key={card.text} className={styles.unprocessedCard}>
                    <p className={styles.unprocessedCardText}>{card.text}</p>
                    <span className={styles.unprocessedCardTag}>{card.tag}</span>
                  </div>
                ))}
                <p className={styles.summaryNote}>These messages were not handled by AI. Please address them.</p>
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summarySectionLabel}>Steps Completed</div>
                <ul className={styles.stepsList}>
                  {session.steps.map((step) => (
                    <li key={step.text} className={step.done ? styles.stepDone : styles.stepPending}>
                      {step.done ? "✓" : "○"} {step.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.summarySection}>
                <div className={styles.summarySectionLabel}>Actions</div>
                <div className={styles.actionsBlock}>
                  <button type="button" className={styles.actionPrimary}>
                    {session.primaryAction}
                  </button>
                  <button type="button" className={styles.actionSecondary}>
                    {session.secondaryAction}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
