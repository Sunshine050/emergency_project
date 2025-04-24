import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator for marking routes as public (no authentication required)
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);