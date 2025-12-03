/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateSettingsDto } from '../models/UpdateSettingsDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SettingsService {
    /**
     * Get all user settings
     * Retrieve all settings for the authenticated user
     * @returns any User settings retrieved successfully
     * @throws ApiError
     */
    public static settingsControllerGetMe(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update user settings
     * Update all or partial user settings (merges with existing)
     * @param requestBody
     * @returns any Settings updated successfully
     * @throws ApiError
     */
    public static settingsControllerPutMe(
        requestBody: UpdateSettingsDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/settings/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update specific settings category
     * Update a specific category (notification, system, communication, profile, emergency)
     * @param category Settings category (notification, system, communication, profile, emergency)
     * @param requestBody
     * @returns any Category settings updated successfully
     * @throws ApiError
     */
    public static settingsControllerPatchCategory(
        category: string,
        requestBody: Record<string, any>,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/settings/me/{category}',
            path: {
                'category': category,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Get specific settings category
     * Retrieve settings for a specific category
     * @param category Settings category (notification, system, communication, profile, emergency)
     * @returns any Category settings retrieved successfully
     * @throws ApiError
     */
    public static settingsControllerGetCategory(
        category: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/settings/me/{category}',
            path: {
                'category': category,
            },
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
