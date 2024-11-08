import React, { useState } from "react";
import { CognitoUser, CognitoUserAttribute } from "amazon-cognito-identity-js";
import { useNavigate } from "react-router-dom";
import userPool from "../../config/UserPool";
import axios from "axios";
import {
  Button,
  Container,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";

const SIGNUP_SNS_ENDPOINT =
  "https://7mabtjxypwyol7wwmoj3r2umbi0acwab.lambda-url.us-east-1.on.aws/";

function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [cipherKey, setCipherKey] = useState("");
  const [role, setRole] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = "Email is required";
    if (!password) tempErrors.password = "Password is required";
    if (!customQuestion)
      tempErrors.customQuestion = "Custom Security Question is required";
    if (!customAnswer)
      tempErrors.customAnswer = "Custom Security Answer is required";
    if (!cipherKey) tempErrors.cipherKey = "Caesar Cipher Key is required";
    if (!role) tempErrors.role = "Role is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateConfirmation = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = "Email is required";
    if (!confirmationCode)
      tempErrors.confirmationCode = "Confirmation Code is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    const attributeList = [
      new CognitoUserAttribute({
        Name: "email",
        Value: email,
      }),
      new CognitoUserAttribute({
        Name: "custom:question",
        Value: customQuestion,
      }),
      new CognitoUserAttribute({
        Name: "custom:answer",
        Value: customAnswer,
      }),
      new CognitoUserAttribute({
        Name: "custom:cipherKey",
        Value: cipherKey,
      }),
      new CognitoUserAttribute({
        Name: "custom:role",
        Value: role,
      }),
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log("User signed up:", result.user.getUsername());
      setIsSignedUp(true);
    });
  };

  const onConfirm = (event) => {
    event.preventDefault();

    if (!validateConfirmation()) return;

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    user.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        console.error("Error confirming sign-up:", err);
        return;
      }
      console.log("User confirmed:", result);
      alert("User confirmed successfully!");
      const headers = {
        "Content-Type": "application/json",
      };

      axios
        .post(SIGNUP_SNS_ENDPOINT, { email }, { headers })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
      navigate("/signin");
    });
  };

  return (
    <Container maxWidth="sm" style={{ marginBottom: "2rem" }}>
      {!isSignedUp ? (
        <form onSubmit={onSubmit}>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            error={!!errors.password}
            helperText={errors.password}
          />
          <TextField
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            label="Custom Security Question"
            fullWidth
            margin="normal"
            error={!!errors.customQuestion}
            helperText={errors.customQuestion}
          />
          <TextField
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            label="Custom Security Answer"
            fullWidth
            margin="normal"
            error={!!errors.customAnswer}
            helperText={errors.customAnswer}
          />
          <TextField
            value={cipherKey}
            onChange={(e) => setCipherKey(e.target.value.replace(/\D/, ""))}
            label="Caesar Cipher Key"
            fullWidth
            margin="normal"
            error={!!errors.cipherKey}
            helperText={errors.cipherKey}
            type="number"
          />
          <FormControl fullWidth margin="normal" error={!!errors.role}>
            <InputLabel>Role</InputLabel>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              label="Role"
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="agent">Agent</MenuItem>
            </Select>
            {errors.role && <p style={{ color: "red" }}>{errors.role}</p>}
          </FormControl>
          <Button
            variant="contained"
            type="submit"
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            Sign Up
          </Button>
        </form>
      ) : (
        <form onSubmit={onConfirm}>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            fullWidth
            margin="normal"
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            label="Confirmation Code"
            fullWidth
            margin="normal"
            error={!!errors.confirmationCode}
            helperText={errors.confirmationCode}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            Confirm Sign Up
          </Button>
        </form>
      )}
    </Container>
  );
}

export default SignUp;
