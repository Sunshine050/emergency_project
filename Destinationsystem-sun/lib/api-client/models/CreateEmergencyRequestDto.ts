/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateEmergencyRequestDto = {
    /**
     * Description of the emergency
     */
    description: string;
    /**
     * Location address
     */
    location?: string;
    /**
     * Latitude of the location
     */
    latitude?: number;
    /**
     * Longitude of the location
     */
    longitude?: number;
    /**
     * Grade of the emergency
     */
    grade: CreateEmergencyRequestDto.grade;
    /**
     * Type of the emergency
     */
    type: CreateEmergencyRequestDto.type;
    /**
     * Additional medical information
     */
    medicalInfo?: Record<string, any>;
    /**
     * Symptoms reported
     */
    symptoms?: Array<string>;
    /**
     * Patient ID (optional for EMERGENCY_CENTER)
     */
    patientId?: string;
};
export namespace CreateEmergencyRequestDto {
    /**
     * Grade of the emergency
     */
    export enum grade {
        CRITICAL = 'CRITICAL',
        URGENT = 'URGENT',
        NON_URGENT = 'NON_URGENT',
    }
    /**
     * Type of the emergency
     */
    export enum type {
        ACCIDENT = 'ACCIDENT',
        MEDICAL = 'MEDICAL',
        FIRE = 'FIRE',
        CRIME = 'CRIME',
        OTHER = 'OTHER',
    }
}

