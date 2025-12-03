// app/shared/hooks/useWebSocket.ts
"use client";

import { useEffect } from "react";
import { webSocketClient } from "@lib/websocket";

export const useWebSocket = (token: string, onUpdate: () => void) => {
  useEffect(() => {
    webSocketClient.connect(token);

    const statusUpdateHandler = (data: any) => {
      console.log("Status update:", data);
      onUpdate();
    };

    const emergencyHandler = (data: any) => {
      console.log("New emergency:", data);
      onUpdate();
    };

    webSocketClient.onStatusUpdate(statusUpdateHandler);
    webSocketClient.onEmergency(emergencyHandler);

    return () => {
      webSocketClient.offStatusUpdate(statusUpdateHandler);
      webSocketClient.offEmergency(emergencyHandler);
      webSocketClient.disconnect();
    };
  }, [token, onUpdate]);
};