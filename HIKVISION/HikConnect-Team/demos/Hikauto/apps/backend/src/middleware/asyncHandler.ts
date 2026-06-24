import type { Request, Response, NextFunction, RequestHandler } from "express";

/** Express 4 no captura rechazos async; este wrapper evita HTTP 500 con cuerpo vacío. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => void | Promise<void>
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
