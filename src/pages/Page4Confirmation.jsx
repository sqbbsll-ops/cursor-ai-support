import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import appStyles from "../App.module.css";
import styles from "./Page4.module.css";
import { TopNav } from "../components/TopNav.jsx";
import { FloatingSummaryWidget } from "../components/FloatingSummaryWidget.jsx";
import { QUICK_CHIPS } from "../chatConstants.js";

const MOCK_ORDERS = [
  {
    id: "1",
    orderNo: "C12345678",
    route: "Shanghai → Beijing",
    departure: "April 28, 14:00",
    sheetLabel: "Flight — Shanghai → Beijing, Apr 28"
  },
  {
    id: "2",
    orderNo: "C87654321",
    route: "Beijing → Shanghai",
    departure: "May 3, 14:00",
    sheetLabel: "Flight — Beijing → Shanghai, May 3, Order #C87654321"
  },
  {
    id: "3",
    orderNo: "H98765432",
    route: "Grand Hyatt Shanghai",
    departure: "Apr 27–29",
    sheetLabel: "Hotel — Grand Hyatt Shanghai, Apr 27-29, Order #H98765432"
  }
];

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

function SmallGreenCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="#52C41A" />
      <path d="M5 9l2.5 2.5L13 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GrayCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="9" r="7" stroke="#D9D9D9" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function HeaderConfirmedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="#52C41A" />
      <path d="M5 9l2.5 2.5L13 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RowSelectedCheckIcon() {
  return (
    <svg className={styles.orderRowCheck} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="#1677FF" />
      <path d="M6 10l2.5 2.5L14 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepDoneIcon() {
  return (
    <span className={styles.stepMarkDone} aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="9" cy="9" r="9" fill="#52C41A" />
        <path d="M5 9l2.5 2.5L13 6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function getOrderById(id) {
  return MOCK_ORDERS.find((o) => o.id === id) ?? MOCK_ORDERS[0];
}

export function Page4Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [orderSheetOpen, setOrderSheetOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState("1");
  const [pendingOrderId, setPendingOrderId] = useState("1");
  const [confirmed, setConfirmed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const frameRef = useRef(null);
  const scrollEndRef = useRef(null);

  const activeOrder = useMemo(() => getOrderById(activeOrderId), [activeOrderId]);

  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const anySheetOpen = summaryOpen || orderSheetOpen;

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    if (anySheetOpen) {
      frame.style.overflow = "hidden";
    } else {
      frame.style.overflow = "";
    }
    return () => {
      frame.style.overflow = "";
    };
  }, [anySheetOpen]);

  useEffect(() => {
    if (anySheetOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [anySheetOpen]);

  const goPage3 = () => {
    navigate(-1);
  };

  const handleEditInfo = goPage3;

  const openOrderSheet = () => {
    if (confirmed) return;
    setPendingOrderId(activeOrderId);
    setSummaryOpen(false);
    setOrderSheetOpen(true);
  };

  const openSummaryPanel = () => {
    setOrderSheetOpen(false);
    setSummaryOpen(true);
  };

  const confirmOrderSelection = () => {
    setActiveOrderId(pendingOrderId);
    setOrderSheetOpen(false);
  };

  const handleConfirmTransfer = () => {
    setConfirmed(true);
  };

  useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => {
      navigate("/page5", { state: { ...(location.state || {}), transferFromPage4: true } });
    }, 1500);
    return () => clearTimeout(t);
  }, [confirmed, navigate, location.state]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [confirmed, orderSheetOpen, summaryOpen]);

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    navigate("/page5", { state: { ...(location.state || {}), message: text } });
    setInputValue("");
  };

  const onInputKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const stepsDone = ["Order identified", "Rebooking options reviewed", "Refund policy checked"];
  const pendingSteps = ["Confirm final refund amount", "Process refund application"];

  return (
    <main className={appStyles.appShell}>
      <section ref={frameRef} className={appStyles.mobileFrame}>
        <TopNav variant="chat" onBack={() => navigate(-1)} />

        <div
          className={styles.chatScroll}
          style={{ overflow: anySheetOpen ? "hidden" : "auto" }}
          role="log"
          aria-live="polite"
          aria-label="Conversation"
        >
          <div className={styles.chatInner}>
            <div className={styles.aiRow}>
              <AiAvatarSmall />
              <div className={styles.aiCol}>
                <div className={styles.aiBubbleText}>
                  <p className={styles.bubbleBlock}>
                    Your case involves special refund rules. I recommend connecting you with a human agent for further assistance.
                  </p>
                  <p className={styles.bubbleBlock} style={{ marginBottom: 0 }}>
                    Before transferring, I&apos;ve prepared a summary of your session. Please review and confirm the information below.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.aiRow}>
              <AiAvatarSmall />
              <div className={styles.aiCol}>
                <div
                  className={`${styles.confirmCard} ${confirmed ? styles.confirmCardConfirmed : ""}`}
                >
                  <div className={styles.confirmCardHeaderBlock}>
                    {confirmed ? (
                      <div className={styles.confirmCardTitleRow}>
                        <div className={styles.confirmCardTitle}>Transfer Summary</div>
                        <div className={styles.confirmedBadge}>
                          <HeaderConfirmedIcon />
                          <span>Confirmed</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={styles.confirmCardTitle}>Transfer Summary</div>
                        <p className={styles.confirmCardSubtitle}>Please confirm your information</p>
                      </>
                    )}
                  </div>

                  <div className={styles.confirmSection}>
                    <div className={styles.sectionHeaderRow}>
                      <h3 className={styles.sectionTitlePlain}>Order Info</h3>
                      <button
                        type="button"
                        className={styles.changeOrderBtn}
                        onClick={openOrderSheet}
                        disabled={confirmed}
                      >
                        Change Order ›
                      </button>
                    </div>
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmKey}>Order No.</span>
                      <span className={styles.confirmVal}>{activeOrder.orderNo}</span>
                    </div>
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmKey}>Route</span>
                      <span className={styles.confirmVal}>{activeOrder.route}</span>
                    </div>
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmKey}>Departure</span>
                      <span className={styles.confirmVal}>{activeOrder.departure}</span>
                    </div>
                  </div>

                  <div className={styles.confirmSection}>
                    <h3 className={styles.sectionTitlePlain} style={{ marginBottom: 8 }}>
                      Your Request
                    </h3>
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmKey}>Need</span>
                      <span className={`${styles.confirmVal} ${styles.confirmValBlue}`}>Refund Application</span>
                    </div>
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmKey}>Checked</span>
                      <span className={styles.confirmVal}>Rebooking options</span>
                    </div>
                    <div className={styles.confirmRow}>
                      <span className={styles.confirmKey}>Decision</span>
                      <span className={`${styles.confirmVal} ${styles.confirmValBlue}`}>Confirmed refund</span>
                    </div>
                  </div>

                  <div className={styles.confirmSection}>
                    <h3 className={styles.sectionTitlePlain} style={{ marginBottom: 8 }}>
                      Steps Done
                    </h3>
                    <div className={styles.compactList}>
                      {stepsDone.map((label) => (
                        <div key={label} className={styles.compactListItem}>
                          <span className={styles.checkIconWrap}>
                            <SmallGreenCheckIcon />
                          </span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.confirmSection}>
                    <h3 className={styles.sectionTitlePlain} style={{ marginBottom: 8 }}>
                      Pending
                    </h3>
                    <div className={styles.compactList}>
                      {pendingSteps.map((label) => (
                        <div key={label} className={styles.compactListItem}>
                          <span className={styles.pendingIconWrap}>
                            <GrayCircleIcon />
                          </span>
                          <span>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className={styles.confirmCardFooterNote}>This info will be shared with the human agent.</p>
                </div>
              </div>
            </div>

            {confirmed && (
              <div className={styles.aiRow}>
                <AiAvatarSmall />
                <div className={styles.aiCol}>
                  <div className={styles.aiBubbleText}>
                    <p className={styles.bubbleBlock} style={{ marginBottom: 0 }}>
                      Your information has been confirmed. Connecting you to a human agent now...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!confirmed && (
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
                <button
                  type="button"
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "22px",
                    background: "#1677FF",
                    color: "white",
                    border: "none",
                    fontSize: "15px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                  onClick={handleConfirmTransfer}
                >
                  Confirm & Transfer to Human Agent
                </button>
                <button
                  type="button"
                  style={{
                    width: "100%",
                    height: "44px",
                    borderRadius: "22px",
                    background: "white",
                    color: "#1677FF",
                    border: "1.5px solid #1677FF",
                    fontSize: "15px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                  onClick={handleEditInfo}
                >
                  Edit Information
                </button>
              </div>
            )}

            <div ref={scrollEndRef} />
          </div>
        </div>

        <FloatingSummaryWidget frameRef={frameRef} onOpenPanel={openSummaryPanel} />

        {summaryOpen && (
          <>
            <button type="button" className={styles.sheetOverlay} aria-label="Close overlay" onClick={() => setSummaryOpen(false)} />
            <div className={styles.sheetPanel} role="dialog" aria-labelledby="p4-summary-title">
              <div className={styles.sheetHeader}>
                <h2 id="p4-summary-title" className={styles.sheetTitle}>
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
                    <span className={styles.sheetKey}>Current Selection</span>
                    <span className={`${styles.sheetVal} ${styles.sheetValHighlight}`}>Refund Application</span>
                  </div>
                  <div className={styles.sheetRow}>
                    <span className={styles.sheetKey}>Status</span>
                    <span className={`${styles.sheetVal} ${styles.sheetValWarning}`}>Ready to transfer to human agent</span>
                  </div>
                </section>

                <section className={styles.sheetSection}>
                  <h3 className={styles.sheetSectionTitle}>Progress</h3>
                  <div className={styles.decisionTimeline}>
                    <div className={styles.decisionRow}>
                      <StepDoneIcon />
                      <span>Order identified</span>
                    </div>
                    <div className={styles.decisionRow}>
                      <StepDoneIcon />
                      <span>Rebooking options reviewed</span>
                    </div>
                    <div className={styles.decisionRow}>
                      <StepDoneIcon />
                      <span>Refund policy checked</span>
                    </div>
                    <div className={styles.decisionRow}>
                      <StepDoneIcon />
                      <span>Refund amount confirmed</span>
                    </div>
                    <div className={styles.decisionRow}>
                      <span className={styles.pulseWrap}>
                        <span className={styles.pulseDot} />
                      </span>
                      <span>⏳ Transferring to human agent</span>
                    </div>
                  </div>
                </section>

                <p className={styles.sheetNote}>
                  Key information from this session is being recorded to ensure seamless service continuity.
                </p>
              </div>
            </div>
          </>
        )}

        {orderSheetOpen && (
          <>
            <button type="button" className={styles.sheetOverlay} aria-label="Close overlay" onClick={() => setOrderSheetOpen(false)} />
            <div
              className={`${styles.sheetPanel} ${styles.orderSheetPanel}`}
              role="dialog"
              aria-labelledby="p4-order-sheet-title"
            >
              <div className={styles.sheetHeader}>
                <h2 id="p4-order-sheet-title" className={styles.sheetTitle}>
                  Select Order
                </h2>
                <button type="button" className={styles.sheetClose} aria-label="Close" onClick={() => setOrderSheetOpen(false)}>
                  ✕
                </button>
              </div>
              <div className={styles.sheetDivider} />
              <div className={`${styles.sheetBody} ${styles.sheetBodyFlush}`}>
                <div className={styles.orderList} role="listbox" aria-label="Orders">
                  {MOCK_ORDERS.map((order) => {
                    const selected = pendingOrderId === order.id;
                    return (
                      <button
                        key={order.id}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`${styles.orderRow} ${selected ? styles.orderRowSelected : ""}`}
                        onClick={() => setPendingOrderId(order.id)}
                      >
                        {selected ? <RowSelectedCheckIcon /> : <span className={styles.orderRowCheckSpacer} aria-hidden />}
                        <span className={styles.orderRowText}>{order.sheetLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.orderSheetFooter}>
                <button type="button" className={styles.orderConfirmBtn} onClick={confirmOrderSelection}>
                  Confirm Selection
                </button>
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
              onChange={(e) => setInputValue(e.targetValue)}
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
