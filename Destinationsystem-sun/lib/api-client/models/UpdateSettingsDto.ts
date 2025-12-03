/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CommunicationSettingsDto } from './CommunicationSettingsDto';
import type { EmergencySettingsDto } from './EmergencySettingsDto';
import type { NotificationSettingsDto } from './NotificationSettingsDto';
import type { ProfileSettingsDto } from './ProfileSettingsDto';
import type { SystemSettingsDto } from './SystemSettingsDto';
export type UpdateSettingsDto = {
    notificationSettings?: NotificationSettingsDto;
    systemSettings?: SystemSettingsDto;
    communicationSettings?: CommunicationSettingsDto;
    profileSettings?: ProfileSettingsDto;
    emergencySettings?: EmergencySettingsDto;
};

