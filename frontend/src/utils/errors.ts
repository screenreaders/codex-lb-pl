export function getErrorMessage(error: unknown, fallback = "Żądanie nie powiodło się"): string {
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

export function getErrorMessageOrNull(error: unknown, fallback = "Żądanie nie powiodło się"): string | null {
  if (!error) {
    return null;
  }
  return getErrorMessage(error, fallback);
}
