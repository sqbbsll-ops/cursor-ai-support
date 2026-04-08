import { MOCK_FLIGHT_BOOKING_ORDER } from "../chatConstants.js";
import styles from "../pages/Page3.module.css";

/**
 * Flight booking summary card (Page 2 / history). Omit choice buttons when replaying prior session.
 */
export function BookingOfferMessage({ order = MOCK_FLIGHT_BOOKING_ORDER }) {
  return (
    <div className={styles.aiBubbleStack}>
      <div className={styles.aiBubbleText}>
        <p className={styles.bubbleLead}>I found your most recent flight booking:</p>
        <div className={styles.bookingMeta}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Route:</span>
            <span className={styles.metaValue}>{order.route}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Departure:</span>
            <span className={styles.metaValue}>{order.departure}</span>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Order No.:</span>
            <span className={styles.metaValue}>{order.orderId}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
