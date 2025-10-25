
import { BrowserRouter, Routes, Route} from "react-router-dom";
//  import Register from "../features/auth/register/Register";
// import Home from "../features/auth/register/Home";
import "./app.css";
import SubscriptionPage from "./components/SubscriptionPage";
import BibliothequesDashboard from "./components/BibiothequeDashboard";
import PlanFeatureManager from "./components/PlanFeatureManager";

function App() {
  
  return (
      <BrowserRouter>
      <Routes>
        {/* Redirection de la racine vers /register */}
        {/* <Route path="/" element={<Home />} /> */}

        {/* Inscription multi-étapes */}
         {/* <Route path="/" element={<Register />} />  */}
         <Route path="/subscription" element={<SubscriptionPage />} />
         <Route path="/catalogue" element={<BibliothequesDashboard />} />
         <Route path="/feature" element={<PlanFeatureManager />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
