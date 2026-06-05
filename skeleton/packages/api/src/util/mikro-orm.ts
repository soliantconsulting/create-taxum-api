import { MikroORM } from "@mikro-orm/postgresql";
import fnv1a from "@sindresorhus/fnv1a";
import config from "../mikro-orm.config.js";

export const orm = await MikroORM.init(await config);
export const em = orm.em;

const maxInt64 = 2n ** 63n;

export const lockId = (name: string): bigint => {
    const uint = fnv1a(name, { size: 64 });
    return uint < maxInt64 ? uint : maxInt64 - uint;
};

await em.transactional(async (em) => {
    em.execute(`SELECT pg_advisory_xact_lock(${lockId("migrate")})`);
    await orm.migrator.up();
});
