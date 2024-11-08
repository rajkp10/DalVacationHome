import React, { useEffect, useRef } from "react";
import { Container } from "@mui/material";

function Dashboard() {
  const reportUrl =
    "https://lookerstudio.google.com/embed/reporting/d40dc766-24eb-4b9e-8e7c-3c86f4103a7b/page/SOf6D";
  const iframeRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (iframeRef.current) {
        iframeRef.current.src = reportUrl;
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container maxWidth="lg">
      <div style={{ width: "100%", height: "80vh" }}>
        <iframe
          src={reportUrl}
          style={{
            border: 0,
            width: "100%",
            height: "100%",
          }}
          ref={iframeRef}
          title="Looker Studio Report"
        ></iframe>
      </div>
    </Container>
  );
}

export default Dashboard;
