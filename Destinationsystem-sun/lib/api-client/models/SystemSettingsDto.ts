/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type SystemSettingsDto = {
    language?: string;
    timeZone?: string;
    dateFormat?: string;
    mapProvider?: string;
    autoRefreshInterval?: string;
    theme?: SystemSettingsDto.theme;
};
export namespace SystemSettingsDto {
    export enum theme {
        LIGHT = 'light',
        DARK = 'dark',
        SYSTEM = 'system',
    }
}

