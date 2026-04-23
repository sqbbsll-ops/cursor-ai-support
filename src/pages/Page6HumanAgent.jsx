import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import appStyles from "../App.module.css";
import styles from "./Page6.module.css";
import { TopNav } from "../components/TopNav.jsx";

const MSG_HUMAN_1 =
  "Hello! I've reviewed your summary: you were looking to cancel your Shanghai-Beijing flight and confirmed a refund of CNY 680. I also see you mentioned you were in a rush — I'll make sure we get this sorted quickly for you. Shall we proceed?";

const MSG_HUMAN_3 = `Perfect. I have your order details here. Let me confirm the refund amount for you.

For order C12345678, the refund breakdown is:

Ticket price:     CNY 730
Processing fee:   CNY 50
Refund amount:    CNY 680

The refund will be processed to your original payment method within 3-5 business days. Shall I proceed?`;

const MSG_HUMAN_6 = `Your refund application has been submitted successfully.

Reference No.:    R20240428001
Refund amount:    CNY 680
Timeline:         3-5 business days

You will receive a confirmation email shortly. Is there anything else I can help you with?`;

const FINAL_SYSTEM =
  "Thank you for using our service. Your case has been resolved. Have a great day!";

function HumanAgentAvatar() {
  return (
    <div className={styles.humanAvatar} aria-hidden="true">
      <svg className={styles.humanAvatarIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 12a3 3 0 100-6 3 3 0 000 6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M5.5 19.5c1.2-3 3.6-4.5 6.5-4.5s5.3 1.5 6.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path d="M5 9v2M19 9v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path
          d="M8 7c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function UserTypingBubble() {
  return (
    <div className={styles.typingRowUser}>
      <div className={styles.typingBubble} aria-hidden="true">
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
        <span className={styles.typingDot} />
      </div>
    </div>
  );
}

function HumanTypingRow() {
  return (
    <div className={styles.humanRow}>
      <HumanAgentAvatar />
      <div className={styles.humanCol}>
        <span className={styles.humanAgentLabel}>Human Agent</span>
        <div className={styles.typingBubble} style={{ borderTopLeftRadius: 8 }} aria-hidden="true">
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
          <span className={styles.typingDot} />
        </div>
      </div>
    </div>
  );
}

function HumanMessageBlock({ children, footer = null }) {
  return (
    <div className={styles.humanRow}>
      <HumanAgentAvatar />
      <div className={styles.humanCol}>
        <span className={styles.humanAgentLabel}>Human Agent</span>
        <div className={styles.humanBubbleStack}>
          <div className={styles.humanBubble}>{children}</div>
        </div>
        {footer}
      </div>
    </div>
  );
}

export function Page6HumanAgent() {
  const navigate = useNavigate();

  const [showUserTyping1, setShowUserTyping1] = useState(true);
  const [showUser2, setShowUser2] = useState(false);
  const [showHumanTyping2, setShowHumanTyping2] = useState(false);
  const [showHuman3, setShowHuman3] = useState(false);
  const [showProceedChoices, setShowProceedChoices] = useState(false);
  const [branch, setBranch] = useState(null);
  const [showUser5, setShowUser5] = useState(false);
  const [showUserQuestion, setShowUserQuestion] = useState(false);
  const [showHumanTyping3, setShowHumanTyping3] = useState(false);
  const [showHuman6, setShowHuman6] = useState(false);
  const [showFinalSystem, setShowFinalSystem] = useState(false);
  const [extraUserLines, setExtraUserLines] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const frameRef = useRef(null);
  const bottomRef = useRef(null);

  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  useEffect(() => {
    const t = setTimeout(() => {
      setShowUserTyping1(false);
      setShowUser2(true);
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!showUser2) return;
    setShowHumanTyping2(true);
    const t = setTimeout(() => {
      setShowHumanTyping2(false);
      setShowHuman3(true);
      setShowProceedChoices(true);
    }, 800);
    return () => clearTimeout(t);
  }, [showUser2]);

  useEffect(() => {
    if (!showUser5) return;
    setShowHumanTyping3(true);
    const t = setTimeout(() => {
      setShowHumanTyping3(false);
      setShowHuman6(true);
    }, 800);
    return () => clearTimeout(t);
  }, [showUser5]);

  useEffect(() => {
    if (!showFinalSystem) return;
    const t = setTimeout(() => navigate("/"), 2000);
    return () => clearTimeout(t);
  }, [showFinalSystem, navigate]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [
    showUserTyping1,
    showUser2,
    showHumanTyping2,
    showHuman3,
    branch,
    showUser5,
    showUserQuestion,
    showHumanTyping3,
    showHuman6,
    showFinalSystem,
    extraUserLines
  ]);

  const handleYesProceed = () => {
    if (branch) return;
    setBranch("yes");
    setShowProceedChoices(false);
    setShowUser5(true);
  };

  const handleHaveQuestion = () => {
    if (branch) return;
    setBranch("question");
    setShowProceedChoices(false);
    setShowUserQuestion(true);
  };

  const handleDoneThankYou = () => {
    setShowFinalSystem(true);
  };

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    setExtraUserLines((prev) => [...prev, text]);
    setInputValue("");
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const navSubtitle = (
    <span className={styles.topNavSubtitle}>
      <span className={styles.topNavDot} aria-hidden="true" />
      Human Agent Connected
    </span>
  );

  return (
    <main className={appStyles.appShell}>
      <section ref={frameRef} className={appStyles.mobileFrame}>
        <TopNav variant="chat" subtitle={navSubtitle} onBack={() => navigate(-1)} />

        <div
          className={styles.chatScroll}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          <div className={styles.chatInner}>
            <div className={styles.systemDivider}>
              <span className={styles.systemDividerLine} aria-hidden="true" />
              <span className={styles.systemDividerPill}>Human agent has joined — session summary synced</span>
              <span className={styles.systemDividerLine} aria-hidden="true" />
            </div>

            <HumanMessageBlock>{MSG_HUMAN_1}</HumanMessageBlock>

            {showUserTyping1 && <UserTypingBubble />}

            {showUser2 && (
              <div className={styles.userRow}>
                <div className={styles.userBubble}>Yes, that&apos;s right.</div>
              </div>
            )}

            {showHumanTyping2 && <HumanTypingRow />}

            {showHuman3 && (
              <HumanMessageBlock
                footer={
                  showProceedChoices && !branch ? (
                    <div className={`${styles.choiceRow} ${styles.choiceRowRow}`}>
                      <button type="button" className={styles.choiceBtn} onClick={handleYesProceed}>
                        Yes, Proceed
                      </button>
                      <button type="button" className={styles.choiceBtn} onClick={handleHaveQuestion}>
                        I Have a Question
                      </button>
                    </div>
                  ) : null
                }
              >
                {MSG_HUMAN_3}
              </HumanMessageBlock>
            )}

            {branch === "question" && showUserQuestion && (
              <div className={styles.userRow}>
                <div className={styles.userBubble}>I have a question.</div>
              </div>
            )}

            {showUser5 && (
              <div className={styles.userRow}>
                <div className={styles.userBubble}>Yes, please proceed.</div>
              </div>
            )}

            {showHumanTyping3 && <HumanTypingRow />}

            {showHuman6 && (
              <>
                <HumanMessageBlock>{MSG_HUMAN_6}</HumanMessageBlock>
                {!showFinalSystem && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      marginTop: "6px",
                      paddingLeft: "16px"
                    }}
                  >
                    <button type="button" className={styles.choiceBtn} onClick={handleDoneThankYou}>
                      Done, Thank You
                    </button>
                  </div>
                )}
              </>
            )}

            {extraUserLines.map((line, i) => (
              <div key={`extra-${i}`} className={styles.userRow}>
                <div className={styles.userBubble}>{line}</div>
              </div>
            ))}

            {showFinalSystem && <p className={styles.systemMessageFinal}>{FINAL_SYSTEM}</p>}

            <div ref={bottomRef} />
          </div>
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
