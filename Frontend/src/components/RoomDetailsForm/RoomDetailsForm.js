import { Add, Remove } from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// const GET_ROOM_URL = `${process.env.REACT_APP_BASE_URL}/room`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/room";
// const ADD_ROOM_URL = `${process.env.REACT_APP_BASE_URL}/rooms/add`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms/add";
// const UPDATE_ROOM_URL = `${process.env.REACT_APP_BASE_URL}/rooms/update`;
// "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms/update";

// const GET_ROOM_URL =
//   "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/room";
// const ADD_ROOM_URL =
//   "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms/add";
// const UPDATE_ROOM_URL =
//   "https://6rofxd33q8.execute-api.us-east-1.amazonaws.com/development/rooms/update";

const BASE_URL = process.env.REACT_APP_ROOM_AND_CHAT_BASE_URL;
const GET_ROOM_URL = `${BASE_URL}/room`;
const ADD_ROOM_URL = `${BASE_URL}/rooms/add`;
const UPDATE_ROOM_URL = `${BASE_URL}/rooms/update`;

function RoomDetailsForm() {
  const { roomId } = useParams();
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    roomNumber: "",
    roomType: "",
    price: "",
    features: [""],
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFeatureChange = (index, event) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = event.target.value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  const removeFeature = () => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.slice(0, -1);
      setFormData({ ...formData, features: newFeatures });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const fetchRoomData = async () => {
    setLoading(true);
    await axios
      .get(`${GET_ROOM_URL}?roomId=${roomId}`)
      .then((res) => {
        const data = JSON.parse(res.data.body);
        const { roomDetails } = data;
        setFormData({
          roomNumber: roomDetails.roomNumber || "",
          roomType: roomDetails.roomType || "",
          price: roomDetails.price || "",
          features: roomDetails.features || [""],
          image: roomDetails.roomPicture || "",
        });
      })
      .finally(() => setLoading(false));
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.roomNumber) tempErrors.roomNumber = "Room Number is required";
    if (!formData.roomType) tempErrors.roomType = "Room Type is required";
    if (!formData.price) tempErrors.price = "Price is required";
    if (!formData.image) tempErrors.image = "Image is required";
    if (
      formData.features.length === 0 ||
      formData.features.some((feature) => !feature)
    ) {
      tempErrors.features =
        "At least one feature is required and it cannot be empty";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (roomId) {
      await axios.put(UPDATE_ROOM_URL, { ...formData, roomId }).then((res) => {
        const status = res.status;
        if (status === 200) {
          navigate("/");
        }
      });
    } else {
      await axios
        .post(ADD_ROOM_URL, { ...formData, userId: authState.userId })
        .then((res) => {
          const status = res.status;
          if (status === 200 || status === 201) {
            navigate("/");
          }
        })
        .catch((error) => console.log(error));
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  if (loading) {
    return (
      <Stack direction="row" justifyContent="center">
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Container maxWidth="sm" style={{ marginBottom: "2rem" }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Room Details
      </Typography>
      <form>
        <Box>
          <Typography variant="h6">Room Details</Typography>
          <TextField
            label="Room Number"
            variant="outlined"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleInputChange}
            error={!!errors.roomNumber}
            helperText={errors.roomNumber}
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Room Type"
            variant="outlined"
            name="roomType"
            value={formData.roomType}
            onChange={handleInputChange}
            error={!!errors.roomType}
            helperText={errors.roomType}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Price"
            variant="outlined"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            error={!!errors.price}
            helperText={errors.price}
            fullWidth
            margin="normal"
            type="number"
          />
          <Typography variant="h6" mt={2} gutterBottom>
            Room Image
          </Typography>
          <input
            accept="image/*"
            type="file"
            onChange={handleImageChange}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button variant="contained" color="primary" component="span">
              Upload Image
            </Button>
          </label>
          {formData.image && (
            <Box mt={2}>
              <img src={formData.image} alt="Room" style={{ width: "100%" }} />
            </Box>
          )}
          <Typography variant="h6" mt={2} gutterBottom>
            Room Features
          </Typography>
          {formData.features.map((feature, index) => (
            <Box key={index} display="flex" alignItems="center" mb={2}>
              <TextField
                label={`Feature ${index + 1}`}
                variant="outlined"
                value={feature}
                onChange={(event) => handleFeatureChange(index, event)}
                error={!!errors.features}
                helperText={errors.features}
                fullWidth
              />
            </Box>
          ))}
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={addFeature}
            >
              Add Feature
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<Remove />}
              onClick={removeFeature}
              disabled={formData.features.length === 1}
            >
              Remove Last Feature
            </Button>
          </Box>
          <Button
            style={{ marginTop: "1rem" }}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
          >
            {roomId ? "update" : "submit"}
          </Button>
        </Box>
      </form>
    </Container>
  );
}

export default RoomDetailsForm;
