// app/shared/hooks/useAuth.ts
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";

export const useAuth = () => {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({ title: "ข้อผิดพลาด", description: "กรุณาเข้าสู่ระบบเพื่อใช้งาน", variant: "destructive" });
      router.push("/login");
    }
  }, [router, toast]);
};