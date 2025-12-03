/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AcceptEmergencyDto } from '../models/AcceptEmergencyDto';
import type { CreateHospitalDto } from '../models/CreateHospitalDto';
import type { GenerateReportDto } from '../models/GenerateReportDto';
import type { UpdateHospitalCapacityDto } from '../models/UpdateHospitalCapacityDto';
import type { UpdateHospitalDto } from '../models/UpdateHospitalDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class HospitalsService {
    /**
     * Create hospital
     * Create a new hospital organization (ADMIN or HOSPITAL role)
     * @param requestBody
     * @returns any Hospital created successfully
     * @throws ApiError
     */
    public static hospitalControllerCreate(
        requestBody: CreateHospitalDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hospitals',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * Get all hospitals
     * Get list of all hospitals with optional search
     * @param search Search query for hospital name or location
     * @returns any Hospitals retrieved successfully
     * @throws ApiError
     */
    public static hospitalControllerFindAll(
        search?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hospitals',
            query: {
                'search': search,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get hospital by ID
     * Get detailed information about a specific hospital
     * @param id Hospital ID
     * @returns any Hospital retrieved successfully
     * @throws ApiError
     */
    public static hospitalControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hospitals/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Hospital not found`,
            },
        });
    }
    /**
     * Update hospital
     * Update hospital information
     * @param id Hospital ID
     * @param requestBody
     * @returns any Hospital updated successfully
     * @throws ApiError
     */
    public static hospitalControllerUpdate(
        id: string,
        requestBody: UpdateHospitalDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/hospitals/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Hospital not found`,
            },
        });
    }
    /**
     * Delete hospital
     * Delete a hospital (ADMIN only)
     * @param id Hospital ID
     * @returns any Hospital deleted successfully
     * @throws ApiError
     */
    public static hospitalControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/hospitals/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Hospital not found`,
            },
        });
    }
    /**
     * Update hospital capacity
     * Update bed capacity information (HOSPITAL role)
     * @param id Hospital ID
     * @param requestBody
     * @returns any Capacity updated successfully
     * @throws ApiError
     */
    public static hospitalControllerUpdateCapacity(
        id: string,
        requestBody: UpdateHospitalCapacityDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/hospitals/{id}/capacity',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Hospital not found`,
            },
        });
    }
    /**
     * Accept emergency request
     * Hospital accepts an emergency request
     * @param id Hospital ID
     * @param requestBody
     * @returns any Emergency accepted successfully
     * @throws ApiError
     */
    public static hospitalControllerAcceptEmergency(
        id: string,
        requestBody: AcceptEmergencyDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hospitals/{id}/accept-emergency',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Hospital or emergency not found`,
            },
        });
    }
    /**
     * Find nearby hospitals
     * Find hospitals within a specified radius from coordinates
     * @param latitude Latitude coordinate
     * @param longitude Longitude coordinate
     * @param radius Search radius in kilometers
     * @returns any Nearby hospitals retrieved successfully
     * @throws ApiError
     */
    public static hospitalControllerFindNearbyHospitals(
        latitude: number,
        longitude: number,
        radius?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hospitals/nearby/{latitude}/{longitude}',
            path: {
                'latitude': latitude,
                'longitude': longitude,
            },
            query: {
                'radius': radius,
            },
        });
    }
    /**
     * Update emergency response status
     * Update status of an emergency response
     * @param id Emergency response ID
     * @returns any Emergency response status updated
     * @throws ApiError
     */
    public static hospitalControllerUpdateEmergencyResponseStatus(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/hospitals/emergency-responses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Emergency response not found`,
            },
        });
    }
    /**
     * Get emergency response
     * Retrieve details of an emergency response
     * @param id Emergency response ID
     * @returns any Emergency response retrieved
     * @throws ApiError
     */
    public static hospitalControllerGetEmergencyResponse(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hospitals/emergency-responses/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Emergency response not found`,
            },
        });
    }
    /**
     * Notify rescue team
     * Notify rescue team about an emergency response
     * @param id Emergency response ID
     * @returns any Rescue team notified
     * @throws ApiError
     */
    public static hospitalControllerNotifyRescueTeam(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hospitals/emergency-responses/{id}/notify-rescue',
            path: {
                'id': id,
            },
            errors: {
                404: `Emergency response not found`,
            },
        });
    }
    /**
     * Manually update emergency response status
     * Patch status of an emergency response
     * @param id Emergency response ID
     * @param requestBody New status
     * @returns any Emergency response status updated
     * @throws ApiError
     */
    public static hospitalControllerUpdateEmergencyResponseStatusManual(
        id: string,
        requestBody: {
            status?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/hospitals/emergency-responses/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Emergency response not found`,
            },
        });
    }
    /**
     * Get hospital reports
     * Get reports for a specific hospital
     * @param id Hospital ID
     * @returns any Reports retrieved successfully
     * @throws ApiError
     */
    public static hospitalControllerGetReports(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hospitals/{id}/reports',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Get hospital statistics
     * Get statistical data for a hospital
     * @param id Hospital ID
     * @param period Time period (day, week, month, year)
     * @param startDate Start date (ISO format)
     * @param endDate End date (ISO format)
     * @returns any Statistics retrieved successfully
     * @throws ApiError
     */
    public static hospitalControllerGetStats(
        id: string,
        period?: string,
        startDate?: string,
        endDate?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hospitals/{id}/stats',
            path: {
                'id': id,
            },
            query: {
                'period': period,
                'startDate': startDate,
                'endDate': endDate,
            },
        });
    }
    /**
     * Get hospital metrics
     * Retrieve specific metric data for a hospital
     * @param id Hospital ID
     * @param metric Metric name
     * @param period Time period
     * @param granularity Granularity of data
     * @returns any Metrics retrieved successfully
     * @throws ApiError
     */
    public static hospitalControllerGetMetrics(
        id: string,
        metric: string,
        period: string,
        granularity?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/hospitals/{id}/metrics',
            path: {
                'id': id,
            },
            query: {
                'metric': metric,
                'period': period,
                'granularity': granularity,
            },
        });
    }
    /**
     * Generate hospital report
     * Generate a new report for the hospital
     * @param id Hospital ID
     * @param requestBody
     * @returns any Report generated successfully
     * @throws ApiError
     */
    public static hospitalControllerGenerateReport(
        id: string,
        requestBody: GenerateReportDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/hospitals/{id}/reports/generate',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}
