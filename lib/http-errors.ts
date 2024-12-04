export class RequestError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "RequestError";
  }
}

export class ValidationError extends RequestError {
  constructor(fieldErrors: Record<string, string[]>) {
    const message = ValidationError.formatFieldErrors(fieldErrors);
    super(400, message, fieldErrors);
    this.name = "ValidationError";
    this.errors = fieldErrors;
  }

  static formatFieldErrors(errors: Record<string, string[]>): string {
    const formattedMessages = Object.entries(errors).map(
      ([field, messages]) => {
        const fieldName = field.charAt(0).toUpperCase() + field.slice(1);

        if (messages[0] === "Required") {
          return `${fieldName} is required`;
        } else {
          return messages.join(" and ");
        }
      }
    ); //* แปลง Object errors ที่เป็น parameter ให้อยู่ในรูปของ array จากนั้นก็เข้าถึง error ทีละตัวโดย ย่อยออกมาเป็น field และ messages จากนั้นก็สร้างตัวแปร fieldName ขึ้นมา และทำการเปลี่ยนตัวอักษรตัวแรกเป็นตัวใหญ่ สร้างเงื่อนไขเข้ามาตรวจสอบว่า messages ตัวแรกใน array เป็น Required หรือไม่ ถ้าใช่ก็ให้ return ออกมาเป็นประโยคว่า field นั้น is required ถ้าไม่ใช่ Required ก็ให้สมาชิก Messages ทุกตัว เชื่อมกันด้วย and

    return formattedMessages.join(", "); //* จากนั้นก็ให้สมาชิกแต่ละตัวของ errors เชื่อมข้อความกันด้วย ,
  }
}

export class NotFoundError extends RequestError {
  constructor(resource: string) {
    super(404, `${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends RequestError {
  constructor(message: string = "Forbidden") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends RequestError {
  constructor(message: string = "Unauthorized") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}
