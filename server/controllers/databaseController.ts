import { RequestHandler } from 'express';
import { ServerError } from '../types';
import pg from 'pg';
const { Pool } = pg;

export const queryStarWarsDatabase: RequestHandler = async (
  _req,
  res,
  next
) => {
  const pool = new Pool({
    connectionString: process.env.SUPABASE_URI,
  });

  const { databaseQuery } = res.locals;
  try {
    if (!databaseQuery) {
      const error: ServerError = {
        log: 'Database query middleware did not receive a query',
        status: 500,
        message: { err: 'An error occurred before querying the database' },
      };
      return next(error);
    }

    if (!databaseQuery.toUpperCase().trim().startsWith('SELECT')) {
      const error: ServerError = {
        log: 'Database query middleware received a non-SELECT query',
        status: 500,
        message: { err: 'An error occurred before querying the database' },
      };
      return next(error);
    }

    const result = await pool.query(databaseQuery);

    res.locals.databaseQueryResult = result.rows;
    return next();
  } catch (e) {
    const serverError: ServerError = {
      log: `Error executing database query: ${e instanceof Error ? e.message : 'Unknown error'}`,
      status: 500,
      message: { err: 'An error occurred while querying database' },
    };
    return next(serverError);
  } finally {
    if (pool.end) {
      await pool.end();
    }
  }
};
