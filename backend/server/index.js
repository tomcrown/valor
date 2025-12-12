import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { EnokiClient } from "@mysten/enoki";

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize Enoki Client with your PRIVATE API key
const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_PRIVATE_API_KEY,
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Endpoint to sponsor transactions (if needed for backend operations)
app.post("/api/sponsor-transaction", async (req, res) => {
  try {
    const {
      transactionKindBytes,
      sender,
      allowedMoveCallTargets,
      allowedAddresses,
    } = req.body;

    const sponsored = await enokiClient.createSponsoredTransaction({
      network: "testnet",
      transactionKindBytes,
      sender,
      allowedMoveCallTargets,
      allowedAddresses,
    });

    res.json({
      success: true,
      digest: sponsored.digest,
      bytes: sponsored.bytes,
    });
  } catch (error) {
    console.error("Sponsor transaction error:", error);
    res.status(500).json({
      error: "Failed to sponsor transaction",
      details: error.message,
    });
  }
});

// Endpoint to execute sponsored transaction
app.post("/api/execute-sponsored", async (req, res) => {
  try {
    const { digest, signature } = req.body;

    const result = await enokiClient.executeSponsoredTransaction({
      digest,
      signature,
    });

    res.json({
      success: true,
      digest: result.digest,
    });
  } catch (error) {
    console.error("Execute transaction error:", error);
    res.status(500).json({
      error: "Failed to execute transaction",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Enoki configured: ${!!process.env.ENOKI_PRIVATE_API_KEY}`);
});
