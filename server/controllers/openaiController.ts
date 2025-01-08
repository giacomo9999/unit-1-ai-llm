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

  console.log(naturalLanguageQuery);

  // TODO: query OpenAI
  const openaiResponse = await fetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: `${JSON.stringify(naturalLanguageQuery)}` },
        ],
        temperature: 0.7,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  console.log('openaiAPIResponse', openaiResponse.body);

  res.locals.databaseQuery =
    "SELECT name FROM public.people WHERE eye_color = 'brown' AND hair_color = 'black';";
  return next();
};
