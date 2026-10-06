import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { ignoreList } from "../src/tasks/synth.js";

const cognitoOnlyFiles = [
    "packages/api/src/util/cognito-claims.ts",
    "packages/api/test/cognito-claims.test.ts",
    "packages/api/test/auth.test.ts.liquid",
    "packages/cdk/src/user-pool-arn.ts",
];

const authFile = "packages/api/src/util/auth.ts.liquid";

describe("ignoreList", () => {
    it("keeps the Cognito files for a Cognito project", () => {
        const list = ignoreList({ features: ["oauth2", "app-config"], oauthProvider: "cognito" });

        for (const file of [...cognitoOnlyFiles, authFile]) {
            assert.ok(!list.includes(file), file);
        }
    });

    it("leaves the Cognito files out of an Auth0 project", () => {
        const list = ignoreList({ features: ["oauth2", "app-config"], oauthProvider: "auth0" });

        for (const file of cognitoOnlyFiles) {
            assert.ok(list.includes(file), file);
        }

        assert.ok(!list.includes(authFile));
    });

    it("leaves all auth files out of a project without OAuth2", () => {
        const list = ignoreList({ features: [], oauthProvider: null });

        for (const file of [...cognitoOnlyFiles, authFile]) {
            assert.ok(list.includes(file), file);
        }
    });

    it("names files that exist in the skeleton", () => {
        for (const file of [...cognitoOnlyFiles, authFile]) {
            const path = fileURLToPath(new URL(`../skeleton/${file}`, import.meta.url));
            assert.ok(existsSync(path), file);
        }
    });
});
