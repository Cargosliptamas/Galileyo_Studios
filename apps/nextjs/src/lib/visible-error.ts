export class VisibleError extends Error {
  public readonly isVisibleError = true;

  constructor(message: string) {
    super(message);
    this.name = "VisibleError";
  }
}

export function isVisibleError(error: unknown): error is VisibleError {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "VisibleError"
  );
}
