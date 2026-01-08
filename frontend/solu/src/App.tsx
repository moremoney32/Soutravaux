
import { BrowserRouter, Routes, Route} from "react-router-dom";
  // import Register from "../features/auth/register/Register";
// import Home from "../features/auth/register/Home";
import "./app.css";
import SubscriptionPage from "./components/SubscriptionPage";
import BibliothequesDashboard from "./components/BibiothequeDashboard";
import PlanFeatureManager from "./components/PlanFeatureManager";
import PushNotificationAppPushNotifications from "./components/PushNotificationAppPushNotifications";
import CampagnePage from "./components/CampagnePage";
import CreateListePage from "./components/CreateListePage";
import CampagneDetails from "./components/CampagneDetails";
import AchatSMSPage from "./components/AchatSMSPage";
import ScrapingPage from "./components/ScrapingPage";
import GoogleCalendar from "./components/GoogleCalendar";

function App() {
  
  return (
      <BrowserRouter>
      <Routes>
        {/* Redirection de la racine vers /register */}
        {/* <Route path="/" element={<Home />} /> */}

        {/* Inscription multi-étapes */}
           {/* <Route path="/" element={<Register />} />    */}
         <Route path="/subscription" element={<SubscriptionPage />} />
         <Route path="/catalogue" element={<BibliothequesDashboard />} />
         <Route path="/feature" element={<PlanFeatureManager />} />
          <Route path="/notifications" element={<PushNotificationAppPushNotifications />} />
           <Route path="/campagne/:membreId" element={<CampagnePage/>} />
           <Route path="/statistique/campaigns/:campagneId" element={<CampagneDetails />} />
           <Route path="/create-liste" element={<CreateListePage />} />
            <Route path="/campagne/:membreId/achat-sms" element={<AchatSMSPage />} /> 
             <Route path="/scraping" element={<ScrapingPage/>} />
                <Route path="/calendar/:societeId" element={<GoogleCalendar/>} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
