import { Add } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AGENT } from "../../Utils/UserRole";

// const GET_ALL_ROOMS_URL = `${process.env.REACT_APP_BASE_URL}/rooms`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms";
// const GET_AGENT_ROOMS_URL = `${process.env.REACT_APP_BASE_URL}/rooms/agent`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms/agent";
// const DELETE_ROOM_URL = `${process.env.REACT_APP_BASE_URL}/rooms/delete`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms/delete";
const BASE_URL = process.env.REACT_APP_ROOM_AND_CHAT_BASE_URL;
const GET_ALL_ROOMS_URL = `${BASE_URL}/rooms`;
const GET_AGENT_ROOMS_URL = `${BASE_URL}/rooms/agent`;
const DELETE_ROOM_URL = `${BASE_URL}/rooms/delete`;

function ViewRooms() {
  const { authState } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    if (authState.role === AGENT) {
      await axios
        .get(`${GET_AGENT_ROOMS_URL}?userId=${authState.userId}`)
        .then((res) => {
          const data = JSON.parse(res.data.body);
          setRooms(data?.data);
        })
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));
    } else {
      console.log("api");
      await axios
        .get(GET_ALL_ROOMS_URL)
        .then((res) => {
          console.log(res);
          const data = JSON.parse(res.data.body);
          setRooms(data?.data);
        })
        .finally(() => setLoading(false));
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`${DELETE_ROOM_URL}?roomId=${id}`).then(() => {
      fetchRooms();
    });
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <Stack direction="row" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Container maxWidth="lg" style={{ marginBottom: "2rem" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Rooms
      </Typography>
      {authState.role === AGENT && (
        <Box mb={2} textAlign="end">
          <Button
            variant="contained"
            onClick={() => navigate("/add-room")}
            startIcon={<Add />}
          >
            Add Room
          </Button>
        </Box>
      )}
      <Grid container spacing={2}>
        {rooms.length === 0 ? (
          <Box width="100%" textAlign="center">
            <Typography variant="h6" gutterBottom>
              No rooms.
            </Typography>
          </Box>
        ) : (
          rooms.map((room) => {
            const { id, price, roomNumber, roomType, features, roomPicture } =
              room;
            return (
              <Grid item key={id} xs={12} sm={6} md={4}>
                <Card>
                  <CardMedia
                    sx={{ height: 140 }}
                    image={roomPicture}
                    title={roomNumber}
                  />
                  <CardContent>
                    <Stack direction="row" spacing={1}>
                      <Typography fontWeight="bold" gutterBottom>
                        Room Number:
                      </Typography>
                      <Typography>{roomNumber}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography fontWeight="bold" gutterBottom>
                        Room Type:
                      </Typography>
                      <Typography>{roomType}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography fontWeight="bold" gutterBottom>
                        Room Price:
                      </Typography>
                      <Typography>${price}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Typography fontWeight="bold" gutterBottom>
                        Room Features:
                      </Typography>
                      <Typography>
                        {features.map((feature) => (
                          <>{feature},</>
                        ))}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mt={2}
                    >
                      {authState.role === AGENT ? (
                        <>
                          <Button
                            variant="outlined"
                            onClick={() => navigate(`/edit-room/${id}`)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() =>
                              navigate(`/room/${id}`, { state: room })
                            }
                          >
                            View Details
                          </Button>
                          <Button
                            variant="contained"
                            color="error"
                            onClick={() => handleDelete(id)}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={() =>
                            navigate(`/room/${id}`, { state: room })
                          }
                        >
                          Book Now
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        )}
      </Grid>
    </Container>
  );
}

export default ViewRooms;
