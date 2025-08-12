// Common primitive helpers and error types
export type Brand<Type, BrandName> = Type & { readonly __brand: BrandName };

export type Base64UrlString = Brand<string, 'Base64UrlString'>;

export type Result<T> = import('fp-ts/Either').Either<DomainError, T>;

export interface DomainError {
  readonly code:
    | 'InvalidBase64Url'
    | 'InvalidLength'
    | 'InvalidDomain'
    | 'OutOfRange'
    | 'InvalidArgument'
    | 'NotFound'
    | 'Expired';
  readonly message: string;
}

export const domainError = (code: DomainError['code'], message: string): DomainError => ({ code, message });


