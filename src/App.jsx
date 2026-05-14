import { useMemo, useState } from "react";
import Layout from "./components/Layout.jsx";
import Dashboard from "./modules/Dashboard.jsx";
import ShadowingPractice from "./modules/ShadowingPractice.jsx";
import SentenceBuilder from "./modules/SentenceBuilder.jsx";
import InterviewPractice from "./modules/InterviewPractice.jsx";
import ListeningComprehension from "./modules/ListeningComprehension.jsx";
import Progress from "./modules/Progress.jsx";
import DailyPractice from "./modules/DailyPractice.jsx";
import TtsDebugPanel from "./components/TtsDebugPanel.jsx";
import { NAVIGATION_MODULES, contentLibrary } from "./services/contentService.js";

function App() {
  const [route, setRoute] = useState("dashboard");
  const [dailyMode, setDailyMode] = useState(false);
  const debugTts = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debugTts") === "1";
  const data = useMemo(() => contentLibrary, []);

  const navigate = (nextRoute) => {
    setDailyMode(nextRoute === "daily");
    setRoute(nextRoute === "daily" ? "daily" : nextRoute);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const routes = {
    dashboard: <Dashboard data={data} onNavigate={navigate} />,
    shadowing: <ShadowingPractice lessons={data.shadowing} />,
    sentenceBuilder: <SentenceBuilder lessons={data.sentenceBuilder} />,
    interviewPractice: <InterviewPractice lessons={data.interviewPractice} />,
    listeningComprehension: <ListeningComprehension lessons={data.listeningComprehension} />,
    progress: <Progress />,
    daily: <DailyPractice data={data} onNavigate={navigate} />
  };

  return (
    <Layout route={route} modules={NAVIGATION_MODULES} onNavigate={navigate} dailyMode={dailyMode}>
      {routes[route] || routes.dashboard}
      {debugTts ? <TtsDebugPanel /> : null}
    </Layout>
  );
}

export default App;
