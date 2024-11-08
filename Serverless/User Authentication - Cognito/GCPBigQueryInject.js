import { BigQuery } from "@google-cloud/bigquery";
import fs from "fs";

export const handler = async (event) => {
  console.log(event.Records[0].dynamodb);
  const base64Key = process.env.GCP_SERVICE_ACCOUNT_KEY_BASE64;
  const keyContent = Buffer.from(base64Key, "base64").toString("utf-8");

  const keyFilename = "/tmp/service-account-key.json";
  fs.writeFileSync(keyFilename, keyContent);

  const bigquery = new BigQuery({
    keyFilename: keyFilename,
    projectId: process.env.GCP_PROJECT_ID,
  });

  const datasetId = "loginStatistics";
  const tableId = "LoginDetails";

  const rows = event.Records.map((record) => {
    if (record.eventName === "INSERT") {
      return {
        email: record.dynamodb.NewImage.userId.S,
        role: record.dynamodb.NewImage.role.S,
      };
    }
  }).filter((row) => row);

  try {
    if (rows.length > 0) {
      await bigquery.dataset(datasetId).table(tableId).insert(rows);
      console.log(`Inserted ${rows.length} rows into BigQuery`);
    }
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error inserting data" }),
    };
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({ message: "Data inserted successfully" }),
  };
  return response;
};
