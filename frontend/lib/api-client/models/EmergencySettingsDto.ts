/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type EmergencySettingsDto = {
    defaultRadius?: number;
    minUrgencyLevel?: EmergencySettingsDto.minUrgencyLevel;
};
export namespace EmergencySettingsDto {
    export enum minUrgencyLevel {
        CRITICAL = 'CRITICAL',
        URGENT = 'URGENT',
        NON_URGENT = 'NON_URGENT',
    }
}

