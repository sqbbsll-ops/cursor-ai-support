import { useNavigate } from "react-router-dom";
import styles from "./AgentDashboard.module.css";

const WAITING_SESSIONS = [
  {
    id: "1",
    priority: true,
    userName: "Zhang Wei",
    initials: "ZW",
    issue: "Flight Refund",
    summary:
      "Wants refund for Shanghai→Beijing flight (Apr 28). Checked rebooking options first, then confirmed refund.",
    orderNo: "C12345678",
    waitDisplay: "3m 42s",
    waitLong: true
  },
  {
    id: "2",
    priority: false,
    userName: "Li Ming",
    initials: "LM",
    issue: "Hotel Cancellation",
    summary:
      "Requesting cancellation for Grand Hyatt Shanghai (Apr 27-29). No special circumstances noted.",
    orderNo: "H98765432",
    waitDisplay: "1m 15s",
    waitLong: false
  },
  {
    id: "3",
    priority: false,
    userName: "Wang Fang",
    initials: "WF",
    issue: "Order Inquiry",
    summary: "Checking status of flight order. Simple inquiry, no refund needed.",
    orderNo: "C87654321",
    waitDisplay: "0m 48s",
    waitLong: false
  }
];

function RobotLogoIcon() {
  return (
    <svg className={styles.logoIcon} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="8" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.5" cy="13" r="1.2" fill="currentColor" />
      <circle cx="14.5" cy="13" r="1.2" fill="currentColor" />
      <path d="M9 6.5h6M12 4v2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 22a2 2 0 002-2h-4a2 2 0 002 2zm6-6V11a6 6 0 10-12 0v5l-2 2h16l-2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AgentDashboard() {
  const navigate = useNavigate();
  const waitingCount = WAITING_SESSIONS.length;

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <RobotLogoIcon />
            <span>AI Support</span>
          </div>

          <div className={styles.agentBlock}>
            <div className={styles.agentAvatar} aria-hidden="true" />
            <div className={styles.agentMeta}>
              <span className={styles.agentName}>
                Agent: Sarah
                <span className={styles.onlineDot} title="Online" aria-label="Online" />
              </span>
            </div>
          </div>

          <nav className={styles.nav} aria-label="Agent navigation">
            <button type="button" className={`${styles.navItem} ${styles.navItemActive}`}>
              📋 Work Queue
            </button>
            <button type="button" className={styles.navItem}>
              💬 Active Chats
            </button>
            <button type="button" className={styles.navItem}>
              📊 Statistics
            </button>
            <button type="button" className={styles.navItem}>
              ⚙️ Settings
            </button>
          </nav>
        </div>

        <button type="button" className={styles.logout}>
          Logout
        </button>
      </aside>

      <div className={styles.rightWrap}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Work Queue</h1>
          <div className={styles.headerRight}>
            <input type="search" className={styles.search} placeholder="Search sessions..." aria-label="Search sessions" />
            <button type="button" className={styles.iconBtn} aria-label="Notifications">
              <BellIcon />
            </button>
            <div className={styles.headerAvatar} aria-hidden="true" />
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Waiting</div>
              <div className={`${styles.statValue} ${styles.statOrange}`}>3</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Active</div>
              <div className={`${styles.statValue} ${styles.statGreen}`}>1</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Resolved Today</div>
              <div className={`${styles.statValue} ${styles.statBlue}`}>12</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statLabel}>Avg. Wait Time</div>
              <div className={`${styles.statValue} ${styles.statGray}`}>2m 30s</div>
            </div>
          </div>

          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Waiting Sessions</h2>
            <span className={styles.badge}>{waitingCount}</span>
          </div>

          <div className={styles.sessionList}>
            {WAITING_SESSIONS.map((session) => (
              <article key={session.id} className={styles.sessionCard}>
                <div className={styles.sessionLeft}>
                  {session.priority ? (
                    <div className={styles.priorityBadge} title="High priority" aria-label="High priority">
                      !
                    </div>
                  ) : (
                    <div className={styles.prioritySpacer} aria-hidden="true" />
                  )}
                  <div className={styles.sessionBody}>
                    <div className={styles.userRow}>
                      <div className={styles.userAvatar} aria-hidden="true">
                        {session.initials}
                      </div>
                      <span className={styles.userName}>{session.userName}</span>
                      <span className={styles.issueTag}>{session.issue}</span>
                    </div>
                    <div className={styles.aiSummaryBlock}>
                      <div className={styles.aiSummaryLabel}>AI Summary</div>
                      <p className={styles.aiSummaryText}>{session.summary}</p>
                    </div>
                    <div className={styles.metaRow}>
                      <span>
                        <span className={styles.metaKey}>Order:</span>
                        {session.orderNo}
                      </span>
                      <span>
                        <span className={styles.metaKey}>Wait:</span>
                        <span className={session.waitLong ? styles.waitLong : undefined}>{session.waitDisplay}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className={styles.sessionRight}>
                  <button type="button" className={styles.acceptBtn} onClick={() => navigate(`/agent/chat/${session.id}`)}>
                    Accept
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
