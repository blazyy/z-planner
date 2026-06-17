import pino from 'pino'

/*
 * Structured server-side logger. SERVER ONLY — never import this from client/
 * browser code (apiClient.ts and friends), pino is a Node logger and would
 * bloat / break the browser bundle.
 *
 * Level comes from LOG_LEVEL (falls back to 'debug' in dev, 'info' otherwise).
 * We deliberately do NOT wire pino-pretty as a hard dep; raw NDJSON is fine for
 * server logs and stays dependency-light. If you want pretty local output, set
 * the transport via env without adding it to the bundle's required deps.
 */
const level =
  process.env.LOG_LEVEL ?? (process.env.VITEST ? 'silent' : process.env.NODE_ENV === 'production' ? 'info' : 'debug')

export const logger = pino({ level })

export default logger
