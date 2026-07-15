export type AuthResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};