import { Injectable } from "@nestjs/common";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

@Injectable()
export class SupabaseService {
  public client: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Logging for debug
    console.log("✅ Supabase URL:", supabaseUrl);
    console.log("✅ Supabase Key exists:", !!SUPABASE_SERVICE_ROLE_KEY);

    if (!supabaseUrl || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(
        "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
      );
      throw new Error("Supabase config missing");
    }

    this.client = createClient(supabaseUrl, SUPABASE_SERVICE_ROLE_KEY);

    // ตรวจสอบการเชื่อมต่อ
    this.client.auth.getSession().then((session) => {
      if (session) {
        console.log("✅ Connected to Supabase");
      } else {
        console.error("❌ Failed to connect to Supabase");
      }
    });

    console.log("✅ Supabase client created successfully");
  }
}
