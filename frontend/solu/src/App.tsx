
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "../features/auth/register/Register";

function App() {
  
  return (
      <BrowserRouter>
      <Routes>
        {/* Redirection de la racine vers /register */}
        <Route path="/" element={<Navigate to="/register" />} />

        {/* Inscription multi-étapes */}
        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
