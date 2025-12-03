/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateEmergencyStatusDto = {
    /**
     * New status of the emergency
     */
    status: UpdateEmergencyStatusDto.status;
    /**
     * Additional notes
     */
    notes?: string;
};
export namespace UpdateEmergencyStatusDto {
    /**
     * New status of the emergency
     */
    export enum status {
        PENDING = 'PENDING',
        ASSIGNED = 'ASSIGNED',
        IN_PROGRESS = 'IN_PROGRESS',
        COMPLETED = 'COMPLETED',
        CANCELLED = 'CANCELLED',
    }
}

