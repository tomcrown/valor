// src/pages/AuthCallback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function AuthCallback() {
  const [status, setStatus] = useState<"processing" | "success" | "error">(
    "processing"
  );
  const [message, setMessage] = useState("Processing your login...");
  const navigate = useNavigate();

  useEffect(() => {
    const processZkLogin = async () => {
      try {
        // Extract JWT from URL hash (Google returns it in hash, not query params)
        const urlParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const jwt = urlParams.get("id_token");

        if (!jwt) {
          throw new Error("No JWT token found in callback");
        }

        // Retrieve stored ephemeral data
        const storedStateStr = sessionStorage.getItem("zkLoginState");
        if (!storedStateStr) {
          throw new Error("No stored login state found. Please try again.");
        }

        const storedState = JSON.parse(storedStateStr);

        setMessage("Generating zero-knowledge proof...");

        // Call backend to get ZK proof and address
        const response = await fetch("/api/zklogin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jwt,
            ephemeralPublicKey: storedState.ephemeralPublicKey,
            maxEpoch: storedState.maxEpoch,
            randomness: storedState.randomness,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to complete zkLogin");
        }

        const data = await response.json();

        // Update session with complete authentication data
        sessionStorage.setItem(
          "zkLoginState",
          JSON.stringify({
            ...storedState,
            status: "Authenticated",
            suiAddress: data.suiAddress,
            zkProof: data.zkProof,
            jwt: jwt,
          })
        );

        // Store in localStorage for persistence
        localStorage.setItem("auth_method", "zklogin");
        localStorage.setItem("zklogin_address", data.suiAddress);
        localStorage.setItem(
          "sui_session",
          JSON.stringify({
            address: data.suiAddress,
            method: "zklogin",
          })
        );

        setStatus("success");
        setMessage("Successfully logged in with Google!");

        // Redirect to home after success
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (error) {
        console.error("zkLogin callback error:", error);
        setStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "Login failed. Please try again."
        );

        // Clear failed state
        sessionStorage.removeItem("zkLoginState");

        // Redirect to home after error
        setTimeout(() => {
          navigate("/");
        }, 3000);
      }
    };

    processZkLogin();
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            {status === "processing" && (
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            )}
            {status === "success" && (
              <CheckCircle className="w-16 h-16 text-success" />
            )}
            {status === "error" && (
              <XCircle className="w-16 h-16 text-destructive" />
            )}
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {status === "processing" && "Completing Login"}
            {status === "success" && "Login Successful!"}
            {status === "error" && "Login Failed"}
          </h2>

          <p className="text-muted-foreground">{message}</p>

          {status === "processing" && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Verifying JWT token
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                Generating ZK proof
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
                Creating your Sui address
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
