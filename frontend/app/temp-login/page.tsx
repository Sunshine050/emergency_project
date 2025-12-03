"use client";

import React from "react";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";

export default function TempLoginPage() {
  const [supabaseUrl, setSupabaseUrl] = React.useState("https://zicylumzpalbvvxitbkf.supabase.co");

  const handleGoogleLogin = () => {
    if (!supabaseUrl) {
      alert("Please enter Supabase URL");
      return;
    }
    
    // Construct the OAuth URL
    let oauthUrl = supabaseUrl;
    
    // ถ้า URL ที่ใส่มายังไม่มี path authorize ให้เติมเข้าไป
    if (!supabaseUrl.includes("/auth/v1/authorize")) {
        const redirectUrl = "http://localhost:3000/auth/callback";
        oauthUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${redirectUrl}&response_type=code&access_type=offline&prompt=consent`;
    }

    window.location.href = oauthUrl;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100 dark:bg-slate-900">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-center">Temporary Login</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Supabase Project URL</label>
            <input 
              type="text" 
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              placeholder="https://your-project.supabase.co"
            />
          </div>

          <Button 
            onClick={handleGoogleLogin}
            className="w-full bg-white text-black border hover:bg-slate-50"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </Button>
          <p className="text-xs text-center text-slate-500">
            Redirects to Supabase OAuth &rarr; Callback &rarr; Backend (3001)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
