import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import appStyles from "../App.module.css";
import styles from "./Page4.module.css";
import { TopNav } from "../components/TopNav.jsx";

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

const SUMMARY_DETAILS = {
  flight: "Shanghai → Beijing",
  order: "C12345678",
  refund: "CNY 680 (after fee)"
};

const REQUEST_OPTIONS = [
  "Refund Application",
  "Flight Rebooking",
  "Hotel Cancellation",
  "Order Inquiry"
];

const EDIT_FIELD_STYLE = {
  width: "100%",
  border: "1.5px solid #1677FF",
  borderRadius: "6px",
  background: "white",
  fontSize: "14px",
  color: "#595959",
  outline: "none",
  padding: "6px 8px",
  boxSizing: "border-box",
  fontFamily: "inherit",
  marginTop: "4px"
};

const EDIT_ROW_STYLE = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  marginBottom: "10px"
};

const READ_ROW_STYLE = {
  display: "flex",
  gap: "8px",
  alignItems: "flex-start"
};

const LABEL_STYLE = {
  fontWeight: 600,
  fontSize: "14px",
  color: "#1f1f1f"
};

const READ_LABEL_STYLE = { ...LABEL_STYLE, minWidth: "80px" };

const READ_ONLY_VALUE_STYLE = {
  fontSize: "14px",
  color: "#8c8c8c",
  lineHeight: 1.5
};

const VALUE_STYLE = {
  fontSize: "14px",
  color: "#595959",
  lineHeight: 1.5
};

function buildSummaryText(selectedRequest, noteText) {
  const summary = [
    `Flight: ${SUMMARY_DETAILS.flight}`,
    `Order: ${SUMMARY_DETAILS.order}`,
    `Refund: ${SUMMARY_DETAILS.refund}`,
    `Request: ${selectedRequest}`
  ];

  const note = noteText.trim();
  if (note) {
    summary.push(`Note: ${note}`);
  }

  return summary.join("\n");
}

export function Page4Confirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const incomingState = location.state || {};

  const [confirmed, setConfirmed] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState("Refund Application");
  const [noteText, setNoteText] = useState("");
  const scrollEndRef = useRef(null);

  const summaryText = useMemo(
    () => buildSummaryText(selectedRequest, noteText),
    [selectedRequest, noteText]
  );
  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const goPage3 = () => {
    navigate(-1);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDoneClick = () => {
    setIsEditing(false);
  };

  const handleConfirmTransfer = () => {
    setConfirmed(true);
  };

  useEffect(() => {
    if (!confirmed) return;
    const t = setTimeout(() => {
      navigate("/page5", {
        state: {
          ...incomingState,
          userSummary: summaryText,
          transferFromPage4: true
        }
      });
    }, 1500);
    return () => clearTimeout(t);
  }, [confirmed, navigate, incomingState, summaryText]);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [confirmed, isEditing]);

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    navigate("/page5", {
      state: { ...incomingState, userSummary: summaryText, message: text }
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
      <section className={appStyles.mobileFrame}>
        <TopNav variant="chat" onBack={() => navigate(-1)} />

        <div
          className={styles.chatScroll}
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "8px",
                      marginBottom: "12px"
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "#1f1f1f"
                      }}
                    >
                      Your Request Summary
                    </h3>
                    {!confirmed && (
                      <button
                        type="button"
                        onClick={isEditing ? handleDoneClick : handleEditClick}
                        style={{
                          background: "none",
                          border: "none",
                          padding: "4px 8px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: isEditing ? "#52C41A" : "#1677FF",
                          cursor: "pointer"
                        }}
                      >
                        {isEditing ? "Done" : "Edit"}
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      padding: "12px",
                      width: "100%",
                      minHeight: "270px",
                      boxSizing: "border-box"
                    }}
                  >
                    <div style={READ_ROW_STYLE}>
                      <span style={READ_LABEL_STYLE}>Flight:</span>
                      <span style={isEditing ? READ_ONLY_VALUE_STYLE : VALUE_STYLE}>
                        {isEditing ? "Locked · " : ""}
                        {SUMMARY_DETAILS.flight}
                      </span>
                    </div>

                    <div style={READ_ROW_STYLE}>
                      <span style={READ_LABEL_STYLE}>Order:</span>
                      <span style={isEditing ? READ_ONLY_VALUE_STYLE : VALUE_STYLE}>
                        {isEditing ? "Locked · " : ""}
                        {SUMMARY_DETAILS.order}
                      </span>
                    </div>

                    <div style={READ_ROW_STYLE}>
                      <span style={READ_LABEL_STYLE}>Refund:</span>
                      <span style={isEditing ? READ_ONLY_VALUE_STYLE : VALUE_STYLE}>
                        {isEditing ? "Locked · " : ""}
                        {SUMMARY_DETAILS.refund}
                      </span>
                    </div>

                    {isEditing ? (
                      <div style={EDIT_ROW_STYLE}>
                        <span style={LABEL_STYLE}>Request:</span>
                        <select
                          value={selectedRequest}
                          onChange={(e) => setSelectedRequest(e.target.value)}
                          style={EDIT_FIELD_STYLE}
                        >
                          {REQUEST_OPTIONS.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div style={READ_ROW_STYLE}>
                        <span style={READ_LABEL_STYLE}>Request:</span>
                        <span style={VALUE_STYLE}>{selectedRequest}</span>
                      </div>
                    )}

                    {isEditing ? (
                      <div style={{ marginTop: "12px" }}>
                        <label
                          htmlFor="request-note"
                          style={{ ...LABEL_STYLE, display: "block", marginBottom: "6px" }}
                        >
                          Add Note:
                        </label>
                        <textarea
                          id="request-note"
                          placeholder="Add any extra details for the agent..."
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            border: "1.5px solid #1677FF",
                            borderRadius: "6px",
                            padding: "8px",
                            fontSize: "14px",
                            color: "#595959",
                            lineHeight: 1.5,
                            resize: "none",
                            fontFamily: "inherit",
                            boxSizing: "border-box",
                            outline: "none"
                          }}
                        />
                      </div>
                    ) : (
                      noteText.trim() && (
                        <p
                          style={{
                            margin: "12px 0 0",
                            fontSize: "13px",
                            color: "#8c8c8c",
                            fontStyle: "italic",
                            lineHeight: 1.5
                          }}
                        >
                          Note: {noteText.trim()}
                        </p>
                      )
                    )}
                  </div>

                  <p
                    style={{
                      margin: "12px 0 0",
                      fontSize: "12px",
                      color: "#8c8c8c",
                      fontStyle: "italic",
                      lineHeight: 1.5
                    }}
                  >
                    You can edit this summary to make sure your situation is accurately represented before connecting to a human agent.
                  </p>
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
                    cursor: "pointer",
                    opacity: isEditing ? 0.5 : 1
                  }}
                  onClick={handleConfirmTransfer}
                  disabled={isEditing}
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
                  onClick={goPage3}
                >
                  Edit Information
                </button>
              </div>
            )}

            <div ref={scrollEndRef} />
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
