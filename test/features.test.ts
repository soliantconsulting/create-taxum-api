import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeFeatures } from "../src/tasks/features.js";

describe("normalizeFeatures", () => {
    it("adds app-config when OAuth2 is picked without it", () => {
        assert.deepEqual(normalizeFeatures(["oauth2"]), ["oauth2", "app-config"]);
    });

    it("does not add app-config twice", () => {
        assert.deepEqual(normalizeFeatures(["app-config", "oauth2"]), ["app-config", "oauth2"]);
    });

    it("leaves other selections alone", () => {
        assert.deepEqual(normalizeFeatures(["postgres"]), ["postgres"]);
    });
});
