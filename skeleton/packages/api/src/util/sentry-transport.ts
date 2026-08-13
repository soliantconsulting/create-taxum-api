import * as Sentry from "@sentry/node";
import { isError, type LogEntry, LogLevel, type Transport } from "logforth";

/**
 * Wraps the regular log transport and additionally reports error and fatal
 * entries to Sentry, so every existing log site doubles as a capture site.
 *
 * Capturing is unconditional: without a `SENTRY_DSN` the SDK is never
 * initialized (see `instrument.ts`) and every capture call is a no-op, which
 * keeps local dev and tests silent.
 */
export class SentryTransport implements Transport {
    private readonly inner: Transport;

    public constructor(inner: Transport) {
        this.inner = inner;
    }

    public log(entry: LogEntry): void {
        this.inner.log(entry);

        if (entry.level.level < LogLevel.Error.level) {
            return;
        }

        const { error, ...extras } = entry.attributes;

        Sentry.withScope((scope) => {
            scope.setLevel(entry.level === LogLevel.Fatal ? "fatal" : "error");
            scope.setExtras(extras);

            if (isError(error)) {
                scope.setExtra("logMessage", entry.message);
                Sentry.captureException(error);
                return;
            }

            if (error !== undefined) {
                scope.setExtra("error", error);
            }

            Sentry.captureMessage(entry.message);
        });
    }
}
