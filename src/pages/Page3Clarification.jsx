import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import appStyles from "../App.module.css";
import styles from "./Page3.module.css";
import { TopNav } from "../components/TopNav.jsx";
import { BookingOfferMessage } from "../components/BookingOfferMessage.jsx";
import {
  detectIntent,
  HUMAN_AGENT_CONTINUE_AI_TEXT,
  HUMAN_AGENT_PROMPT_TEXT,
  MOCK_FLIGHT_BOOKING_ORDER
} from "../chatConstants.js";

const ROUTE_LINE = "Shanghai (PVG) → Beijing (PEK), April 28, 14:00";

function AiAvatarSmall() {
  return (
    <div className={styles.aiAvatarSm} aria-hidden="true">
      <svg viewBox="0 0 24 24" className={styles.aiAvatarIconSm} xmlns="http://www.w3.org/2000/svg">
        <rect x="7.2" y="8.4" width="9.6" height="7.6" rx="2" fill="currentColor" />
        <circle cx="10.4" cy="12.2" r="1" fill="#1677FF" />
        <circle cx="13.6" cy="12.2" r="1" fill="#1677FF" />
        <path
          d="M9.4 5V7.1M14.6 5V7.1M6 11.4C6 9.5 7.2 8.2 8.9 8M18 11.4C18 9.5 16.8 8.2 15.1 8"
          stroke="#FFFFFF"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className={styles.typingBubble} aria-hidden="true">
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </div>
  );
}

export function Page3Clarification() {
  const navigate = useNavigate();
  const location = useLocation();
  const choice = location.state?.choice;
  const orderInfo = location.state?.orderInfo ?? MOCK_FLIGHT_BOOKING_ORDER;
  const messageHistory = location.state?.messageHistory;
  const hasPriorHistory = Array.isArray(messageHistory) && messageHistory.length > 0;

  const [typing2, setTyping2] = useState(false);
  const [showAi2, setShowAi2] = useState(false);
  const [typing3, setTyping3] = useState(false);
  const [showAi3, setShowAi3] = useState(false);
  const [showRebookButtons, setShowRebookButtons] = useState(false);

  const [showUserSwitch, setShowUserSwitch] = useState(false);
  const [typing5, setTyping5] = useState(false);
  const [showAi5, setShowAi5] = useState(false);
  const [typing6, setTyping6] = useState(false);
  const [showAi6, setShowAi6] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [humanSegments, setHumanSegments] = useState([]);

  const bottomRef = useRef(null);
  const frameRef = useRef(null);
  const branchTimeoutsRef = useRef([]);

  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const clearBranchTimeouts = useCallback(() => {
    branchTimeoutsRef.current.forEach(clearTimeout);
    branchTimeoutsRef.current = [];
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [
    hasPriorHistory,
    humanSegments,
    typing2,
    showAi2,
    typing3,
    showAi3,
    showUserSwitch,
    typing5,
    showAi5,
    typing6,
    showAi6
  ]);

  useEffect(() => {
    const last = humanSegments[humanSegments.length - 1];
    if (!last || last.step !== "loading") return;
    const t = setTimeout(() => {
      setHumanSegments((s) => {
        if (s.length === 0) return s;
        const n = [...s];
        const i = n.length - 1;
        if (n[i].step !== "loading") return s;
        n[i] = { ...n[i], step: "prompt" };
        return n;
      });
    }, 600);
    return () => clearTimeout(t);
  }, [humanSegments]);

  useEffect(() => {
    if (choice !== "refund") return;

    const t1 = setTimeout(() => setTyping2(true), 600);
    const t2 = setTimeout(() => {
      setTyping2(false);
      setShowAi2(true);
    }, 1200);
    const t3 = setTimeout(() => setTyping3(true), 1800);
    const t4 = setTimeout(() => {
      setTyping3(false);
      setShowAi3(true);
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [choice]);

  useEffect(() => {
    if (choice !== "rebooking") return;

    const t1 = setTimeout(() => setTyping2(true), 600);
    const t2 = setTimeout(() => {
      setTyping2(false);
      setShowAi2(true);
    }, 1200);
    const t3 = setTimeout(() => setTyping3(true), 1800);
    const t4 = setTimeout(() => {
      setTyping3(false);
      setShowAi3(true);
      setShowRebookButtons(true);
    }, 2400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [choice]);

  const handleRefundInstead = () => {
    clearBranchTimeouts();
    setShowRebookButtons(false);
    setShowUserSwitch(true);

    const a = setTimeout(() => setTyping5(true), 600);
    const b = setTimeout(() => {
      setTyping5(false);
      setShowAi5(true);
    }, 1200);
    const c = setTimeout(() => setTyping6(true), 1600);
    const d = setTimeout(() => {
      setTyping6(false);
      setShowAi6(true);
    }, 2200);

    branchTimeoutsRef.current.push(a, b, c, d);
  };

  useEffect(() => {
    return () => clearBranchTimeouts();
  }, [clearBranchTimeouts]);

  const goPage4 = (extra) => {
    navigate("/page4", {
      state: {
        orderInfo,
        ...extra
      }
    });
  };

  const handleConfirmRefund = () => {
    goPage4({ intent: "flight_refund", choice: "refund", confirmed: true });
  };

  const handleTalkHuman = () => {
    goPage4({ intent: "flight_refund", choice: "human_agent", orderInfo });
  };

  const handleProceedRebooking = () => {
    goPage4({ intent: "flight_rebooking", confirmed: true, orderInfo });
  };

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    if (detectIntent(text) === "human_agent") {
      setHumanSegments((s) => [...s, { key: Date.now(), kind: "typed", text, step: "loading" }]);
      setInputValue("");
      return;
    }
    goPage4({
      intent: detectIntent(text),
      message: text,
      orderInfo
    });
    setInputValue("");
  };

  const navigateToHumanPage4 = () => {
    goPage4({ intent: "human_agent", orderInfo });
  };

  const handleContinueWithAi = (segmentKey) => {
    setHumanSegments((s) => s.map((seg) => (seg.key === segmentKey ? { ...seg, step: "continued" } : seg)));
  };

  const renderHumanSegment = (seg) => (
    <Fragment key={seg.key}>
      {seg.kind === "typed" && seg.text && (
        <div className={styles.userRow}>
          <div className={styles.userBubble}>{seg.text}</div>
        </div>
      )}
      <div className={styles.aiRow}>
        <AiAvatarSmall />
        <div className={styles.aiCol}>
          {seg.step === "loading" && <TypingIndicator />}
          {seg.step === "prompt" && (
            <>
              <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`}>{HUMAN_AGENT_PROMPT_TEXT}</div>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '6px', paddingLeft: '0px' }}
              >
                <button type="button" className={styles.choiceBtn} onClick={navigateToHumanPage4}>
                  Transfer to Human Agent
                </button>
                <button type="button" className={styles.choiceBtn} onClick={() => handleContinueWithAi(seg.key)}>
                  Continue with AI
                </button>
              </div>
            </>
          )}
          {seg.step === "continued" && (
            <>
              <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`}>{HUMAN_AGENT_PROMPT_TEXT}</div>
              <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain} ${styles.aiBubbleTextContinuation}`}>
                {HUMAN_AGENT_CONTINUE_AI_TEXT}
              </div>
            </>
          )}
        </div>
      </div>
    </Fragment>
  );

  const onInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  if (!choice || !["refund", "rebooking"].includes(choice)) {
    return <Navigate to="/" replace />;
  }

  const renderHistoryItem = (item, index) => {
    if (item.role === "user") {
      return (
        <div key={`hist-${index}`} className={styles.userRow}>
          <div className={styles.userBubble}>{item.text}</div>
        </div>
      );
    }
    if (item.role === "ai") {
      if (item.type === "booking_card") {
        return (
          <div key={`hist-${index}`} className={styles.aiRow}>
            <AiAvatarSmall />
            <div className={styles.aiCol}>
              <BookingOfferMessage order={orderInfo} />
            </div>
          </div>
        );
      }
      return (
        <div key={`hist-${index}`} className={styles.aiRow}>
          <AiAvatarSmall />
          <div className={styles.aiCol}>
            <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`}>{item.text}</div>
          </div>
        </div>
      );
    }
    return null;
  };

  const refundMetaBlock = (
    <div className={styles.bookingMeta}>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>Amount:</span>
        <span className={styles.metaValue}>CNY 680</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>Fee:</span>
        <span className={styles.metaValue}>CNY 50</span>
      </div>
      <div className={styles.metaRow}>
        <span className={styles.metaLabel}>Timeline:</span>
        <span className={styles.metaValue}>3-5 business days</span>
      </div>
    </div>
  );

  return (
    <main className={appStyles.appShell}>
      <section ref={frameRef} className={appStyles.mobileFrame}>
        <TopNav variant="chat" onBack={() => navigate(-1)} />

        <div
          className={styles.chatScroll}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          <div className={styles.chatInner}>
            {hasPriorHistory && (
              <>
                {messageHistory.map((item, index) => renderHistoryItem(item, index))}
                <div className={styles.sessionContinueDivider} role="separator">
                  — Continuing your session —
                </div>
              </>
            )}

            {choice === "rebooking" && (
              <>
                {!hasPriorHistory && (
                  <div className={styles.userRow}>
                    <div className={styles.userBubble}>I&apos;d like to see rebooking options</div>
                  </div>
                )}

                {(typing2 || showAi2) && (
                  <div className={styles.aiRow}>
                    <AiAvatarSmall />
                    <div className={styles.aiCol}>
                      {typing2 && <TypingIndicator />}
                      {showAi2 && (
                        <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`}>
                          <p className={styles.bubbleBlock}>
                            Sure! Let me check the rebooking rules for your flight.
                          </p>
                          <p className={styles.bubbleBlock}>{ROUTE_LINE}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(typing3 || showAi3) && (
                  <div className={styles.aiRow}>
                    <AiAvatarSmall />
                    <div className={styles.aiCol}>
                      {typing3 && <TypingIndicator />}
                      {showAi3 && (
                        <div className={styles.aiBubbleStack}>
                          <div className={styles.aiBubbleText}>
                            <p className={styles.bubbleLead}>Here are the rebooking options:</p>
                            <div className={styles.bookingMeta}>
                              <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Fee:</span>
                                <span className={styles.metaValue}>CNY 120 per person</span>
                              </div>
                              <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Next flight:</span>
                                <span className={styles.metaValue}>April 28, 18:00</span>
                              </div>
                              <div className={styles.metaRow}>
                                <span className={styles.metaLabel}>Availability:</span>
                                <span className={styles.metaValue}>Seats available</span>
                              </div>
                            </div>
                            <hr className={styles.bubbleDivider} />
                            <p className={styles.bubbleQuestion}>
                              Would you like to proceed with rebooking, or would you prefer to apply for a refund instead?
                            </p>
                          </div>
                          {showRebookButtons && (
                            <div
                              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '6px', paddingLeft: '0px' }}
                            >
                              <button type="button" className={styles.choiceBtn} onClick={handleProceedRebooking}>
                                Proceed with Rebooking
                              </button>
                              <button type="button" className={styles.choiceBtn} onClick={handleRefundInstead}>
                                Apply for Refund Instead
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {showUserSwitch && (
                  <div className={styles.userRow}>
                    <div className={styles.userBubble}>Actually, I&apos;d like a refund instead</div>
                  </div>
                )}

                {(typing5 || showAi5) && (
                  <div className={styles.aiRow}>
                    <AiAvatarSmall />
                    <div className={styles.aiCol}>
                      {typing5 && <TypingIndicator />}
                      {showAi5 && (
                        <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`}>
                          <p className={styles.bubbleBlock}>
                            Understood. I&apos;ve updated your request to: Refund Application.
                          </p>
                          <p className={styles.bubbleBlock}>Let me check the refund policy for this ticket.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(typing6 || showAi6) && (
                  <div className={styles.aiRow}>
                    <AiAvatarSmall />
                    <div className={styles.aiCol}>
                      {typing6 && <TypingIndicator />}
                      {showAi6 && (
                        <div className={styles.aiBubbleStack}>
                          <div className={styles.aiBubbleText}>
                            <p className={styles.bubbleLead}>Here is the refund information:</p>
                            {refundMetaBlock}
                            <hr className={styles.bubbleDivider} />
                            <p className={styles.bubbleQuestion}>Would you like to confirm the refund application?</p>
                          </div>
                          <div
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '6px', paddingLeft: '0px' }}
                          >
                            <button type="button" className={styles.choiceBtn} onClick={handleConfirmRefund}>
                              Confirm Refund
                            </button>
                            <button type="button" className={styles.choiceBtn} onClick={handleTalkHuman}>
                              Talk to Human Agent
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {choice === "refund" && (
              <>
                {!hasPriorHistory && (
                  <div className={styles.userRow}>
                    <div className={styles.userBubble}>I&apos;d like to apply for a refund</div>
                  </div>
                )}

                {(typing2 || showAi2) && (
                  <div className={styles.aiRow}>
                    <AiAvatarSmall />
                    <div className={styles.aiCol}>
                      {typing2 && <TypingIndicator />}
                      {showAi2 && (
                        <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`}>
                          <p className={styles.bubbleBlock}>Got it! Let me check the refund policy for your ticket.</p>
                          <p className={styles.bubbleBlock}>{ROUTE_LINE}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(typing3 || showAi3) && (
                  <div className={styles.aiRow}>
                    <AiAvatarSmall />
                    <div className={styles.aiCol}>
                      {typing3 && <TypingIndicator />}
                      {showAi3 && (
                        <div className={styles.aiBubbleStack}>
                          <div className={styles.aiBubbleText}>
                            <p className={styles.bubbleLead}>Here is the refund information:</p>
                            {refundMetaBlock}
                            <hr className={styles.bubbleDivider} />
                            <p className={styles.bubbleQuestion}>Would you like to confirm the refund application?</p>
                          </div>
                          <div
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px', marginTop: '6px', paddingLeft: '0px' }}
                          >
                            <button type="button" className={styles.choiceBtn} onClick={handleConfirmRefund}>
                              Confirm Refund
                            </button>
                            <button type="button" className={styles.choiceBtn} onClick={handleTalkHuman}>
                              Talk to Human Agent
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {humanSegments.map((seg) => renderHumanSegment(seg))}

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
