import React, { useState, useEffect, useContext } from "react";
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js";
import userPool from "../../config/UserPool";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button, Container, TextField, Typography } from "@mui/material";
import { CUSTOMER, AGENT } from "../../Utils/UserRole";

const BASE_URL = "https://nda2r8k2c8.execute-api.us-east-1.amazonaws.com/v1";
// const API_GATEWAY_ENDPOINT = `${BASE_URL}/get-user-details`;
const API_GATEWAY_ENDPOINT = `${process.env.REACT_APP_CONGNITO_BASE_URL}/get-user-details`;

const LOGIN_SNS_ENDPOINT =
  "https://dkvvpza6v2m7hqaypssglptkum0cpeue.lambda-url.us-east-1.on.aws";

function Login() {
  const { authState, setTokens } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswer, setCustomAnswer] = useState("");
  const [questionAnswer, setQuestionAnswer] = useState("");
  const [cipherKey, setCipherKey] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [randomText, setRandomText] = useState("");
  const [transformedText, setTransformedText] = useState("");
  const [stage, setStage] = useState(1);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [tempTokens, setTempTokens] = useState({
    idToken: null,
    accessToken: null,
    refreshToken: null,
  });

  useEffect(() => {
    if (stage === 3) {
      setRandomText(generateRandomText(10));
    }
  }, [stage]);

  const generateRandomText = (length) => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return result;
  };

  const fetchUserDetails = async (email, token) => {
    try {
      const response = await axios.post(
        API_GATEWAY_ENDPOINT,
        { userId: email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };

  const validateStage1 = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = "Email is required";
    if (!password) tempErrors.password = "Password is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStage2 = () => {
    const tempErrors = {};
    if (!customAnswer)
      tempErrors.customAnswer = "Custom Security Answer is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStage3 = () => {
    const tempErrors = {};
    if (!transformedText)
      tempErrors.transformedText = "Transformed Text is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const onSubmit = (event) => {
    event.preventDefault();

    if (!validateStage1()) return;

    const user = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: async (result) => {
        console.log("Login successful:", result);

        const idToken = result.getIdToken().getJwtToken();
        const accessToken = result.getAccessToken().getJwtToken();
        const refreshToken = result.getRefreshToken().getToken();

        setTempTokens({ idToken, accessToken, refreshToken });

        try {
          const userDetails = await fetchUserDetails(email, idToken);
          setCustomQuestion(userDetails.customQuestion);
          setQuestionAnswer(userDetails.customAnswer);
          setCipherKey(userDetails.cipherKey);
          setUserDetails(userDetails);
          // localStorage.setItem("userDetails", JSON.stringify(userDetails));
          setStage(2);
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      },
      onFailure: (err) => {
        console.error("Login failed. Incorrect Username/Password", err);
        alert("Login failed. Incorrect Username/Password");
      },
    });
  };

  const onVerifyQuestion = (event) => {
    event.preventDefault();

    if (!validateStage2()) return;

    if (customAnswer === questionAnswer) {
      console.log("Security question verification successful");
      setStage(3);
    } else {
      console.error("Security question verification failed");
      alert("Security question verification failed");
    }
  };

  const caesarCipher = (str, shift) => {
    return str
      .split("")
      .map((char) => {
        const code = char.charCodeAt(0);

        if (code >= 65 && code <= 90) {
          return String.fromCharCode(((code - 65 + shift) % 26) + 65);
        } else if (code >= 97 && code <= 122) {
          return String.fromCharCode(((code - 97 + shift) % 26) + 97);
        }
        return char;
      })
      .join("");
  };

  const onVerifyCipher = (event) => {
    event.preventDefault();

    if (!validateStage3()) return;

    const expectedTransformedText = caesarCipher(
      randomText,
      parseInt(cipherKey)
    );
    if (transformedText === expectedTransformedText) {
      console.log("Caesar cipher verification successful");
      setTokens({ ...tempTokens, userDetails });
      alert("Login successful!");
      const headers = {
        "Content-Type": "application/json",
      };

      axios
        .post(LOGIN_SNS_ENDPOINT, { email }, { headers })
        .then((response) => {
          console.log(response.data);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      console.error("Caesar cipher verification failed");
      alert("Caesar cipher verification failed");
    }
  };

  useEffect(() => {
    if (authState.role === CUSTOMER) {
      navigate("/");
    } else if (authState.role === AGENT) {
      navigate("/dashboard");
    }
  });

  return (
    <Container maxWidth="sm">
      {stage === 1 && (
        <form onSubmit={onSubmit}>
          <TextField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email"
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            margin="normal"
          />
          <TextField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            rror={!!errors.password}
            helperText={errors.password}
            type="password"
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            Login
          </Button>
        </form>
      )}
      {stage === 2 && (
        <form onSubmit={onVerifyQuestion}>
          <TextField
            value={customQuestion}
            readOnly
            label="Custom Security Question"
            fullWidth
            margin="normal"
          />
          <TextField
            value={customAnswer}
            onChange={(e) => setCustomAnswer(e.target.value)}
            label="Custom Security Answer"
            error={!!errors.customAnswer}
            helperText={errors.customAnswer}
            fullWidth
            margin="normal"
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            Verify Security Question
          </Button>
        </form>
      )}
      {stage === 3 && (
        <form onSubmit={onVerifyCipher}>
          <Typography variant="h6" gutterBottom>
            Transform the text "{randomText}" using your Caesar cipher key.
          </Typography>
          <TextField
            value={transformedText}
            onChange={(e) => setTransformedText(e.target.value)}
            label="Transformed Text"
            fullWidth
            margin="normal"
            error={!!errors.transformedText}
            helperText={errors.transformedText}
          />
          <Button
            variant="contained"
            type="submit"
            fullWidth
            style={{ marginTop: "1rem" }}
          >
            Verify Caesar Cipher
          </Button>
        </form>
      )}
    </Container>
  );
}

export default Login;
