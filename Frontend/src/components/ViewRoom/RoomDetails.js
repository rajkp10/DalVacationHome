import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Typography,
  TextField,
  Container,
  Card,
  CardContent,
  CardMedia,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { parseISO, isSameDay } from "date-fns";
import axios from "axios";

// Assuming you have an AuthContext that provides these values
import { AuthContext } from "../../context/AuthContext";

const BASE_URL = `${process.env.REACT_APP_BOOKING_AND_VIEW_BASE_URL}`;

function RoomDetails() {
  const { state: room } = useLocation();
  const { authState } = useContext(AuthContext); // This needs to be defined in your context provider
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [unavailableDates, setUnavailableDates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");

  useEffect(() => {
    fetchBookingDates(room.roomNumber);
    fetchReviews(room.roomNumber);
  }, [room.roomNumber]);

  const fetchReviews = async (roomNumber) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get-room-reviews?roomNumber=${roomNumber}`
      );
      console.log("JinxLord", response);
      setReviews(response.data.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  function getDatesBetween(startDateStr, endDateStr) {
    const dateArray = [];
    let currentDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    while (currentDate <= endDate) {
      dateArray.push(currentDate.toISOString().split("T")[0]);
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    return dateArray;
  }

  const fetchBookingDates = async (roomNumber) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/get-room-bookings?roomNumber=${roomNumber}`
      );
      console.log(response);
      const bookings = response.data.data;

      let allUnavailableDates = [];
      bookings.forEach((booking) => {
        const dates = getDatesBetween(booking.startDate, booking.endDate);
        allUnavailableDates = [...allUnavailableDates, ...dates];
      });

      // Ensure unique dates only, prevent duplicates if booking periods overlap
      const uniqueDates = Array.from(new Set(allUnavailableDates));
      setUnavailableDates(uniqueDates);
    } catch (error) {
      console.error("Error fetching booking dates:", error);
    }
  };

  const shouldDisableDate = (date) => {
    return unavailableDates.some((unavailableDate) =>
      isSameDay(date, parseISO(unavailableDate))
    );
  };

  const handleReserve = async () => {
    if (!authState.userId) {
      alert("Please log in to reserve a room.");
      return;
    }

    // {
    //     "roomNumber": "101",
    //     "startDate": "Mon Jul 29 2024",
    //     "endDate": "Wed Jul 31 2024",
    //     "totalNights": 2,
    //     "totalPrice": 1650,
    //     "userId": "fijata8852@tiervio.com"
    //   }

    const bookingDetails = {
      userId: authState.userId,
      roomNumber: room.roomNumber,
      startDate: checkInDate,
      endDate: checkOutDate,
      roomType: "NA",
      //   price: room.price,
      totalNights: calculateNights(checkInDate, checkOutDate),
      totalPrice: calculateTotalPrice(checkInDate, checkOutDate, room.price),
    };

    try {
      const response = await fetch(`${BASE_URL}/reserve-room`, {
        method: "POST",
        // headers: {
        //     "Access-Control-Allow-Origin": "*", // Adjust this to a more restrictive setting for production
        //     "Access-Control-Allow-Credentials": true,
        //     // "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
        //     // "Access-Control-Allow-Methods": "OPTIONS,POST",
        //     'Content-Type': 'application/json',
        // },
        body: JSON.stringify(bookingDetails),
      });

      console.log(bookingDetails);

      const result = await response.json();
      const details = JSON.parse(result.body);
      console.log(details);
      if (result.statusCode < 300) {
        alert("Room reserved successfully!");
      } else {
        alert("Failed to reserve room.");
      }

      const BOOKING_APPROVAL_ENDPOINT =
        "https://qodru6twjuhqz7j646xnls442q0qqsua.lambda-url.us-east-1.on.aws/";

      const BOOKING_CONFIRMATION_ENDPOINT =
        "https://w3s4tiihf5f6wx4lpzdutmknle0nljvg.lambda-url.us-east-1.on.aws/";

      const headers = {
        "Content-Type": "application/json",
      };

      axios
        .post(
          BOOKING_APPROVAL_ENDPOINT,
          { email: details.details.userId, booking_id: details.details.id },
          { headers }
        )
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });

      axios
        .post(
          BOOKING_CONFIRMATION_ENDPOINT,
          {
            email: details.details.userId,
            booking_id: details.details.id,
            booking_details: details.details,
            event_type: "booking_confirmation",
          },
          { headers }
        )
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Failed to reserve room:", error);
      alert("Error reserving room.");
    }
  };

  const calculateNights = (start, end) => {
    if (start && end) {
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // milliseconds to days
    }
    return 0;
  };
  const calculateTotalPrice = (start, end, price) =>
    calculateNights(start, end) * price;

  const nights = calculateNights(checkInDate, checkOutDate);
  console.log(nights, checkInDate, checkOutDate);
  //   const totalPrice = nights * room.price;
  const totalPrice = calculateTotalPrice(checkInDate, checkOutDate, room.price);
  const serviceFee = Math.round(totalPrice * 0.15); // Assuming 15% service fee
  const total = totalPrice + serviceFee;

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!authState.userId) {
      alert("You must be logged in to post a review.");
      return;
    }

    try {
      const payload = {
        roomNumber: room.roomNumber,
        userId: authState.userId,
        text: reviewText,
      };
      await axios.post(`${BASE_URL}/create-review`, payload);
      setReviewText(""); // Clear the input after posting
      fetchReviews(room.roomNumber); // Refresh the reviews
    } catch (error) {
      console.error("Error posting review:", error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Card>
        <CardMedia
          component="img"
          height="194"
          image={room.roomPicture}
          alt={`Room ${room.roomNumber}`}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
            {room.roomType} - Room {room.roomNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Features: {room.features.join(", ")}
          </Typography>
          <Typography variant="body1">
            Price per night: ${room.price}
          </Typography>

          {authState.role == "customer" ? (
            <div>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Check-in"
                  value={checkInDate}
                  onChange={setCheckInDate}
                  renderInput={(params) => <TextField {...params} />}
                  shouldDisableDate={shouldDisableDate}
                />
                <DatePicker
                  label="Check-out"
                  value={checkOutDate}
                  onChange={setCheckOutDate}
                  renderInput={(params) => <TextField {...params} />}
                  shouldDisableDate={shouldDisableDate}
                />
              </LocalizationProvider>
              <Box sx={{ mt: 2 }}>
                <Typography>
                  {nights} nights × ${room.price} CAD = ${totalPrice} CAD
                </Typography>
                <Typography>Service Fee: ${serviceFee} CAD</Typography>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total: ${total} CAD
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={handleReserve}
                >
                  Reserve
                </Button>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  You won't be charged yet
                </Typography>
              </Box>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Box>
        <Typography variant="h6">Customer Reviews</Typography>
        {reviews.map((review, index) => (
          <Box key={index} my={2}>
            <Typography variant="subtitle2">{review.userId}</Typography>
            <Typography variant="body2">{review.text}</Typography>
            {authState.role == "agent" ? (
              <Typography variant="body2">
                Sentiment Score: {review.sentimentScore}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Box>
      {authState.role == "customer" ? (
        <form onSubmit={handleReviewSubmit}>
          <TextField
            fullWidth
            label="Add a review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            variant="outlined"
            multiline
            rows={4}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">
            Submit Review
          </Button>
        </form>
      ) : (
        <Typography variant="body2">
          Please log in as customer to post a review.
        </Typography>
      )}
    </Container>
  );
}

export default RoomDetails;
