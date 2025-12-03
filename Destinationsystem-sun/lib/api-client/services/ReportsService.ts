/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ReportsService {
    /**
     * Get report status
     * Get the generation status of a report
     * @param id Report ID
     * @returns any Report status retrieved successfully
     * @throws ApiError
     */
    public static reportsControllerGetStatus(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/{id}/status',
            path: {
                'id': id,
            },
            errors: {
                404: `Report not found`,
            },
        });
    }
    /**
     * Download report
     * Download a completed report as PDF
     * @param id Report ID
     * @returns any Report downloaded successfully
     * @throws ApiError
     */
    public static reportsControllerDownload(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/reports/{id}/download',
            path: {
                'id': id,
            },
            errors: {
                404: `Report not found or not ready`,
            },
        });
    }
}
