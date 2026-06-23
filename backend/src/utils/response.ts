import { Response } from "express";

interface ResponseOptions {
  res: Response;
  status?: number;
  success?: boolean;
  message?: string;
  data?: any;
  error?: any;
}

export const response = ({
  res,
  status = 200,
  success = true,
  message = "",
  data = null,
  error = null,
}: ResponseOptions) => {
  return res.status(status).json({
    success,
    status,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  });
};
