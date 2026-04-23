import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import appStyles from "../App.module.css";
import styles from "./Page5.module.css";
import { TopNav } from "../components/TopNav.jsx";
import {
  DEFAULT_REQUEST_SUMMARY_TEXT,
  MOCK_FLIGHT_BOOKING_ORDER
} from "../chatConstants.js";

function CardHeaderCheck() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="#52C41A" />
      <path d="M5 9l2.5 2.5L13 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Page5Waiting() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = location.state || {};
  const incomingStateRef = useRef(incomingState);
  incomingStateRef.current = location.state || {};
  const userSummary = incomingState.userSummary || DEFAULT_REQUEST_SUMMARY_TEXT;

  const [phase, setPhase] = useState(1);
  const [paragraphVisible, setParagraphVisible] = useState(false);
  const [progressActive, setProgressActive] = useState(false);
  const [showConnectingLine, setShowConnectingLine] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteConfirmed, setNoteConfirmed] = useState(false);
  const frameRef = useRef(null);
  const agentNoteRef = useRef(null);

  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const navSubtitle = useMemo(() => {
    if (showConnectingLine) return "Connecting you now...";
    if (phase >= 3) return "Human agent is ready";
    if (phase >= 2) return "Information synced successfully";
    return "Transfer in progress...";
  }, [phase, showConnectingLine]);

  useEffect(() => {
    const t = setTimeout(() => setPhase(2), 2000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== 2) return;
    setParagraphVisible(false);
    const t = setTimeout(() => setParagraphVisible(true), 250);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    const t = setTimeout(() => setPhase(3), 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase < 3) return;
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgressActive(true));
    });
    return () => cancelAnimationFrame(id);
  }, [phase]);

  useEffect(() => {
    const tConnect = setTimeout(() => setShowConnectingLine(true), 6500);
    const tNav = setTimeout(() => {
      navigate("/page6", {
        state: {
          ...(incomingStateRef.current || {}),
          userSummary,
          agentNote: agentNoteRef.current,
          page5CompletedAt: Date.now()
        }
      });
    }, 7000);
    return () => {
      clearTimeout(tConnect);
      clearTimeout(tNav);
    };
  }, [navigate, userSummary]);

  const handleSendNote = () => {
    const t = noteDraft.trim().slice(0, 200);
    agentNoteRef.current = t || null;
    setNoteConfirmed(true);
    setNoteOpen(false);
  };

  const handleCancelTransfer = () => {
    navigate("/page3", {
      state: {
        choice: "refund",
        orderInfo: incomingState.orderInfo ?? MOCK_FLIGHT_BOOKING_ORDER
      }
    });
  };

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    navigate("/page6", {
      state: {
        ...incomingState,
        userSummary,
        message: text,
        agentNote: agentNoteRef.current,
        page5CompletedAt: Date.now()
      }
    });
    setInputValue("");
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className={appStyles.appShell}>
      <section ref={frameRef} className={appStyles.mobileFrame}>
        <TopNav variant="chat" subtitle={navSubtitle} onBack={() => navigate(-1)} />

        <div className={styles.mainScroll}>
          <div className={styles.hero}>
            <div className={styles.heroIconWrap}>
              {phase === 1 ? (
                <div className={styles.spinner} aria-hidden="true" />
              ) : (
                <svg className={styles.checkSvg} viewBox="0 0 48 48" aria-hidden="true">
                  <circle className={styles.animCircle} cx="24" cy="24" r="22" />
                  <path className={styles.animCheckPath} d="M15 24 L22 31 L36 14" />
                </svg>
              )}
            </div>

            <h2 className={`${styles.heroTitle} ${phase >= 2 ? styles.heroTitleGreen : ""}`}>
              {phase === 1 ? "Transferring to Human Agent" : "Information Synced Successfully"}
            </h2>
            <p className={styles.heroSubtitle}>
              {phase === 1
                ? "Please wait while we connect you..."
                : "Your session summary has been shared with the human agent."}
            </p>
            {showConnectingLine && <p className={styles.connectingLine}>Connecting you now...</p>}
          </div>

          {phase >= 2 && (
            <div className={styles.syncCard}>
              <div className={styles.syncCardHeader}>
                <h3 className={styles.syncCardTitle}>Your summary has been shared with the agent:</h3>
                <CardHeaderCheck />
              </div>
              <p
                style={{
                  margin: "12px 0 0",
                  padding: "12px",
                  background: "#FAFAFA",
                  borderRadius: "8px",
                  fontSize: "15px",
                  lineHeight: 1.6,
                  color: "#1f1f1f",
                  whiteSpace: "pre-wrap",
                  opacity: paragraphVisible ? 1 : 0,
                  transition: "opacity 0.4s ease"
                }}
              >
                {userSummary}
              </p>
              <p className={styles.syncCardFooter}>
                The human agent has received your summary. You will not need to repeat yourself.
              </p>
            </div>
          )}

          {phase >= 3 && (
            <>
              <div className={styles.agentReadySection}>
                <div className={styles.agentReadyRow}>
                  <span className={styles.pulseDotGreen} aria-hidden="true" />
                  <span>Human agent is ready</span>
                </div>
                <div className={styles.waitInfo}>
                  <span>Queue position: 1</span>
                  <span>Estimated wait: ~1 min</span>
                </div>
              </div>

              <div className={styles.queueBar}>
                <div className={styles.queueRow}>
                  <span className={styles.queueKey}>Current Status</span>
                  <span className={`${styles.queueVal} ${styles.queueValGreen}`}>Agent ready to connect</span>
                </div>
                <div className={styles.queueRow}>
                  <span className={styles.queueKey}>Queue Position</span>
                  <span className={styles.queueVal}>1st in line</span>
                </div>
                <div className={styles.queueRow}>
                  <span className={styles.queueKey}>Estimated Wait</span>
                  <span className={styles.queueVal}>Less than 1 minute</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={`${styles.progressFill} ${progressActive ? styles.progressFillActive : ""}`} />
                </div>
              </div>

              <div
                style={{
                  padding: "8px 16px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "100%",
                  boxSizing: "border-box"
                }}
              >
                {!noteConfirmed ? (
                  <>
                    {!noteOpen ? (
                      <button
                        type="button"
                        className={styles.btnNote}
                        style={{ width: "100%" }}
                        onClick={() => setNoteOpen(true)}
                      >
                        Add a Note for the Agent
                      </button>
                    ) : (
                      <div className={styles.notePanel}>
                        <textarea
                          className={styles.noteTextarea}
                          maxLength={200}
                          value={noteDraft}
                          onChange={(e) => setNoteDraft(e.target.value)}
                          placeholder="Type a note for the agent..."
                          aria-label="Note for agent"
                        />
                        <div className={styles.noteMeta}>
                          <span>{noteDraft.length}/200</span>
                        </div>
                        <button type="button" className={styles.btnSendNote} style={{ width: "100%" }} onClick={handleSendNote}>
                          Send Note
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <p className={styles.noteDone}>Note added. The agent will see this.</p>
                )}
                <button type="button" className={styles.btnCancel} style={{ width: "100%" }} onClick={handleCancelTransfer}>
                  Cancel Transfer
                </button>
              </div>
            </>
          )}
        </div>

        <footer className={appStyles.bottomSection}>
          <div className={appStyles.inputBar}>
            <button type="button" className={appStyles.micButton} aria-label="Use microphone">
              <svg viewBox="0 0 24 24" className={appStyles.micIcon} xmlns="http://www.w3.org/2000/svg">
                <rect x="9" y="3.5" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" fill="none" />
                <path d="M6.5 11.5C6.5 14.5 8.8 16.7 12 16.7C15.2 16.7 17.5 14.5 17.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M12 16.8V20.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <input
              type="text"
              className={appStyles.inputField}
              placeholder="Type your question here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={onInputKeyDown}
            />
            <button type="button" className={appStyles.sendButton} aria-label="Send message" onClick={handleSubmit} disabled={!canSend}>
              <svg viewBox="0 0 24 24" className={appStyles.sendIcon} xmlns="http://www.w3.org/2000/svg">
                <path d="M4 11.5L20 4L13.5 20L11.2 13.8L4 11.5Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
