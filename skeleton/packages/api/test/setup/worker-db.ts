/**
 * Per-worker database wiring, run via `--import` in every test worker before
 * any app code.
 *
 * Points the ORM at a worker-exclusive clone of the migrated template
 * database (see db-setup.ts). The clone is provisioned lazily through a
 * module loader hook: it is only created when a test file actually loads the
 * ORM, so pure unit tests skip the cost entirely.
 *
 * No per-worker teardown on purpose: clones are left behind and swept by the
 * global teardown in db-setup.ts after all workers have exited.
 */

import { spawnSync } from "node:child_process";
import { registerHooks } from "node:module";
import { after } from "node:test";
import { fileURLToPath } from "node:url";
import { templateDbName, testDatabase, workerDbName } from "./db-admin.js";

// Clearing the AWS-branch variables keeps a sourced deployment env from
// pointing the test ORM at a remote database.
delete process.env.POSTGRES_SECRET;
delete process.env.POSTGRES_HOSTNAME;
process.env.POSTGRES_DB_NAME = workerDbName;
process.env.POSTGRES_PORT = String(testDatabase.port);

// Workers run in parallel and each holds its own pool against the same
// Postgres instance, so keep the per-worker pool small.
process.env.DB_POOL_MIN ??= "0";
process.env.DB_POOL_MAX ??= "2";

const ormModulePattern = /\/src\/util\/mikro-orm\.(?:ts|js)$/;
let ormModuleLoaded = false;

const provisionWorkerDb = (): void => {
    // Loader hooks are synchronous while pg only offers an async API, so the
    // admin work runs in a child process we can block on.
    const result = spawnSync(
        process.execPath,
        [
            fileURLToPath(new URL("./provision-db.mjs", import.meta.url)),
            JSON.stringify({ testDatabase, templateDbName, workerDbName }),
        ],
        { stdio: ["ignore", "inherit", "inherit"] },
    );

    if (result.status !== 0) {
        throw new Error("Failed to provision worker database", {
            cause: result.error ?? undefined,
        });
    }
};

registerHooks({
    load: (url, context, nextLoad) => {
        if (ormModulePattern.test(url) && !ormModuleLoaded) {
            ormModuleLoaded = true;
            provisionWorkerDb();
        }

        return nextLoad(url, context);
    },
});

// Root-level hook, so it runs after all suites and their own after hooks.
// Closes the app ORM; its idle pool would otherwise keep the worker alive.
// The module cache makes this import free, and the guard keeps it from
// provisioning a database when no test ever touched the ORM.
after(async () => {
    if (!ormModuleLoaded) {
        return;
    }

    const { orm } = await import("../../src/util/mikro-orm.js");
    await orm.close(true);
});
