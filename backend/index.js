import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { EnokiClient } from "@mysten/enoki";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_PRIVATE_API_KEY,
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

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
    res.status(500).json({
      error: "Failed to sponsor transaction",
      details: error.message,
    });
  }
});

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
    res.status(500).json({
      error: "Failed to execute transaction",
      details: error.message,
    });
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/openai", async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Missing 'input' field" });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input,
    });

    res.json({
      success: true,
      output: response.output_text,
      raw: response,
    });
  } catch (err) {
    res.status(500).json({
      error: "Failed to contact OpenAI",
      details: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running → http://localhost:${PORT}`);
  console.log(`Enoki API key loaded → ${!!process.env.ENOKI_PRIVATE_API_KEY}`);
  console.log(`OpenAI key loaded → ${!!process.env.OPENAI_API_KEY}`);
});
