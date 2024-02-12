class ApiResponse {
  public statusCode: string | number;
  public data: any;
  public message?: string;
  public success?: boolean;

  constructor(statusCode: string | number, data: any, message: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message || "Success.";
    this.success = true;
  }
}

export { ApiResponse };
