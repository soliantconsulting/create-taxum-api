/**
 * Global setup and teardown for the test run (--test-global-setup).
 *
 * Setup drops all leftover test databases (template and per-worker clones
 * from crashed runs), recreates the template and migrates it once. Each test
 * worker that touches the ORM then clones the template instead of migrating
 * from scratch (see worker-db.ts). Teardown sweeps everything again; the
 * sweep in setup is the safety net for runs that die before teardown fires.
 */

import { MikroORM } from "@mikro-orm/postgresql";
import { baseDbName, templateDbName, testDatabase, withAdminClient } from "./db-admin.js";

const dropTestDatabases = async (): Promise<void> => {
    await withAdminClient(async (client) => {
        const { rows } = await client.query<{ datname: string }>(
            "SELECT datname FROM pg_database WHERE datname LIKE $1",
            [`${baseDbName}%`],
        );

        for (const { datname } of rows) {
            await client.query(`DROP DATABASE IF EXISTS "${datname}" WITH (FORCE)`);
        }
    });
};

export const globalSetup = async (): Promise<void> => {
    await dropTestDatabases();

    await withAdminClient(async (client) => {
        await client.query(`CREATE DATABASE "${templateDbName}"`);
    });

    // The config reads the env overrides at import time, so they must be set
    // before the dynamic import. Clearing the AWS-branch variables keeps a
    // sourced deployment env from pointing the test ORM at a remote database.
    delete process.env.POSTGRES_SECRET;
    delete process.env.POSTGRES_HOSTNAME;
    process.env.POSTGRES_DB_NAME = templateDbName;
    process.env.POSTGRES_PORT = String(testDatabase.port);
    const { default: config } = await import("../../src/mikro-orm.config.js");

    const templateOrm = await MikroORM.init(await config);
    await templateOrm.migrator.up();
    await templateOrm.close(true);
};

export const globalTeardown = dropTestDatabases;
