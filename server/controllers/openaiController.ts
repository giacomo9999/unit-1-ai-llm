import { RequestHandler } from 'express';
import { ServerError } from '../types';

export const queryOpenAI: RequestHandler = async (_req, res, next) => {
  const { naturalLanguageQuery } = res.locals;
  if (!naturalLanguageQuery) {
    const error: ServerError = {
      log: 'OpenAI query middleware did not receive a query',
      status: 500,
      message: { err: 'An error occurred before querying OpenAI' },
    };
    return next(error);
  }
  res.locals.databaseQuery =
    "SELECT name FROM public.people WHERE eye_color = 'white';";
  return next();
};
