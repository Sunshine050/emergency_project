/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignCaseDto } from '../models/AssignCaseDto';
import type { CancelCaseDto } from '../models/CancelCaseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Get dashboard statistics
     * Get overall statistics for the rescue dashboard
     * @returns any Statistics retrieved successfully
     * @throws ApiError
     */
    public static dashboardControllerGetStats(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rescue/dashboard/stats',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - ADMIN or EMERGENCY_CENTER role required`,
            },
        });
    }
    /**
     * Get active emergencies
     * Get list of all active emergency cases
     * @returns any Active emergencies retrieved successfully
     * @throws ApiError
     */
    public static dashboardControllerGetActiveEmergencies(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rescue/dashboard/active-emergencies',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get team locations
     * Get current locations of all rescue teams
     * @returns any Team locations retrieved successfully
     * @throws ApiError
     */
    public static dashboardControllerGetTeamLocations(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rescue/dashboard/team-locations',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get hospital capacities
     * Get current bed capacity information for all hospitals
     * @returns any Hospital capacities retrieved successfully
     * @throws ApiError
     */
    public static dashboardControllerGetHospitalCapacities(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rescue/dashboard/hospital-capacities',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Assign emergency case
     * Assign an emergency case to a rescue team or hospital
     * @param requestBody
     * @returns any Case assigned successfully
     * @throws ApiError
     */
    public static dashboardControllerAssignCase(
        requestBody: AssignCaseDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rescue/dashboard/assign-case',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Case or team not found`,
            },
        });
    }
    /**
     * Cancel emergency case
     * Cancel an active emergency case
     * @param requestBody
     * @returns any Case cancelled successfully
     * @throws ApiError
     */
    public static dashboardControllerCancelCase(
        requestBody: CancelCaseDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rescue/dashboard/cancel-case',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Case not found`,
            },
        });
    }
}
