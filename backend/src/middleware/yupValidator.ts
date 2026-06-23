import { Request, Response, NextFunction } from "express";
import { AnyObjectSchema } from "yup";
import { response } from "../utils/response";

const yupValidator = (schema: AnyObjectSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate req.body and strip any fields not defined in the schema
      req.body = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      next();
    } catch (error: any) {
      const formattedErrors = error.inner?.map((err: any) => ({
        field: err.path,
        message: err.message,
      })) || [{ message: error.message }];

      return response({
        res,
        status: 400,
        success: false,
        message: "Validation error",
        error: formattedErrors,
      });
    }
  };
};

export default yupValidator;
