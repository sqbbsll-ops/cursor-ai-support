import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import appStyles from "../App.module.css";
import { TopNav } from "../components/TopNav.jsx";
import { detectIntent, QUICK_CHIPS, SUGGESTED_TOPICS } from "../chatConstants.js";

export function HomePage() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");

  const canSend = useMemo(() => inputValue.trim().length > 0, [inputValue]);

  const navigateWithPresetMessage = (message) => {
    navigate("/understanding", {
      state: {
        message,
        intent: detectIntent(message)
      }
    });
  };

  const handleSubmit = () => {
    const message = inputValue.trim();
    if (!message) return;

    navigate("/understanding", {
      state: {
        message,
        intent: detectIntent(message)
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
      <section className={appStyles.mobileFrame}>
        <TopNav variant="orders" onBack={() => navigate(-1)} />

        <div className={appStyles.contentArea} role="region" aria-label="Chat and suggested topics">
          <section className={appStyles.welcomeRow}>
            <div className={appStyles.aiAvatar} aria-hidden="true">
              <svg viewBox="0 0 24 24" className={appStyles.avatarIcon} xmlns="http://www.w3.org/2000/svg">
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
            <div className={appStyles.aiBubble}>Hello! How can I help you today?</div>
          </section>

          <section className={appStyles.topicsCard}>
            <div className={appStyles.topicsHeader}>
              <h2 className={appStyles.topicsTitle}>Suggested Topics</h2>
              <button type="button" className={appStyles.refreshButton} aria-label="Refresh suggested topics">
                <span className={appStyles.refreshText}>Refresh</span>
                <svg
                  className={appStyles.refreshIcon}
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#999999"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              </button>
            </div>
            <div className={appStyles.topicList}>
              {SUGGESTED_TOPICS.map((topic) => (
                <button
                  key={topic.label}
                  type="button"
                  className={appStyles.topicItem}
                  onClick={() => navigateWithPresetMessage(topic.message)}
                >
                  <svg
                    className={appStyles.topicBullet}
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <circle cx="4" cy="4" r="4" fill="#1677FF" />
                  </svg>
                  <span className={appStyles.topicText}>{topic.label}</span>
                  <svg
                    className={appStyles.topicChevronIcon}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M10 6l6 6-6 6"
                      stroke="#C0C0C0"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className={appStyles.bottomSection}>
          <div className={appStyles.chipsRow} role="list" aria-label="Quick tags">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.label}
                type="button"
                className={appStyles.quickChip}
                onClick={() => navigateWithPresetMessage(chip.message)}
              >
                {chip.label}
              </button>
            ))}
          </div>

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
              onChange={(event) => setInputValue(event.target.value)}
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
