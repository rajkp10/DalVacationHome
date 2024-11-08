import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUp from "./components/SignUp/SignUp";
import SignIn from "./components/SignIn/SignIn";
import NavBar from "./components/NavBar/NavBar";
import ViewRooms from "./components/ViewRooms/ViewRooms";
import RoomDetailsForm from "./components/RoomDetailsForm/RoomDetailsForm";
import ChatPage from "./components/ChatPage/ChatPage";
import { ChatProvider } from "./context/ChatContext";
import Dashboard from "./components/Dashboard/Dashboard";
import RoomDetails from "./components/ViewRoom/RoomDetails";
import ChatPopup from "./components/ChatPopup/ChatPopup";
import BookingHistory from "./components/BookingHistory/BookingHistory";

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/" element={<ViewRooms />} />
          <Route path="/add-room" element={<RoomDetailsForm />} />
          <Route path="/edit-room/:roomId" element={<RoomDetailsForm />} />
          <Route path="/room/:id" element={<RoomDetails />} />
          <Route path="/booking-history" element={<BookingHistory />} />
          <Route
            path="/concerns"
            element={
              <ChatProvider>
                <ChatPage />
              </ChatProvider>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
        <ChatPopup />
      </div>
    </Router>
  );
}

export default App;
