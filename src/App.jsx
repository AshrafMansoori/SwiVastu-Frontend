import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getCurrentUser } from "./features/auth/authSlice";

import Landing from "./pages/Landing/landing.jsx";
import Register from "./pages/authPages/register.jsx";
import Login from "./pages/authPages/login.jsx";
import ProtectedRoute from "./components/Layout/protectedRoute";

function App() {

  const dispatch = useDispatch();

  // Check logged-in user when app starts / refreshes
  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={<Landing />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/home"
          element={<h1>Home Page</h1>}
        />
        <Route
          path="/home"
          element={

            <h1>Home Page</h1>

          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;