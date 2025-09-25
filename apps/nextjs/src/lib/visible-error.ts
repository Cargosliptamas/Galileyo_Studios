export class VisibleError extends Error {
  public readonly isVisibleError = true;

  constructor(message: string) {
    super(message);
    this.name = "VisibleError";
  }
}

export function isVisibleError(error: unknown): error is VisibleError {
  return (error as VisibleError)?.name === "VisibleError";
}
