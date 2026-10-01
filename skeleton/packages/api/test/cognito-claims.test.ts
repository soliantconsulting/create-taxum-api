import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type HttpRequest, type HttpResponse, jsonResponse } from "@taxum/core/http";
import { fromFn } from "@taxum/core/middleware/from-fn";
import { m, Router } from "@taxum/core/routing";
import type { HttpService } from "@taxum/core/service";
import { testClient } from "@taxum/testing";
import { JWT_PAYLOAD, parseCognitoClaims, requireGroup } from "../src/util/cognito-claims.js";

const accessToken = {
    sub: "user-1",
    token_use: "access",
    client_id: "spa-client",
    "cognito:groups": ["admin"],
};

describe("parseCognitoClaims", () => {
    it("accepts an access token from an allowed client", () => {
        assert.deepEqual(parseCognitoClaims(accessToken, ["spa-client"]), {
            sub: "user-1",
            groups: ["admin"],
        });
    });

    it("treats a missing groups claim as no groups", () => {
        const { "cognito:groups": _, ...withoutGroups } = accessToken;
        assert.deepEqual(parseCognitoClaims(withoutGroups, ["spa-client"]), {
            sub: "user-1",
            groups: [],
        });
    });

    it("rejects ID tokens", () => {
        assert.equal(parseCognitoClaims({ ...accessToken, token_use: "id" }, ["spa-client"]), null);
    });

    it("rejects tokens from other app clients", () => {
        assert.equal(parseCognitoClaims(accessToken, ["other-client"]), null);
    });

    it("rejects tokens without a subject", () => {
        const { sub: _, ...withoutSub } = accessToken;
        assert.equal(parseCognitoClaims(withoutSub, ["spa-client"]), null);
    });
});

const withGroups = (groups: string[]) =>
    fromFn(async (req: HttpRequest, next: HttpService): Promise<HttpResponse> => {
        req.extensions.insert(JWT_PAYLOAD, { sub: "user-1", groups });
        return next.invoke(req);
    });

const adminRouter = (groups: string[]): Router =>
    new Router()
        .route("/admin", m.get(() => jsonResponse({ ok: true })).layer(requireGroup("admin")))
        .layer(withGroups(groups));

describe("requireGroup", () => {
    it("returns 401 when there is no JWT payload", async () => {
        const router = new Router().route(
            "/admin",
            m.get(() => jsonResponse({ ok: true })).layer(requireGroup("admin")),
        );
        const response = await testClient(router).get("/admin");
        assert.equal(response.status, 401);
    });

    it("returns 403 for users outside the group", async () => {
        const response = await testClient(adminRouter([])).get("/admin");
        assert.equal(response.status, 403);
    });

    it("lets group members through", async () => {
        const response = await testClient(adminRouter(["admin"])).get("/admin");
        assert.equal(response.status, 200);
    });
});
