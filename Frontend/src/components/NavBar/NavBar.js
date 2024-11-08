import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import React, { useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { AGENT } from "../../Utils/UserRole";

function NavBar() {
  const { authState, logout } = useContext(AuthContext);
  return (
    <AppBar
      position="static"
      sx={{ padding: "0" }}
      style={{ marginBottom: "2rem" }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DALVacationHome
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {authState.role === AGENT && (
            <Button
              component={RouterLink}
              to="/dashboard"
              color="inherit"
              sx={{ marginRight: 1 }}
            >
              Dashboard
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{ marginRight: 1 }}
          >
            Rooms
          </Button>
          {!authState.userId ? (
            <>
              <Button
                component={RouterLink}
                to="/signin"
                color="inherit"
                sx={{ marginRight: 1 }}
              >
                Sign In
              </Button>
              <Button component={RouterLink} to="/signup" color="inherit">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              {(authState.role == "customer") ? 
              <Button
                component={RouterLink}
                to="/booking-history"
                color="inherit"
                sx={{ marginRight: 1 }}
              >
                Booking History
              </Button>
              : null}
              <Button
                component={RouterLink}
                to="/concerns"
                color="inherit"
                sx={{ marginRight: 1 }}
              >
                Concerns
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/"
                color="error"
                onClick={logout}
              >
                logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default NavBar;
