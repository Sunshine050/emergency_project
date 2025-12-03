/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateEmergencyRequestDto } from '../models/CreateEmergencyRequestDto';
import type { UpdateEmergencyStatusDto } from '../models/UpdateEmergencyStatusDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SosEmergencyRequestsService {
    /**
     * Create emergency request
     * Create a new SOS emergency request (PATIENT or EMERGENCY_CENTER)
     * @param requestBody
     * @returns any Emergency request created successfully
     * @throws ApiError
     */
    public static sosControllerCreateEmergencyRequest(
        requestBody: CreateEmergencyRequestDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sos',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Insufficient permissions`,
            },
        });
    }
    /**
     * Get my emergency requests
     * Get all emergency requests created by the authenticated patient
     * @returns any Emergency requests retrieved successfully
     * @throws ApiError
     */
    public static sosControllerGetEmergencyRequests(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sos',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - PATIENT role required`,
            },
        });
    }
    /**
     * Assign emergency to hospital
     * Assign an emergency request to a specific hospital (EMERGENCY_CENTER only)
     * @param id Emergency request ID
     * @param requestBody
     * @returns any Emergency assigned to hospital successfully
     * @throws ApiError
     */
    public static sosControllerAssignToHospital(
        id: string,
        requestBody: {
            /**
             * Hospital organization ID
             */
            hospitalId?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/sos/{id}/assign',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - EMERGENCY_CENTER role required`,
                404: `Emergency request or hospital not found`,
            },
        });
    }
    /**
     * Update emergency status
     * Update the status of an emergency request
     * @param id Emergency request ID
     * @param requestBody
     * @returns any Emergency status updated successfully
     * @throws ApiError
     */
    public static sosControllerUpdateStatus(
        id: string,
        requestBody: UpdateEmergencyStatusDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/sos/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Insufficient permissions`,
                404: `Emergency request not found`,
            },
        });
    }
    /**
     * Get all emergency requests
     * Get all emergency requests in the system (staff only)
     * @returns any All emergency requests retrieved successfully
     * @throws ApiError
     */
    public static sosControllerGetAllEmergencyRequests(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sos/all',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Staff role required`,
            },
        });
    }
    /**
     * Get active emergencies for dashboard
     * Get active emergencies (filtered by hospital if HOSPITAL role)
     * @returns any Active emergencies retrieved successfully
     * @throws ApiError
     */
    public static sosControllerGetActiveEmergencies(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sos/dashboard/active-emergencies',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - Staff role required`,
            },
        });
    }
    /**
     * Get emergency request by ID
     * Get a specific emergency request by ID (patient only)
     * @param id Emergency request ID
     * @returns any Emergency request retrieved successfully
     * @throws ApiError
     */
    public static sosControllerGetEmergencyRequestById(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/sos/{id}',
            path: {
                'id': id,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden - PATIENT role required`,
                404: `Emergency request not found`,
            },
        });
    }
}
