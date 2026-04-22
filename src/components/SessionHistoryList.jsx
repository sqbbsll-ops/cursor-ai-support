/**
 * Compact session-history list used inside the Service Summary bottom sheet
 * on the user-facing pages (Page 2 and Page 3).
 *
 * Each row renders: timestamp (gray, 12px) + message preview (14px).
 * Rows are separated with a 1px light divider; the last row has no border.
 *
 * @param {{ rows: { time: string; text: string }[] }} props
 */
export function SessionHistoryList({ rows }) {
  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column"
      }}
    >
      {rows.map((row, i) => (
        <li
          key={`${i}-${row.text}`}
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "10px",
            padding: "8px 0",
            borderBottom: i === rows.length - 1 ? "none" : "1px solid #F0F0F0"
          }}
        >
          <span
            style={{
              color: "#8c8c8c",
              fontSize: "12px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              minWidth: "68px"
            }}
          >
            {row.time}
          </span>
          <span style={{ color: "#1f1f1f", fontSize: "14px", lineHeight: 1.4 }}>
            {row.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
