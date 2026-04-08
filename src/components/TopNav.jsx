import appStyles from "../App.module.css";

function ClipboardIcon({ className }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function TopNav({ onBack, variant = "orders", subtitle = "AI Assistant is ready to help" }) {
  return (
    <header className={`${appStyles.topNav} ${variant === "chat" ? appStyles.topNavChat : ""}`}>
      <button type="button" className={appStyles.iconButton} aria-label="Go back" onClick={onBack}>
        <span aria-hidden="true">←</span>
      </button>
      <div className={appStyles.navTitleWrap}>
        <h1 className={appStyles.navTitle}>Customer Service</h1>
        <div className={appStyles.navSubtitle}>{subtitle}</div>
      </div>
      {variant === "orders" ? (
        <button type="button" className={appStyles.ordersButton} aria-label="Orders">
          <span className={appStyles.ordersIcon} aria-hidden="true">
            📋
          </span>
          <span className={appStyles.ordersText}>Orders</span>
        </button>
      ) : (
        <button type="button" className={appStyles.clipboardIconButton} aria-label="Orders">
          <ClipboardIcon className={appStyles.clipboardSvg} />
        </button>
      )}
    </header>
  );
}
