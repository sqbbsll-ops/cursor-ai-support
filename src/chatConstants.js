export const QUICK_CHIPS = [
  { label: "Cancel Flight", message: "I'd like to cancel my flight" },
  { label: "Change Flight", message: "I'd like to change my flight" },
  { label: "Cancel Hotel", message: "I'd like to cancel my hotel" },
  { label: "Order Status", message: "I'd like to check my order status" },
  { label: "Talk to Human Agent", message: "I'd like to talk to a human agent" }
];

export const SUGGESTED_TOPICS = [
  { label: "Cancel Flight", message: "I'd like to cancel my flight" },
  { label: "Change Flight", message: "I'd like to change my flight" },
  { label: "Cancel Hotel", message: "I'd like to cancel my hotel" },
  { label: "Order Status", message: "I'd like to check my order status" },
  { label: "Talk to Human Agent", message: "I'd like to talk to a human agent" }
];

export function detectIntent(message) {
  const text = message.toLowerCase();
  const hasFlightOrTicket = text.includes("flight") || text.includes("ticket");

  if (text.includes("refund") && hasFlightOrTicket) {
    return "flight_refund";
  }

  if (text.includes("cancel") && hasFlightOrTicket && !text.includes("hotel")) {
    return "flight_refund";
  }

  if (text.includes("change") && hasFlightOrTicket) {
    return "change_flight";
  }

  if ((text.includes("rebook") || text.includes("reschedule")) && hasFlightOrTicket) {
    return "flight_rebooking";
  }

  if (text.includes("cancel") && text.includes("hotel")) {
    return "hotel_cancellation";
  }

  if (text.includes("order") || text.includes("status")) {
    return "order_inquiry";
  }

  if (text.includes("human") || text.includes("agent")) {
    return "human_agent";
  }

  return "general_inquiry";
}

export const MOCK_ORDER_INFO = {
  orderId: "C12345678",
  route: "Shanghai → Beijing",
  departure: "April 28, 14:00"
};

export const MOCK_FLIGHT_BOOKING_ORDER = {
  orderId: "C12345678",
  route: "Shanghai (PVG) → Beijing (PEK)",
  departure: "April 28, 14:00"
};

export const MOCK_HOTEL_ORDER = {
  orderId: "H98765432",
  hotel: "Grand Hyatt Shanghai",
  checkIn: "April 27",
  checkOut: "April 29"
};

export const MOCK_ORDER_INQUIRY_INFO = {
  type: "Flight Ticket",
  route: "Shanghai (PVG) → Beijing (PEK)",
  orderId: "C12345678",
  status: "Confirmed"
};

export function isFlightBookingIntent(intent) {
  return intent === "flight_refund" || intent === "flight_rebooking" || intent === "change_flight";
}

/** Matches Page 2 AI message before the booking card (flight intents). */
export const PAGE2_FLIGHT_LOOKUP_AI_TEXT =
  "Got it! Let me look up your recent bookings. One moment please...";

/** Serialized turns for Page 3 to replay the Page 2 flight booking thread. */
export function buildFlightBookingMessageHistory(userMessage) {
  return [
    { role: "user", text: userMessage },
    { role: "ai", text: PAGE2_FLIGHT_LOOKUP_AI_TEXT },
    { role: "ai", type: "booking_card" }
  ];
}

export const HUMAN_AGENT_PROMPT_TEXT =
  "It looks like you'd like to speak with a human agent. Would you like me to transfer you now, or would you prefer to continue with AI assistance?";

export const HUMAN_AGENT_CONTINUE_AI_TEXT =
  "No problem! I'm here to help. What else can I assist you with?";

export const DEFAULT_REQUEST_SUMMARY_TEXT =
  "You contacted us about cancelling your Shanghai to Beijing flight on April 28th. You initially explored rebooking options but decided a refund would work better for you. The refund amount would be CNY 680 after a CNY 50 processing fee, with a timeline of 3-5 business days.";
