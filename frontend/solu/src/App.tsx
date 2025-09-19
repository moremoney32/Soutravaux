
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Register from "../features/auth/register/Register";
import Home from "../features/auth/register/Home";
import "./app.css";

function App() {
  
  return (
      <BrowserRouter>
      <Routes>
        {/* Redirection de la racine vers /register */}
        <Route path="/" element={<Home />} />

        {/* Inscription multi-étapes */}
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
