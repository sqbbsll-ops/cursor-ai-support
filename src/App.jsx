import { Route, Routes } from "react-router-dom";
import { HomePage } from "./pages/HomePage.jsx";
import { Page2Understanding } from "./pages/Page2Understanding.jsx";
import { Page3Clarification } from "./pages/Page3Clarification.jsx";
import { Page4Confirmation } from "./pages/Page4Confirmation.jsx";
import { Page5Waiting } from "./pages/Page5Waiting.jsx";
import { Page6HumanAgent } from "./pages/Page6HumanAgent.jsx";
import { AgentDashboard } from "./pages/agent/AgentDashboard.jsx";
import { AgentChat } from "./pages/agent/AgentChat.jsx";
import { AgentHistory } from "./pages/agent/AgentHistory.jsx";

function App() {
  return (
    <Routes>
      <Route path="/agent" element={<AgentDashboard />} />
      <Route path="/agent/history" element={<AgentHistory />} />
      <Route path="/agent/chat/:sessionId" element={<AgentChat />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/understanding" element={<Page2Understanding />} />
      <Route path="/page3" element={<Page3Clarification />} />
      <Route path="/page4" element={<Page4Confirmation />} />
      <Route path="/page5" element={<Page5Waiting />} />
      <Route path="/page6" element={<Page6HumanAgent />} />
    </Routes>
  );
}

export default App;
