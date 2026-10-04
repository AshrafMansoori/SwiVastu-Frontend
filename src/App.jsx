import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/landing.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Landing/>} />

        <Route path="/login" element={<h1>Login Page</h1>} />

        <Route path="/register" element={<h1>Register Page</h1>} />

        <Route path="/home" element={<h1>Home Page</h1>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;