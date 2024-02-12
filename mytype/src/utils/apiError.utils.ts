export class ApiError extends Error {
  public status: number;
  public message: string;

  constructor(status?: number, message?: string) {
    super(message || "Something went wrong");
    this.status = status || 500;
    this.message = message || "Something went wrong";
  }
}
