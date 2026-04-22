import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import dash from "./AgentDashboard.module.css";
import styles from "./AgentHistory.module.css";

/** @type {{ id: string; date: string; customer: string; issueType: string; orderNo: string; status: string; duration: string }[]} */
const HISTORY_ROWS = [
  { id: "h1", date: "Apr 21", customer: "Zhang Wei", issueType: "Flight Refund", orderNo: "C12345678", status: "Resolved", duration: "8m 32s" },
  { id: "h2", date: "Apr 21", customer: "Li Ming", issueType: "Hotel Cancellation", orderNo: "H98765432", status: "Resolved", duration: "5m 14s" },
  { id: "h3", date: "Apr 20", customer: "Wang Fang", issueType: "Order Inquiry", orderNo: "C87654321", status: "Resolved", duration: "3m 45s" },
  { id: "h4", date: "Apr 20", customer: "Chen Jing", issueType: "Flight Rebooking", orderNo: "C11223344", status: "Resolved", duration: "12m 08s" },
  { id: "h5", date: "Apr 19", customer: "Liu Yang", issueType: "Hotel Cancellation", orderNo: "H55667788", status: "Resolved", duration: "6m 22s" },
  { id: "h6", date: "Apr 19", customer: "Zhao Lei", issueType: "Flight Refund", orderNo: "C99887766", status: "Resolved", duration: "9m 55s" },
  { id: "h7", date: "Apr 18", customer: "Sun Wei", issueType: "Order Inquiry", orderNo: "C44332211", status: "Resolved", duration: "2m 30s" },
  { id: "h8", date: "Apr 18", customer: "Wu Fang", issueType: "Flight Rebooking", orderNo: "C77665544", status: "Resolved", duration: "15m 40s" }
];

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

export function AgentHistory() {
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HISTORY_ROWS;
    return HISTORY_ROWS.filter((row) =>
      [row.customer, row.issueType, row.orderNo, row.date, row.status, row.duration]
        .some((field) => field.toLowerCase().includes(q))
    );
  }, [query]);

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
            <Link to="/agent" className={`${dash.navItem} ${dash.navItemLink}`}>
              📋 Work Queue
            </Link>
            <button type="button" className={dash.navItem}>
              💬 Active Chats
            </button>
            <Link
              to="/agent/history"
              className={`${dash.navItem} ${dash.navItemActive} ${dash.navItemLink}`}
            >
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
        <header className={dash.header}>
          <h1 className={dash.headerTitle}>Chat History</h1>
          <div className={dash.headerRight}>
            <button type="button" className={dash.iconBtn} aria-label="Notifications">
              <BellIcon />
            </button>
            <div className={dash.headerAvatar} aria-hidden="true" />
          </div>
        </header>

        <div className={dash.content}>
          <div className={styles.searchRow}>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Search history..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search history"
            />
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead className={styles.tableHead}>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Issue Type</th>
                  <th>Order No.</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyResults}>
                      No history matches your search.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr key={row.id} className={styles.tableRow} tabIndex={0}>
                      <td>{row.date}</td>
                      <td className={styles.customerName}>{row.customer}</td>
                      <td>{row.issueType}</td>
                      <td className={styles.orderNo}>{row.orderNo}</td>
                      <td>
                        <span className={styles.statusBadge}>{row.status}</span>
                      </td>
                      <td className={styles.duration}>{row.duration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
