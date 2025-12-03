/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UpdateProfileDto } from '../models/UpdateProfileDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Get my profile
     * Get authenticated user profile
     * @returns any User profile retrieved successfully
     * @throws ApiError
     */
    public static userControllerGetProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/users/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update my profile
     * Update authenticated user profile
     * @param requestBody
     * @returns any Profile updated successfully
     * @throws ApiError
     */
    public static userControllerUpdateProfile(
        requestBody: UpdateProfileDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/users/me',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
