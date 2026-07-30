/**
 * Entry for --test-global-setup, which runs in the coordinator process.
 *
 * tsx registers its loader through --import flags on the node command line,
 * and the coordinator skips all --import preloads (they only run in test
 * workers), so TypeScript modules cannot be loaded here directly. This
 * plain-JS shim registers tsx manually and defers to the TypeScript
 * implementation.
 */

import { register } from "tsx/esm/api";

register();

const { globalSetup, globalTeardown } = await import("./db-setup.ts");

export { globalSetup, globalTeardown };
