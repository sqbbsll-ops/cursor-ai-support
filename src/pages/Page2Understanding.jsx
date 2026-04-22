import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import appStyles from "../App.module.css";
import styles from "./Page2.module.css";
import { TopNav } from "../components/TopNav.jsx";
import { FloatingSummaryWidget } from "../components/FloatingSummaryWidget.jsx";
import { SessionHistoryList } from "../components/SessionHistoryList.jsx";
import {
  buildFlightBookingMessageHistory,
  detectIntent,
  isFlightBookingIntent,
  MOCK_FLIGHT_BOOKING_ORDER,
  MOCK_HOTEL_ORDER,
  MOCK_ORDER_INQUIRY_INFO,
  MOCK_ORDER_INFO,
  PAGE2_FLIGHT_LOOKUP_AI_TEXT,
  HUMAN_AGENT_PROMPT_TEXT,
  HUMAN_AGENT_CONTINUE_AI_TEXT,
  QUICK_CHIPS
} from "../chatConstants.js";

/** Left-align choice chips under AI bubbles (overrides nested layout/CSS modules). */
const CHOICE_BTN_GROUP_STYLE = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "6px",
  marginTop: "6px",
  paddingLeft: "0px"
};

function FlightBookingMessage({ onRefund, onRebooking }) {
  return (
    <div className={styles.aiBubbleStack}>
      <div className={styles.aiBubbleText}>
        <p className={styles.bubbleLead}>I found your most recent flight booking:</p>
        <div className={styles.bookingMeta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Route:</span>
            <span className={styles.metaValue}>{MOCK_FLIGHT_BOOKING_ORDER.route}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Departure:</span>
            <span className={styles.metaValue}>{MOCK_FLIGHT_BOOKING_ORDER.departure}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Order No.:</span>
            <span className={styles.metaValue}>{MOCK_FLIGHT_BOOKING_ORDER.orderId}</span>
          </div>
        </div>
        <hr className={styles.bubbleDivider} />
        <p className={styles.bubbleQuestion}>
          Would you like to apply for a refund, or would you first like to explore rebooking options?
        </p>
      </div>
      <div style={CHOICE_BTN_GROUP_STYLE}>
        <button type="button" className={styles.choiceBtn} onClick={onRefund}>
          Apply for Refund
        </button>
        <button type="button" className={styles.choiceBtn} onClick={onRebooking}>
          See Rebooking Options
        </button>
      </div>
    </div>
  );
}

function HotelBookingMessage({ onConfirm, onKeep }) {
  return (
    <div className={styles.aiBubbleStack}>
      <div className={styles.aiBubbleText}>
        <p className={styles.bubbleLead}>I found your most recent hotel booking:</p>
        <div className={styles.bookingMeta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Hotel:</span>
            <span className={styles.metaValue}>{MOCK_HOTEL_ORDER.hotel}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Check-in:</span>
            <span className={styles.metaValue}>{MOCK_HOTEL_ORDER.checkIn}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Check-out:</span>
            <span className={styles.metaValue}>{MOCK_HOTEL_ORDER.checkOut}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Order No.:</span>
            <span className={styles.metaValue}>{MOCK_HOTEL_ORDER.orderId}</span>
          </div>
        </div>
        <hr className={styles.bubbleDivider} />
        <p className={styles.bubbleQuestion}>Would you like to proceed with the cancellation?</p>
      </div>
      <div style={CHOICE_BTN_GROUP_STYLE}>
        <button type="button" className={styles.choiceBtn} onClick={onConfirm}>
          Confirm Cancellation
        </button>
        <button type="button" className={styles.choiceBtn} onClick={onKeep}>
          Keep Booking
        </button>
      </div>
    </div>
  );
}

function OrderInquiryMessage({ onRefundPolicy, onChangeFlight, onHuman }) {
  return (
    <div className={styles.aiBubbleStack}>
      <div className={styles.aiBubbleText}>
        <p className={styles.bubbleLead}>I found your most recent order:</p>
        <div className={styles.bookingMeta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Type:</span>
            <span className={styles.metaValue}>{MOCK_ORDER_INQUIRY_INFO.type}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Route:</span>
            <span className={styles.metaValue}>{MOCK_ORDER_INQUIRY_INFO.route}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Order No.:</span>
            <span className={styles.metaValue}>{MOCK_ORDER_INQUIRY_INFO.orderId}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Status:</span>
            <span className={styles.metaValue}>{MOCK_ORDER_INQUIRY_INFO.status}</span>
          </div>
        </div>
        <hr className={styles.bubbleDivider} />
        <p className={styles.bubbleQuestion}>What would you like to know about this order?</p>
      </div>
      <div style={CHOICE_BTN_GROUP_STYLE}>
        <button type="button" className={styles.choiceBtn} onClick={onRefundPolicy}>
          Check Refund Policy
        </button>
        <button type="button" className={styles.choiceBtn} onClick={onChangeFlight}>
          Change Flight
        </button>
        <button type="button" className={styles.choiceBtn} onClick={onHuman}>
          Talk to Human Agent
        </button>
      </div>
    </div>
  );
}

function GeneralInquiryMessage({ onFlightRefund, onFlightRebook, onHotelCancel, onOrderStatus }) {
  return (
    <div className={styles.aiBubbleStack}>
      <div className={styles.aiBubbleText}>
        <p className={styles.bubbleQuestion} style={{ margin: 0 }}>
          I&apos;m here to help! Could you tell me more about your issue? You can also select one of the options below.
        </p>
      </div>
      <div style={CHOICE_BTN_GROUP_STYLE}>
        <button type="button" className={styles.choiceBtn} onClick={onFlightRefund}>
          Flight Refund
        </button>
        <button type="button" className={styles.choiceBtn} onClick={onFlightRebook}>
          Flight Rebooking
        </button>
        <button type="button" className={styles.choiceBtn} onClick={onHotelCancel}>
          Hotel Cancellation
        </button>
        <button type="button" className={styles.choiceBtn} onClick={onOrderStatus}>
          Order Status
        </button>
      </div>
    </div>
  );
}

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

function renderMsg3(intent, handlers) {
  if (isFlightBookingIntent(intent)) {
    return <FlightBookingMessage onRefund={handlers.onFlightRefund} onRebooking={handlers.onFlightRebooking} />;
  }
  if (intent === "hotel_cancellation") {
    return <HotelBookingMessage onConfirm={handlers.onHotelConfirm} onKeep={handlers.onHotelKeep} />;
  }
  if (intent === "order_inquiry") {
    return (
      <OrderInquiryMessage
        onRefundPolicy={handlers.onOrderRefundPolicy}
        onChangeFlight={handlers.onOrderChangeFlight}
        onHuman={handlers.onOrderHuman}
      />
    );
  }
  return (
    <GeneralInquiryMessage
      onFlightRefund={handlers.onGeneralFlightRefund}
      onFlightRebook={handlers.onGeneralFlightRebook}
      onHotelCancel={handlers.onGeneralHotelCancel}
      onOrderStatus={handlers.onGeneralOrderStatus}
    />
  );
}

export function Page2Understanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = location.state || {};
  const intent = location.state?.intent ?? (message ? detectIntent(message) : "general_inquiry");

  const [showTyping2, setShowTyping2] = useState(false);
  const [showMsg2, setShowMsg2] = useState(false);
  const [showTyping3, setShowTyping3] = useState(false);
  const [showMsg3, setShowMsg3] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [humanSegments, setHumanSegments] = useState(() =>
    intent === "human_agent" ? [{ key: "route", kind: "route", step: "loading" }] : []
  );

  const bottomRef = useRef(null);
  const frameRef = useRef(null);

  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (summaryOpen) {
      frame.style.overflow = "hidden";
    } else {
      frame.style.overflow = "";
    }
    return () => {
      frame.style.overflow = "";
    };
  }, [summaryOpen]);

  useEffect(() => {
    if (summaryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [summaryOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [showTyping2, showMsg2, showTyping3, showMsg3, humanSegments]);

  useEffect(() => {
    if (intent === "human_agent") return;
    const t1 = setTimeout(() => setShowTyping2(true), 600);
    const t2 = setTimeout(() => {
      setShowTyping2(false);
      setShowMsg2(true);
    }, 1200);
    const t3 = setTimeout(() => setShowTyping3(true), 2400);
    const t4 = setTimeout(() => {
      setShowTyping3(false);
      setShowMsg3(true);
    }, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [intent]);

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

  if (!message) {
    return <Navigate to="/" replace />;
  }

  const goPage3 = (extra) => {
    navigate("/page3", { state: { ...extra } });
  };

  const handleRefundChoice = () => {
    setTimeout(() => {
      goPage3({
        intent: "flight_refund",
        choice: "refund",
        orderInfo: MOCK_FLIGHT_BOOKING_ORDER,
        messageHistory: buildFlightBookingMessageHistory(message)
      });
    }, 300);
  };

  const handleRebookingChoice = () => {
    setTimeout(() => {
      goPage3({
        intent: "flight_refund",
        choice: "rebooking",
        orderInfo: MOCK_FLIGHT_BOOKING_ORDER,
        messageHistory: buildFlightBookingMessageHistory(message)
      });
    }, 300);
  };

  const handlers = {
    onFlightRefund: handleRefundChoice,
    onFlightRebooking: handleRebookingChoice,
    onHotelConfirm: () =>
      goPage3({ intent: "hotel_cancellation", choice: "confirm_cancel", orderInfo: MOCK_HOTEL_ORDER }),
    onHotelKeep: () =>
      goPage3({ intent: "hotel_cancellation", choice: "keep_booking", orderInfo: MOCK_HOTEL_ORDER }),
    onOrderRefundPolicy: () =>
      goPage3({ intent: "order_inquiry", choice: "refund_policy", orderInfo: MOCK_ORDER_INQUIRY_INFO }),
    onOrderChangeFlight: () =>
      goPage3({ intent: "order_inquiry", choice: "change_flight", orderInfo: MOCK_ORDER_INQUIRY_INFO }),
    onOrderHuman: () =>
      goPage3({ intent: "human_agent", choice: "from_order_inquiry", orderInfo: MOCK_ORDER_INQUIRY_INFO }),
    onGeneralFlightRefund: () =>
      goPage3({ intent: "flight_refund", choice: "from_general", orderInfo: MOCK_FLIGHT_BOOKING_ORDER }),
    onGeneralFlightRebook: () =>
      goPage3({ intent: "flight_rebooking", choice: "from_general", orderInfo: MOCK_FLIGHT_BOOKING_ORDER }),
    onGeneralHotelCancel: () =>
      goPage3({ intent: "hotel_cancellation", choice: "from_general", orderInfo: MOCK_HOTEL_ORDER }),
    onGeneralOrderStatus: () =>
      goPage3({ intent: "order_inquiry", choice: "from_general", orderInfo: MOCK_ORDER_INQUIRY_INFO })
  };

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    if (detectIntent(text) === "human_agent") {
      setHumanSegments((s) => [...s, { key: Date.now(), kind: "typed", text, step: "loading" }]);
      setInputValue("");
      return;
    }
    goPage3({
      intent: detectIntent(text),
      message: text,
      orderInfo: MOCK_ORDER_INFO
    });
    setInputValue("");
  };

  const navigateToHumanPage4 = () => {
    navigate("/page4", { state: { intent: "human_agent", orderInfo: MOCK_ORDER_INFO, message } });
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
              <div style={CHOICE_BTN_GROUP_STYLE}>
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
              <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`} style={{ marginTop: 8 }}>
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

  const summaryServiceType =
    intent === "hotel_cancellation"
      ? "Hotel Booking"
      : isFlightBookingIntent(intent) || intent === "order_inquiry"
        ? "Flight Booking"
        : "General";

  const summaryDetected =
    intent === "hotel_cancellation"
      ? "Cancellation"
      : isFlightBookingIntent(intent)
        ? "Refund / Rebooking"
        : intent === "order_inquiry"
          ? "Order details"
          : intent === "human_agent"
            ? "Human support"
            : "How can we help?";

  const summaryOrderRows =
    intent === "hotel_cancellation" ? (
      <>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Order No.</span>
          <span className={styles.sheetVal}>{MOCK_HOTEL_ORDER.orderId}</span>
        </div>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Hotel</span>
          <span className={styles.sheetVal}>{MOCK_HOTEL_ORDER.hotel}</span>
        </div>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Stay</span>
          <span className={styles.sheetVal}>
            {MOCK_HOTEL_ORDER.checkIn} – {MOCK_HOTEL_ORDER.checkOut}
          </span>
        </div>
      </>
    ) : intent === "order_inquiry" ? (
      <>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Order No.</span>
          <span className={styles.sheetVal}>{MOCK_ORDER_INQUIRY_INFO.orderId}</span>
        </div>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Route</span>
          <span className={styles.sheetVal}>{MOCK_ORDER_INQUIRY_INFO.route}</span>
        </div>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Status</span>
          <span className={styles.sheetVal}>{MOCK_ORDER_INQUIRY_INFO.status}</span>
        </div>
      </>
    ) : (
      <>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Order No.</span>
          <span className={styles.sheetVal}>{MOCK_ORDER_INFO.orderId}</span>
        </div>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Route</span>
          <span className={styles.sheetVal}>{MOCK_ORDER_INFO.route}</span>
        </div>
        <div className={styles.sheetRow}>
          <span className={styles.sheetKey}>Departure</span>
          <span className={styles.sheetVal}>{MOCK_ORDER_INFO.departure}</span>
        </div>
      </>
    );

  return (
    <main className={appStyles.appShell}>
      <section ref={frameRef} className={appStyles.mobileFrame}>
        <TopNav variant="chat" onBack={() => navigate("/")} />

        <div
          className={styles.chatScroll}
          style={{ overflow: summaryOpen ? "hidden" : "auto" }}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          <div className={styles.chatInner}>
            <div className={styles.userRow}>
              <div className={styles.userBubble}>{message}</div>
            </div>

            {humanSegments.filter((s) => s.kind === "route").map((seg) => renderHumanSegment(seg))}

            {intent !== "human_agent" && (showTyping2 || showMsg2) && (
              <div className={styles.aiRow}>
                <AiAvatarSmall />
                <div className={styles.aiCol}>
                  {showTyping2 && <TypingIndicator />}
                  {showMsg2 && (
                    <div className={`${styles.aiBubbleText} ${styles.aiBubbleTextPlain}`}>{PAGE2_FLIGHT_LOOKUP_AI_TEXT}</div>
                  )}
                </div>
              </div>
            )}

            {intent !== "human_agent" && (showTyping3 || showMsg3) && (
              <div className={styles.aiRow}>
                <AiAvatarSmall />
                <div className={styles.aiCol}>
                  {showTyping3 && <TypingIndicator />}
                  {showMsg3 && renderMsg3(intent, handlers)}
                </div>
              </div>
            )}

            {humanSegments.filter((s) => s.kind === "typed").map((seg) => renderHumanSegment(seg))}

            <div ref={bottomRef} />
          </div>
        </div>

        <FloatingSummaryWidget frameRef={frameRef} onOpenPanel={() => setSummaryOpen(true)} />

        {summaryOpen && (
          <>
            <button type="button" className={styles.sheetOverlay} aria-label="Close overlay" onClick={() => setSummaryOpen(false)} />
            <div className={styles.sheetPanel} role="dialog" aria-labelledby="summary-sheet-title">
              <div className={styles.sheetHeader}>
                <h2 id="summary-sheet-title" className={styles.sheetTitle}>
                  Service Summary
                </h2>
                <button type="button" className={styles.sheetClose} aria-label="Close" onClick={() => setSummaryOpen(false)}>
                  ✕
                </button>
              </div>
              <div className={styles.sheetDivider} />
              <div className={styles.sheetBody}>
                <section className={styles.sheetSection}>
                  <h3 className={styles.sheetSectionTitle}>Current Request</h3>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetKey}>Service Type</span>
                    <span className={styles.sheetVal}>{summaryServiceType}</span>
                  </div>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetKey}>Detected Need</span>
                    <span className={`${styles.sheetVal} ${styles.sheetValHighlight}`}>{summaryDetected}</span>
                  </div>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetKey}>Status</span>
                    <span className={`${styles.sheetVal} ${styles.sheetValWarning}`}>Awaiting your confirmation</span>
                  </div>
                </section>

                <section className={styles.sheetSection}>
                  <h3 className={styles.sheetSectionTitle}>Order Identified</h3>
                  {summaryOrderRows}
                </section>

                <section className={styles.sheetSection}>
                  <h3 className={styles.sheetSectionTitle}>Progress</h3>
                  <div className={styles.stepper}>
                    <div className={styles.stepRow}>
                      <span className={styles.stepIcon} aria-hidden="true">
                        ✅
                      </span>
                      <span>Request received</span>
                    </div>
                    <div className={styles.stepRow}>
                      <span className={styles.stepIcon} aria-hidden="true">
                        ✅
                      </span>
                      <span>Order identified</span>
                    </div>
                    <div className={styles.stepRow}>
                      <span className={styles.pulseWrap} aria-hidden="true">
                        <span className={styles.pulseDot} />
                      </span>
                      <span>⏳ Confirming service direction</span>
                    </div>
                  </div>
                </section>

                <p className={styles.sheetNote}>
                  Key information from this session is being recorded to ensure seamless service continuity.
                </p>

                <section className={styles.sheetSection}>
                  <h3 className={styles.sheetSectionTitle}>Session History</h3>
                  <SessionHistoryList
                    rows={[
                      { time: "Just now", text: "Refund request submitted" },
                      { time: "2 min ago", text: "Confirmed refund over rebooking" },
                      { time: "3 min ago", text: "Checked rebooking options (CNY 120 fee)" },
                      { time: "4 min ago", text: "Flight order C12345678 identified" },
                      { time: "5 min ago", text: "Started session" }
                    ]}
                  />
                </section>
              </div>
            </div>
          </>
        )}

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
