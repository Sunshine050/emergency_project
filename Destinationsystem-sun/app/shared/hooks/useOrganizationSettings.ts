import { useState, useEffect, useCallback } from "react";
import { HospitalsService, RescueTeamsService, UsersService } from "@lib/api-client";
import { configureApiClient } from "@/shared/utils/apiConfig";
import { useToast } from "@/shared/hooks/use-toast";

export const useOrganizationSettings = (role: "hospital" | "rescue_team") => {
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrganization = useCallback(async () => {
    setIsLoading(true);
    configureApiClient();
    try {
      // 1. Get User Profile to find Organization ID
      // We assume the user profile has hospitalId or rescueTeamId
      // If not, we might need to search or use a different endpoint
      const user = await UsersService.userControllerGetProfile();
      
      if (role === "hospital") {
        if (user.hospitalId) {
          const hospital = await HospitalsService.hospitalControllerFindOne(user.hospitalId);
          setOrganization(hospital);
        } else {
            // Fallback: Try to find hospital by user ID if the relationship is inverted or not directly on user
            // Or maybe the user IS the hospital (unlikely for staff)
            console.warn("No hospitalId found on user profile");
        }
      } else if (role === "rescue_team") {
        if (user.rescueTeamId) {
          const team = await RescueTeamsService.rescueControllerFindOne(user.rescueTeamId);
          setOrganization(team);
        } else {
             console.warn("No rescueTeamId found on user profile");
        }
      }
    } catch (error) {
      console.error("Failed to fetch organization settings:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลหน่วยงานได้",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [role, toast]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const updateOrganization = async (data: any) => {
    configureApiClient();
    try {
      if (!organization?.id) throw new Error("No organization ID found");

      if (role === "hospital") {
        await HospitalsService.hospitalControllerUpdate(organization.id, data);
      } else if (role === "rescue_team") {
        await RescueTeamsService.rescueControllerUpdate(organization.id, data);
      }
      
      toast({
        title: "สำเร็จ",
        description: "บันทึกข้อมูลเรียบร้อยแล้ว",
      });
      
      // Refresh data
      fetchOrganization();
    } catch (error) {
      console.error("Failed to update organization:", error);
      toast({
        title: "ข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const updateCapacity = async (data: any) => {
      if (role !== 'hospital' || !organization?.id) return;
      configureApiClient();
      try {
          await HospitalsService.hospitalControllerUpdateCapacity(organization.id, data);
          toast({ title: "สำเร็จ", description: "อัปเดตความจุเตียงเรียบร้อยแล้ว" });
          fetchOrganization();
      } catch (error) {
          console.error("Failed to update capacity:", error);
          toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถอัปเดตความจุได้", variant: "destructive" });
      }
  }

  const updateStatus = async (status: string) => {
      if (role !== 'rescue_team' || !organization?.id) return;
      configureApiClient();
      try {
          await RescueTeamsService.rescueControllerUpdateStatus(organization.id, { status });
          toast({ title: "สำเร็จ", description: "อัปเดตสถานะเรียบร้อยแล้ว" });
          fetchOrganization();
      } catch (error) {
          console.error("Failed to update status:", error);
          toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถอัปเดตสถานะได้", variant: "destructive" });
      }
  }

  return {
    organization,
    isLoading,
    updateOrganization,
    updateCapacity, // Only for hospitals
    updateStatus,   // Only for rescue teams
  };
};
