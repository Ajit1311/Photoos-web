export type Success<T> = {
  success: true;
  data: T;
};

export type Failure = {
  success: false;
  error: string;
};

export type Result<T> =
  | Success<T>
  | Failure;

export function ok<T>(
  data: T,
): Success<T> {
  return {
    success: true,
    data,
  };
}

export function fail(
  error: string,
): Failure {
  return {
    success: false,
    error,
  };
}