import { Client } from "pg";

/**
 * Coordinates of the tmpfs-backed `postgres-test` instance (docker-compose.yml).
 * It loses all data on container restart; only the test harness targets it.
 */
export const testDatabase = {
    host: "localhost",
    port: 3002,
    user: "dev",
    password: "dev",
} as const;

export const baseDbName = "test";
export const templateDbName = `${baseDbName}_template`;
export const workerDbName = `${baseDbName}_${process.pid}`;

type AdminAction = (client: Client) => Promise<void>;

export const withAdminClient = async (action: AdminAction): Promise<void> => {
    const client = new Client({
        ...testDatabase,
        database: "postgres",
    });

    try {
        await client.connect();
    } catch (error) {
        throw new Error(
            `Cannot reach the postgres-test instance at ${testDatabase.host}:${testDatabase.port}. Is it running? (docker compose up -d postgres-test)`,
            { cause: error },
        );
    }

    try {
        await action(client);
    } finally {
        await client.end();
    }
};
