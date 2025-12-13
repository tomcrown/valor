import { NextRequest, NextResponse } from "next/server";

const ENOKI_API_KEY = process.env.ENOKI_API_KEY!;
const ENOKI_BASE_URL = "https://api.enoki.mystenlabs.com/v1";

async function callEnokiApi(
  endpoint: string,
  options: {
    method: string;
    headers: Record<string, string>;
    body?: string;
  }
) {
  const response = await fetch(`${ENOKI_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    throw new Error(`Enoki API error: ${response.statusText}`);
  }

  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { jwt, ephemeralPublicKey, maxEpoch, randomness } = await req.json();

    if (!jwt || !ephemeralPublicKey || !maxEpoch || !randomness) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const commonHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENOKI_API_KEY}`,
    };

    const addressData = await callEnokiApi("/zklogin", {
      method: "GET",
      headers: {
        ...commonHeaders,
        "zklogin-jwt": jwt,
      },
    });

    const { address } = addressData.data;

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

    return NextResponse.json({
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
    return NextResponse.json(
      {
        error: "Failed to process zkLogin request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
