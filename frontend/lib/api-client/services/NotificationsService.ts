/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotificationsService {
    /**
     * Get all notifications
     * Get all notifications for authenticated user
     * @returns any Notifications retrieved successfully
     * @throws ApiError
     */
    public static notificationControllerFindAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/notifications',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Mark notification as read
     * Mark a specific notification as read
     * @param id Notification ID
     * @returns any Notification marked as read successfully
     * @throws ApiError
     */
    public static notificationControllerMarkAsRead(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/notifications/{id}/read',
            path: {
                'id': id,
            },
            errors: {
                404: `Notification not found`,
            },
        });
    }
    /**
     * Mark all notifications as read
     * Mark all notifications as read for authenticated user
     * @returns any All notifications marked as read successfully
     * @throws ApiError
     */
    public static notificationControllerMarkAllAsRead(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/notifications/read-all',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Delete notification
     * Delete a specific notification
     * @param id Notification ID
     * @returns any Notification deleted successfully
     * @throws ApiError
     */
    public static notificationControllerDeleteNotification(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/notifications/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Notification not found`,
            },
        });
    }
}
