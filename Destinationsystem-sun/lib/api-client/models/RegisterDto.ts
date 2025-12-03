/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type RegisterDto = {
    /**
     * User email
     */
    email: string;
    /**
     * User password
     */
    password: string;
    /**
     * User first name
     */
    firstName: string;
    /**
     * User last name
     */
    lastName: string;
    /**
     * User phone number (optional)
     */
    phone?: string;
    /**
     * User role
     */
    role?: RegisterDto.role;
};
export namespace RegisterDto {
    /**
     * User role
     */
    export enum role {
        PATIENT = 'PATIENT',
        EMERGENCY_CENTER = 'EMERGENCY_CENTER',
        HOSPITAL = 'HOSPITAL',
        RESCUE_TEAM = 'RESCUE_TEAM',
        ADMIN = 'ADMIN',
    }
}

