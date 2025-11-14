import * as Sentry from "@sentry/node";

const sentryDsn = process.env.SENTRY_DSN;
if (!sentryDsn) {
  throw new Error('SENTRY_DSN environment variable is not set');
}

Sentry.init({
  dsn: sentryDsn,
  tracesSampleRate: 1.0,
});

export default Sentry;
