import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import { getCurrentUser } from "./features/auth/authSlice";

import Landing from "./pages/Landing/landing.jsx";
import Register from "./pages/authPages/register.jsx";
import Login from "./pages/authPages/login.jsx";
import ProtectedRoute from "./components/Layout/protectedRoute";
import Home from "./pages/Home/Home.jsx";
import ItemDetails from "./pages/ItemDetails/ItemDetails.jsx";
import CreateItem from "./pages/CreateItem/CreateItem.jsx";
import MyItems from "./pages/MyItems/MyItems.jsx";
import Requests from "./pages/Requests/Requests.jsx";
import Profile from "./pages/Profile/Profile.jsx";
import Messages from "./pages/Messages/Messages.jsx";
import Wishlist from "./pages/Wishlist/Wishlist.jsx";
import Notifications from "./pages/Notifications/Notifications.jsx";


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

        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

        <Route path="/item/:id" element={<ItemDetails />} />
        <Route path="/create-item" element={<ProtectedRoute><CreateItem /></ProtectedRoute>} />
        <Route path="/my-items" element={<ProtectedRoute><MyItems /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/chat/:transactionType/:transactionId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;