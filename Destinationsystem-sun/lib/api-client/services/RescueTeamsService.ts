/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateRescueTeamDto } from '../models/CreateRescueTeamDto';
import type { UpdateRescueTeamDto } from '../models/UpdateRescueTeamDto';
import type { UpdateRescueTeamStatusDto } from '../models/UpdateRescueTeamStatusDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class RescueTeamsService {
    /**
     * Create rescue team
     * Create a new rescue team organization
     * @param requestBody
     * @returns any Rescue team created successfully
     * @throws ApiError
     */
    public static rescueControllerCreate(
        requestBody: CreateRescueTeamDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/rescue-teams',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
    /**
     * Get all rescue teams
     * Get list of all rescue teams with optional search
     * @param search Search query for rescue team name or location
     * @returns any Rescue teams retrieved successfully
     * @throws ApiError
     */
    public static rescueControllerFindAll(
        search?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rescue-teams',
            query: {
                'search': search,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get rescue team by ID
     * Get detailed information about a specific rescue team
     * @param id Rescue team ID
     * @returns any Rescue team retrieved successfully
     * @throws ApiError
     */
    public static rescueControllerFindOne(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rescue-teams/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Rescue team not found`,
            },
        });
    }
    /**
     * Update rescue team
     * Update rescue team information
     * @param id Rescue team ID
     * @param requestBody
     * @returns any Rescue team updated successfully
     * @throws ApiError
     */
    public static rescueControllerUpdate(
        id: string,
        requestBody: UpdateRescueTeamDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/rescue-teams/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Rescue team not found`,
            },
        });
    }
    /**
     * Update rescue team status
     * Update the availability status of a rescue team
     * @param id Rescue team ID
     * @param requestBody
     * @returns any Status updated successfully
     * @throws ApiError
     */
    public static rescueControllerUpdateStatus(
        id: string,
        requestBody: UpdateRescueTeamStatusDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/rescue-teams/{id}/status',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `Rescue team not found`,
            },
        });
    }
    /**
     * Find available rescue teams
     * Find available rescue teams within a specified radius
     * @param latitude Latitude coordinate
     * @param longitude Longitude coordinate
     * @param radius Search radius in kilometers (default: 10)
     * @returns any Available rescue teams retrieved successfully
     * @throws ApiError
     */
    public static rescueControllerFindAvailableTeams(
        latitude: number,
        longitude: number,
        radius?: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/rescue-teams/available',
            query: {
                'latitude': latitude,
                'longitude': longitude,
                'radius': radius,
            },
        });
    }
}
