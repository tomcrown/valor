// server/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const ENOKI_API_KEY = process.env.ENOKI_API_KEY;
const ENOKI_BASE_URL = "https://api.enoki.mystenlabs.com/v1";

async function callEnokiApi(endpoint, options) {
  const response = await fetch(`${ENOKI_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Enoki API error: ${response.statusText} - ${error}`);
  }

  return response.json();
}

app.post("/api/zklogin", async (req, res) => {
  try {
    const { jwt, ephemeralPublicKey, maxEpoch, randomness } = req.body;

    if (!jwt || !ephemeralPublicKey || !maxEpoch || !randomness) {
      return res.status(400).json({
        error: "Missing required parameters",
      });
    }

    if (!ENOKI_API_KEY) {
      return res.status(500).json({
        error: "Enoki API key not configured",
      });
    }

    const commonHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENOKI_API_KEY}`,
    };

    console.log("Requesting zkLogin address...");

    // Step 1: Get the zkLogin address
    const addressData = await callEnokiApi("/zklogin", {
      method: "GET",
      headers: {
        ...commonHeaders,
        "zklogin-jwt": jwt,
      },
    });

    const { address } = addressData.data;
    console.log("Got address:", address);

    console.log("Generating ZK proof...");

    // Step 2: Request ZK proof generation
    const zkpData = await callEnokiApi("/zklogin/zkp", {
      method: "POST",
      headers: {
        ...commonHeaders,
        "zklogin-jwt": jwt,
      },
      body: JSON.stringify({
        ephemeralPublicKey,
        maxEpoch,
        randomness,
        network: "testnet",
      }),
    });

    console.log("ZK proof generated successfully");

    res.json({
      success: true,
      suiAddress: address,
      zkProof: {
        proofPoints: zkpData.data.proofPoints,
        issBase64Details: zkpData.data.issBase64Details,
        headerBase64: zkpData.data.headerBase64,
      },
      token: jwt,
    });
  } catch (error) {
    console.error("zkLogin API error:", error);
    res.status(500).json({
      error: "Failed to process zkLogin request",
      details: error.message,
    });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(
    `Enoki API Key: ${ENOKI_API_KEY ? "Configured" : "NOT CONFIGURED"}`
  );
});
