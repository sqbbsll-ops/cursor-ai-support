import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import dash from "./AgentDashboard.module.css";
import styles from "./AgentChat.module.css";

/** @typedef {{ kind: 'user' | 'ai' | 'aiCard', text: string, unprocessed?: boolean }} HistoryMsg */
/** @typedef {{ text: string, tag: string }} UnprocessedCard */
/** @typedef {{ status: 'done' | 'warning' | 'pending', text: string }} StepItem */
/** @typedef {{ key: string, value: string }} OrderLine */

/**
 * @typedef {
 *   | {
 *       variant: 'refund';
 *       amountLabel: string;
 *       amountValue: string;
 *       lines: { key: string; value: string }[];
 *     }
 *   | {
 *       variant: 'estimate';
 *       note: string;
 *     }
 * } FinancialDetails
 */

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
 *   financial?: FinancialDetails;
 *   unprocessedCards: UnprocessedCard[];
 *   steps: StepItem[];
 *   primaryActionLabel?: string;
 *   secondaryActionLabel?: string;
 *   manualHandlingNote?: string;
 *   hasExecutionCheckbox?: boolean;
 *   executionPendingLabel?: string;
 *   executionDoneLabel?: string;
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
      { kind: "user", text: "I'd like to cancel my flight" },
      { kind: "ai", text: "Got it! Let me look up your recent bookings. One moment please..." },
      {
        kind: "aiCard",
        text: "Flight found: Shanghai (PVG) → Beijing (PEK), Apr 28 14:00, Order C12345678"
      },
      { kind: "user", text: "Actually I'm in a bit of a rush, I need this done today", unprocessed: true },
      { kind: "user", text: "I tried calling yesterday but no one picked up", unprocessed: true },
      { kind: "ai", text: "Would you like to apply for a refund or explore rebooking options?" },
      { kind: "user", text: "Let's do rebooking first" },
      { kind: "ai", text: "Rebooking fee: CNY 120. Next available: Apr 28 18:00." },
      { kind: "user", text: "Actually just refund please" },
      { kind: "ai", text: "Refund amount: CNY 680, processing fee CNY 50, timeline 3-5 business days." },
      { kind: "user", text: "OK confirmed" }
    ],
    quickChips: ["Refund confirmed", "Processing now", "Need more info", "Escalate"],
    requestHeadline: "Refund Application",
    requestSubtext: "Checked rebooking first → confirmed refund",
    financial: {
      variant: "refund",
      amountLabel: "Refund Amount",
      amountValue: "CNY 680",
      lines: [
        { key: "Processing Fee", value: "CNY 50" },
        { key: "Timeline", value: "3-5 business days" },
        { key: "Payment method", value: "Original payment" }
      ]
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
    secondaryActionLabel: "Escalate Case",
    hasExecutionCheckbox: true,
    executionPendingLabel: "Mark as executed — confirm refund has been processed",
    executionDoneLabel: "Refund executed and confirmed"
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
      { kind: "user", text: "I'd like to change my hotel room" },
      {
        kind: "ai",
        text: "I found your booking: Grand Hyatt Shanghai, Apr 27-29, Order H98765432. Would you like to cancel?"
      },
      { kind: "user", text: "No I don't want to cancel, I want to upgrade to a suite", unprocessed: true },
      { kind: "ai", text: "I can help you with cancellation or check your booking status." },
      {
        kind: "user",
        text: "That's not what I need, I want to know if I can upgrade and how much it costs",
        unprocessed: true
      },
      { kind: "user", text: "Can anyone help me with this?", unprocessed: true }
    ],
    quickChips: ["Cancel confirmed", "Processing now", "Need more info", "Escalate"],
    requestHeadline: "Room Upgrade Inquiry",
    requestSubtext: "User wants to upgrade to suite — AI unable to process",
    financial: {
      variant: "estimate",
      note: "Estimated upgrade cost: To be confirmed"
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
      { kind: "user", text: "I'd like to check my order status" },
      { kind: "ai", text: "Found your order: Flight C87654321, Shanghai→Beijing" },
      { kind: "user", text: "I've been waiting for 3 days already", unprocessed: true },
      { kind: "ai", text: "Your order status is: Confirmed. Departure April 28, 14:00." },
      { kind: "user", text: "OK thanks" }
    ],
    quickChips: ["Status shared", "Processing now", "Need more info", "Escalate"],
    requestHeadline: "Order Status Check",
    requestSubtext: "Customer needed status clarity after a long wait",
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

function renderHistoryMessage(msg, i) {
  if (msg.kind === "user") {
    return (
      <div key={i} className={styles.historyMsgLeft}>
        <div>
          <div className={styles.historyUserBubble}>{msg.text}</div>
          {msg.unprocessed && <div className={styles.unprocessedTag}>⚠ Unprocessed</div>}
        </div>
      </div>
    );
  }
  return (
    <div key={i} className={styles.historyMsgRight}>
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
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(true);
  const [liveMessages, setLiveMessages] = useState([]);
  const [toastMessage, setToastMessage] = useState("");
  const [isExecuted, setIsExecuted] = useState(false);

  useEffect(() => {
    setReplyDraft("");
    setIsHistoryOpen(false);
    setIsSummaryExpanded(true);
    setLiveMessages([]);
    setToastMessage("");
    setIsExecuted(false);
  }, [session]);

  useEffect(() => {
    if (!toastMessage) return undefined;
    const timer = window.setTimeout(() => navigate("/agent"), 2000);
    return () => window.clearTimeout(timer);
  }, [toastMessage, navigate]);

  const placeholder = `Type your reply to ${session.userName}...`;

  const handleSend = () => {
    const trimmed = replyDraft.trim();
    if (!trimmed) return;
    setLiveMessages((prev) => [...prev, { sender: "agent", text: trimmed }]);
    setReplyDraft("");
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
            <Link to="/agent/history" className={`${dash.navItem} ${styles.navItemLink}`}>
              🕐 History
            </Link>
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
          <section className={`${styles.chatWorkspace} ${isHistoryOpen ? styles.chatWorkspaceWithHistory : styles.chatWorkspaceFull}`}>
            <div className={styles.summaryCard}>
              <div className={styles.summaryCardHeader}>
                <div className={styles.summaryCardTitle}>AI Summary — {session.userName} · {session.issue}</div>
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
                  <section className={styles.summarySection}>
                    <div className={styles.summarySectionLabel}>Customer Request</div>
                    <div className={styles.requestHeadline}>{session.requestHeadline}</div>
                    <div className={styles.requestSubtext}>{session.requestSubtext}</div>
                  </section>

                  {session.financial && (
                    <section className={styles.summarySection}>
                      <div className={styles.summarySectionLabel}>
                        {session.financial.variant === "refund" ? "Refund Details" : "Cost Estimate"}
                      </div>
                      <div className={styles.financialBox}>
                        {session.financial.variant === "refund" ? (
                          <>
                            <div className={styles.financialAmountRow}>
                              <span className={styles.financialAmountLabel}>
                                {session.financial.amountLabel}
                              </span>
                              <span className={styles.financialAmountValue}>
                                {session.financial.amountValue}
                              </span>
                            </div>
                            <ul className={styles.financialLines}>
                              {session.financial.lines.map((line) => (
                                <li key={line.key} className={styles.financialLine}>
                                  <span className={styles.financialLineKey}>{line.key}:</span>
                                  <span className={styles.financialLineValue}>{line.value}</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <div className={styles.financialEstimate}>{session.financial.note}</div>
                        )}
                      </div>
                    </section>
                  )}

                  <section className={`${styles.summarySection} ${styles.attentionSection}`}>
                    <div className={styles.attentionTitle}>⚠ Needs Your Attention</div>
                    {session.unprocessedCards.map((card) => (
                      <div key={card.text} className={styles.attentionItem}>
                        <p className={styles.attentionText}>{card.text}</p>
                        <span className={styles.unprocessedCardTag}>{card.tag}</span>
                      </div>
                    ))}
                    <p className={styles.summaryNote}>
                      {session.manualHandlingNote
                        ? "AI could not handle this request — manual assistance required"
                        : "Not handled by AI — please address directly"}
                    </p>
                  </section>

                  <section className={styles.summarySection}>
                    <div className={styles.summarySectionLabel}>Progress</div>
                    <div className={styles.horizontalStepper}>
                      {session.steps.map((step, index) => (
                        <div key={step.text} className={styles.stepItemInline}>
                          <span
                            className={
                              step.status === "done"
                                ? styles.stepDone
                                : step.status === "warning"
                                ? styles.stepWarning
                                : styles.stepCurrent
                            }
                          >
                            {step.status === "done" ? "✅" : step.status === "warning" ? "⚠" : "⏳"} {step.text}
                          </span>
                          {index < session.steps.length - 1 && <span className={styles.stepArrow}>→</span>}
                        </div>
                      ))}
                    </div>
                  </section>

                  {session.manualHandlingNote ? (
                    <p className={styles.manualHandlingNote}>{session.manualHandlingNote}</p>
                  ) : (
                    <>
                      <div className={styles.summaryActionRow}>
                        <button
                          type="button"
                          className={styles.actionPrimary}
                          onClick={() => setToastMessage("Refund confirmed. Case closed.")}
                        >
                          {session.primaryActionLabel}
                        </button>
                        <button type="button" className={styles.actionSecondary}>
                          {session.secondaryActionLabel}
                        </button>
                      </div>

                      {session.hasExecutionCheckbox && (
                        <button
                          type="button"
                          className={`${styles.executionToggle} ${isExecuted ? styles.executionToggleDone : ""}`}
                          onClick={() => setIsExecuted((prev) => !prev)}
                          aria-pressed={isExecuted}
                        >
                          <span className={styles.executionCheckbox} aria-hidden="true">
                            {isExecuted ? "✓" : ""}
                          </span>
                          <span className={styles.executionLabel}>
                            {isExecuted
                              ? `✓ ${session.executionDoneLabel}`
                              : session.executionPendingLabel}
                          </span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className={styles.liveMessagesArea}>
              <div className={styles.liveMessagesScroll}>
                <div className={styles.sessionStartDivider}>— Session started — Human agent connected —</div>
                {liveMessages.length === 0 ? (
                  <div className={styles.emptyState}>No messages yet. Start the conversation below.</div>
                ) : (
                  liveMessages.map((msg, i) => renderAgentUserMessage(msg, i))
                )}
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

          <aside className={`${styles.historyPanel} ${isHistoryOpen ? styles.historyPanelOpen : styles.historyPanelClosed}`}>
            {isHistoryOpen ? (
              <>
                <div className={styles.historyHeader}>
                  <div>
                    <h3 className={styles.historyTitle}>Chat History</h3>
                    <p className={styles.historySubtitle}>AI & User conversation</p>
                  </div>
                  <button type="button" className={styles.historyCollapseBtn} onClick={() => setIsHistoryOpen(false)}>
                    ›
                  </button>
                </div>
                <div className={styles.historyScroll}>
                  {session.messages.map((msg, i) => renderHistoryMessage(msg, i))}
                  <div className={styles.historyTransferDivider}>— Transferred to human agent —</div>
                </div>
              </>
            ) : (
              <button type="button" className={styles.historyCollapsedTab} onClick={() => setIsHistoryOpen(true)}>
                Chat History
              </button>
            )}
          </aside>
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
