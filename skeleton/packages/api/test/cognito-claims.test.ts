import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { jsonResponse } from "@taxum/core/http";
import { m, Router } from "@taxum/core/routing";
import { testClient } from "@taxum/testing";
import { parseCognitoClaims, requireGroup } from "../src/util/cognito-claims.js";

const accessToken = {
    sub: "user-1",
    token_use: "access",
    client_id: "spa-client",
    "cognito:groups": ["admin"],
};

describe("parseCognitoClaims", () => {
    it("treats a missing groups claim as no groups", () => {
        const { "cognito:groups": _, ...withoutGroups } = accessToken;
        assert.deepEqual(parseCognitoClaims(withoutGroups, ["spa-client"]), {
            sub: "user-1",
            groups: [],
        });
    });

    it("rejects tokens without a subject", () => {
        const { sub: _, ...withoutSub } = accessToken;
        assert.equal(parseCognitoClaims(withoutSub, ["spa-client"]), null);
    });
});

describe("requireGroup", () => {
    it("returns 401 when there is no JWT payload", async () => {
        const router = new Router().route(
            "/admin",
            m.get(() => jsonResponse({ ok: true })).layer(requireGroup("admin")),
        );
        const response = await testClient(router).get("/admin");
        assert.equal(response.status, 401);
    });
});
