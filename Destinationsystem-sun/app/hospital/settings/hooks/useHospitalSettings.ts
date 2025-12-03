// app/hospital/settings/hooks/useHospitalSettings.ts
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/shared/hooks/use-toast";
import { saveHospitalSettings } from "@/shared/services/authService"; // Extend for hospital
import { hospitalSettingsSchema, DEFAULT_HOSPITAL_SETTINGS } from "@/shared/utils/settingsUtils";

export const useHospitalSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const hospitalForm = useForm({
    resolver: zodResolver(hospitalSettingsSchema),
    defaultValues: DEFAULT_HOSPITAL_SETTINGS,
  });

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Sample timeout
      await saveHospitalSettings(data);
      toast({ title: "Settings updated", description: "Your settings have been saved successfully." });
    } catch (error) {
      console.error("Error saving hospital settings:", error);
      toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    hospitalForm,
    isLoading,
    onSubmit,
  };
};