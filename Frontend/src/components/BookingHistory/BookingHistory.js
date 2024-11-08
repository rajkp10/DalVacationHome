import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Container, Typography, Card, CardContent } from "@mui/material";
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = `${process.env.REACT_APP_BOOKING_AND_VIEW_BASE_URL}`;

const BookingHistory = () => {
  const { authState } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const userId = authState.userId;

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/get-booking-by-userid?userId=${userId}`
        );
        const userBookings = response.data.data.filter(
          (booking) => booking.userId === userId
        );
        setBookings(userBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [userId]);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        User Bookings
      </Typography>
      {bookings.map((booking) => (
        <Card key={booking.id} style={{ marginBottom: "20px" }}>
          <CardContent>
            <Typography variant="h5">Booking ID: {booking.id}</Typography>
            <Typography variant="h6">
              Room Number: {booking.roomNumber}
            </Typography>
            <Typography color="textSecondary">
              Booking Date: {new Date(booking.createdAt).toLocaleDateString()}
            </Typography>
            <Typography color="textSecondary">
              Start Date: {new Date(booking.startDate).toLocaleDateString()}
            </Typography>
            <Typography color="textSecondary">
              End Date: {new Date(booking.endDate).toLocaleDateString()}
            </Typography>
            <Typography color="textSecondary">
              Total Price: ${booking.totalPrice}
            </Typography>
            <Typography color="textSecondary">
              Status: {booking.status}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default BookingHistory;
