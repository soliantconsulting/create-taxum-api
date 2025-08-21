import { Logger, NdJsonTransport, PrettyTransport } from "logforth";
import { env } from "./env.js";

export const logger = new Logger({
    transport:
        process.env.NODE_ENV === "production" ? new NdJsonTransport() : new PrettyTransport(),
    minLevel: env.logger.minLevel,
});
