"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Processing login...");
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check for Access Token in Hash (Implicit Flow)
    const hash = window.location.hash;
    if (hash && hash.includes("access_token=")) {
        const params = new URLSearchParams(hash.substring(1)); // remove #
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");
        
        if (accessToken) {
            setStatus("Login Successful (Implicit Flow)!");
            setUserData({
                session: {
                    access_token: accessToken,
                    refresh_token: refreshToken
                },
                user: {
                    email: "User from Implicit Flow (Check JWT for details)"
                }
            });
            localStorage.setItem("access_token", accessToken);
            return;
        }
    }

    // 2. Check for Code in Search Params (PKCE Flow)
    const code = searchParams.get("code");
    
    if (!code) {
      if (!hash) setStatus("No code or token found in URL");
      return;
    }

    const exchangeCode = async () => {
      try {
        setStatus("Exchanging code with backend...");
        
        // Call your temporary backend running on port 3002
        const response = await fetch("http://localhost:3002/api/auth/google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to exchange token");
        }

        setUserData(data);
        setStatus("Login Successful!");
        
        // Optional: Save token to localStorage if you want to use it immediately
        if (data.session?.access_token) {
           localStorage.setItem("access_token", data.session.access_token);
        }

      } catch (err: any) {
        console.error("Login error:", err);
        setError(err.message);
        setStatus("Login Failed");
      }
    };

    exchangeCode();
  }, [searchParams]);

  const copyToken = () => {
    if (userData?.session?.access_token) {
      navigator.clipboard.writeText(userData.session.access_token);
      alert("Access Token copied to clipboard!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Auth Callback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${error ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
              <p className="font-medium">{status}</p>
              {error && <p className="text-sm mt-1">{error}</p>}
            </div>

            {userData && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">User Data Received:</h3>
                    <button 
                        onClick={copyToken}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        Copy Access Token
                    </button>
                </div>
                
                <div className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-auto max-h-[400px]">
                  <pre className="text-xs font-mono">
                    {JSON.stringify(userData, null, 2)}
                  </pre>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => router.push('/hospital/dashboard')}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                        Go to Dashboard
                    </button>
                    <button 
                        onClick={() => router.push('/temp-login')}
                        className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
                    >
                        Back to Login
                    </button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
