import { type NextFunction, type RequestHandler, type Request, type Response } from "express";
import { type ZodTypeAny } from "zod";

const buildValidator = (schema: ZodTypeAny, target: "body" | "query" | "params"): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      next(result.error);
      return;
    }

    req[target] = result.data as any;
    next();
  };
};

export const validateBody = (schema: ZodTypeAny): RequestHandler => buildValidator(schema, "body");
export const validateQuery = (schema: ZodTypeAny): RequestHandler => buildValidator(schema, "query");
export const validateParams = (schema: ZodTypeAny): RequestHandler => buildValidator(schema, "params");
