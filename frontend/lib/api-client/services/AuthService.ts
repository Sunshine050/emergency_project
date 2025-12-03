/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginDto } from '../models/LoginDto';
import type { OAuthLoginDto } from '../models/OAuthLoginDto';
import type { RefreshTokenDto } from '../models/RefreshTokenDto';
import type { RegisterDto } from '../models/RegisterDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user (staff)
     * @param requestBody
     * @returns any Registration successful
     * @throws ApiError
     */
    public static authControllerRegister(
        requestBody: RegisterDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Registration failed`,
                409: `Email already in use`,
            },
        });
    }
    /**
     * Login with email and password
     * @param requestBody
     * @returns any Login successful
     * @throws ApiError
     */
    public static authControllerLogin(
        requestBody: LoginDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid email or password`,
            },
        });
    }
    /**
     * Initiate OAuth login flow
     * @param requestBody
     * @returns any OAuth URL generated
     * @throws ApiError
     */
    public static authControllerOauthLogin(
        requestBody: OAuthLoginDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/login/oauth',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Invalid provider`,
            },
        });
    }
    /**
     * Handle OAuth callback
     * @param provider OAuth provider (google, facebook, apple)
     * @param code Authorization code
     * @param accessToken Access token for implicit flow
     * @returns any OAuth callback successful
     * @throws ApiError
     */
    public static authControllerOauthCallback(
        provider: string,
        code?: string,
        accessToken?: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/callback',
            query: {
                'provider': provider,
                'code': code,
                'access_token': accessToken,
            },
            errors: {
                400: `Missing provider or code/access_token`,
                401: `Cannot authenticate with provider`,
            },
        });
    }
    /**
     * Get authenticated user profile
     * @returns any User profile retrieved
     * @throws ApiError
     */
    public static authControllerGetProfile(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/me',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Verify JWT token
     * @returns any Token is valid
     * @throws ApiError
     */
    public static authControllerVerifyToken(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/verify-token',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Refresh JWT token
     * @param requestBody
     * @returns any Token refreshed successfully
     * @throws ApiError
     */
    public static authControllerRefreshToken(
        requestBody: RefreshTokenDto,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/refresh',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing refresh token`,
            },
        });
    }
    /**
     * Login with Supabase token
     * @param requestBody
     * @returns any Supabase login successful
     * @throws ApiError
     */
    public static authControllerSupabaseLogin(
        requestBody: {
            access_token?: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/auth/supabase-login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing access token`,
            },
        });
    }
}
