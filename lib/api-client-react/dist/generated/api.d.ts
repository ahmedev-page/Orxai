import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { AdminLoginInput, AdminSession, AdminSummary, ApiKey, ApiKeyInput, ApiKeyUpdate, HealthStatus, PlatformSetting, PublicWhatsapp, QuotaUpdate, SettingsUpdate, User, Website, WhatsappStatus } from './api.schemas';
import { customFetch } from '../custom-fetch';
import type { ErrorType, BodyType } from '../custom-fetch';
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
export declare const getHealthCheckUrl: () => string;
/**
 * Returns server health status
 * @summary Health check
 */
export declare const healthCheck: (options?: Parameters<typeof customFetch>[1]) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPublicWhatsappUrl: () => string;
/**
 * @summary Get the public WhatsApp number
 */
export declare const getPublicWhatsapp: (options?: Parameters<typeof customFetch>[1]) => Promise<PublicWhatsapp>;
export declare const getGetPublicWhatsappQueryKey: () => readonly ["/api/public/settings/whatsapp"];
export declare const getGetPublicWhatsappQueryOptions: <TData = Awaited<ReturnType<typeof getPublicWhatsapp>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicWhatsapp>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPublicWhatsapp>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPublicWhatsappQueryResult = NonNullable<Awaited<ReturnType<typeof getPublicWhatsapp>>>;
export type GetPublicWhatsappQueryError = ErrorType<unknown>;
/**
 * @summary Get the public WhatsApp number
 */
export declare function useGetPublicWhatsapp<TData = Awaited<ReturnType<typeof getPublicWhatsapp>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicWhatsapp>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetPublicWebsiteUrl: (publicId: string) => string;
/**
 * @summary Get a website by its public id
 */
export declare const getPublicWebsite: (publicId: string, options?: Parameters<typeof customFetch>[1]) => Promise<Website>;
export declare const getGetPublicWebsiteQueryKey: (publicId: string) => readonly [`/api/public/websites/${string}`];
export declare const getGetPublicWebsiteQueryOptions: <TData = Awaited<ReturnType<typeof getPublicWebsite>>, TError = ErrorType<void>>(publicId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicWebsite>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getPublicWebsite>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetPublicWebsiteQueryResult = NonNullable<Awaited<ReturnType<typeof getPublicWebsite>>>;
export type GetPublicWebsiteQueryError = ErrorType<void>;
/**
 * @summary Get a website by its public id
 */
export declare function useGetPublicWebsite<TData = Awaited<ReturnType<typeof getPublicWebsite>>, TError = ErrorType<void>>(publicId: string, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getPublicWebsite>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getAdminLoginUrl: () => string;
/**
 * @summary Sign in to the admin console
 */
export declare const adminLogin: (adminLoginInput: AdminLoginInput, options?: Parameters<typeof customFetch>[1]) => Promise<AdminSession>;
export declare const getAdminLoginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export type AdminLoginMutationResult = NonNullable<Awaited<ReturnType<typeof adminLogin>>>;
export type AdminLoginMutationBody = BodyType<AdminLoginInput>;
export type AdminLoginMutationError = ErrorType<void>;
/**
* @summary Sign in to the admin console
*/
export declare const useAdminLogin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof adminLogin>>, TError, {
        data: BodyType<AdminLoginInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof adminLogin>>, TError, {
    data: BodyType<AdminLoginInput>;
}, TContext>;
export declare const getGetAdminSummaryUrl: () => string;
/**
 * @summary Get dashboard summary
 */
export declare const getAdminSummary: (options?: Parameters<typeof customFetch>[1]) => Promise<AdminSummary>;
export declare const getGetAdminSummaryQueryKey: () => readonly ["/api/admin/summary"];
export declare const getGetAdminSummaryQueryOptions: <TData = Awaited<ReturnType<typeof getAdminSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminSummary>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminSummaryQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminSummary>>>;
export type GetAdminSummaryQueryError = ErrorType<unknown>;
/**
 * @summary Get dashboard summary
 */
export declare function useGetAdminSummary<TData = Awaited<ReturnType<typeof getAdminSummary>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminSummary>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getGetAdminWhatsappStatusUrl: () => string;
/**
 * @summary Check Meta WhatsApp Cloud API status
 */
export declare const getAdminWhatsappStatus: (options?: Parameters<typeof customFetch>[1]) => Promise<WhatsappStatus>;
export declare const getGetAdminWhatsappStatusQueryKey: () => readonly ["/api/admin/whatsapp/status"];
export declare const getGetAdminWhatsappStatusQueryOptions: <TData = Awaited<ReturnType<typeof getAdminWhatsappStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminWhatsappStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getAdminWhatsappStatus>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetAdminWhatsappStatusQueryResult = NonNullable<Awaited<ReturnType<typeof getAdminWhatsappStatus>>>;
export type GetAdminWhatsappStatusQueryError = ErrorType<unknown>;
/**
 * @summary Check Meta WhatsApp Cloud API status
 */
export declare function useGetAdminWhatsappStatus<TData = Awaited<ReturnType<typeof getAdminWhatsappStatus>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getAdminWhatsappStatus>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getListAdminUsersUrl: () => string;
/**
 * @summary List users
 */
export declare const listAdminUsers: (options?: Parameters<typeof customFetch>[1]) => Promise<User[]>;
export declare const getListAdminUsersQueryKey: () => readonly ["/api/admin/users"];
export declare const getListAdminUsersQueryOptions: <TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminUsers>>>;
export type ListAdminUsersQueryError = ErrorType<unknown>;
/**
 * @summary List users
 */
export declare function useListAdminUsers<TData = Awaited<ReturnType<typeof listAdminUsers>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateUserQuotaUrl: (id: string) => string;
/**
 * @summary Adjust a user's quota
 */
export declare const updateUserQuota: (id: string, quotaUpdate: QuotaUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<User>;
export declare const getUpdateUserQuotaMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserQuota>>, TError, {
        id: string;
        data: BodyType<QuotaUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUserQuota>>, TError, {
    id: string;
    data: BodyType<QuotaUpdate>;
}, TContext>;
export type UpdateUserQuotaMutationResult = NonNullable<Awaited<ReturnType<typeof updateUserQuota>>>;
export type UpdateUserQuotaMutationBody = BodyType<QuotaUpdate>;
export type UpdateUserQuotaMutationError = ErrorType<unknown>;
/**
* @summary Adjust a user's quota
*/
export declare const useUpdateUserQuota: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUserQuota>>, TError, {
        id: string;
        data: BodyType<QuotaUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUserQuota>>, TError, {
    id: string;
    data: BodyType<QuotaUpdate>;
}, TContext>;
export declare const getListAdminApiKeysUrl: () => string;
/**
 * @summary List Gemini API key metadata
 */
export declare const listAdminApiKeys: (options?: Parameters<typeof customFetch>[1]) => Promise<ApiKey[]>;
export declare const getListAdminApiKeysQueryKey: () => readonly ["/api/admin/api-keys"];
export declare const getListAdminApiKeysQueryOptions: <TData = Awaited<ReturnType<typeof listAdminApiKeys>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminApiKeys>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminApiKeys>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminApiKeysQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminApiKeys>>>;
export type ListAdminApiKeysQueryError = ErrorType<unknown>;
/**
 * @summary List Gemini API key metadata
 */
export declare function useListAdminApiKeys<TData = Awaited<ReturnType<typeof listAdminApiKeys>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminApiKeys>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getCreateAdminApiKeyUrl: () => string;
/**
 * @summary Add a Gemini API key
 */
export declare const createAdminApiKey: (apiKeyInput: ApiKeyInput, options?: Parameters<typeof customFetch>[1]) => Promise<ApiKey>;
export declare const getCreateAdminApiKeyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminApiKey>>, TError, {
        data: BodyType<ApiKeyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createAdminApiKey>>, TError, {
    data: BodyType<ApiKeyInput>;
}, TContext>;
export type CreateAdminApiKeyMutationResult = NonNullable<Awaited<ReturnType<typeof createAdminApiKey>>>;
export type CreateAdminApiKeyMutationBody = BodyType<ApiKeyInput>;
export type CreateAdminApiKeyMutationError = ErrorType<unknown>;
/**
* @summary Add a Gemini API key
*/
export declare const useCreateAdminApiKey: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createAdminApiKey>>, TError, {
        data: BodyType<ApiKeyInput>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createAdminApiKey>>, TError, {
    data: BodyType<ApiKeyInput>;
}, TContext>;
export declare const getUpdateAdminApiKeyUrl: (id: string) => string;
/**
 * @summary Toggle an API key
 */
export declare const updateAdminApiKey: (id: string, apiKeyUpdate: ApiKeyUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<ApiKey>;
export declare const getUpdateAdminApiKeyMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminApiKey>>, TError, {
        id: string;
        data: BodyType<ApiKeyUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAdminApiKey>>, TError, {
    id: string;
    data: BodyType<ApiKeyUpdate>;
}, TContext>;
export type UpdateAdminApiKeyMutationResult = NonNullable<Awaited<ReturnType<typeof updateAdminApiKey>>>;
export type UpdateAdminApiKeyMutationBody = BodyType<ApiKeyUpdate>;
export type UpdateAdminApiKeyMutationError = ErrorType<unknown>;
/**
* @summary Toggle an API key
*/
export declare const useUpdateAdminApiKey: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminApiKey>>, TError, {
        id: string;
        data: BodyType<ApiKeyUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAdminApiKey>>, TError, {
    id: string;
    data: BodyType<ApiKeyUpdate>;
}, TContext>;
export declare const getListAdminSettingsUrl: () => string;
/**
 * @summary List platform settings
 */
export declare const listAdminSettings: (options?: Parameters<typeof customFetch>[1]) => Promise<PlatformSetting[]>;
export declare const getListAdminSettingsQueryKey: () => readonly ["/api/admin/settings"];
export declare const getListAdminSettingsQueryOptions: <TData = Awaited<ReturnType<typeof listAdminSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listAdminSettings>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListAdminSettingsQueryResult = NonNullable<Awaited<ReturnType<typeof listAdminSettings>>>;
export type ListAdminSettingsQueryError = ErrorType<unknown>;
/**
 * @summary List platform settings
 */
export declare function useListAdminSettings<TData = Awaited<ReturnType<typeof listAdminSettings>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listAdminSettings>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export declare const getUpdateAdminSettingsUrl: () => string;
/**
 * @summary Update platform settings
 */
export declare const updateAdminSettings: (settingsUpdate: SettingsUpdate, options?: Parameters<typeof customFetch>[1]) => Promise<PlatformSetting[]>;
export declare const getUpdateAdminSettingsMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminSettings>>, TError, {
        data: BodyType<SettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateAdminSettings>>, TError, {
    data: BodyType<SettingsUpdate>;
}, TContext>;
export type UpdateAdminSettingsMutationResult = NonNullable<Awaited<ReturnType<typeof updateAdminSettings>>>;
export type UpdateAdminSettingsMutationBody = BodyType<SettingsUpdate>;
export type UpdateAdminSettingsMutationError = ErrorType<unknown>;
/**
* @summary Update platform settings
*/
export declare const useUpdateAdminSettings: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateAdminSettings>>, TError, {
        data: BodyType<SettingsUpdate>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateAdminSettings>>, TError, {
    data: BodyType<SettingsUpdate>;
}, TContext>;
export {};
//# sourceMappingURL=api.d.ts.map