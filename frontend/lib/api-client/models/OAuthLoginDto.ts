/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type OAuthLoginDto = {
    /**
     * OAuth provider
     */
    provider: OAuthLoginDto.provider;
    /**
     * Redirect URL after login (optional)
     */
    redirectUrl?: string;
};
export namespace OAuthLoginDto {
    /**
     * OAuth provider
     */
    export enum provider {
        GOOGLE = 'google',
        FACEBOOK = 'facebook',
        APPLE = 'apple',
    }
}

