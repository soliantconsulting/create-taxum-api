import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { type FeaturesContext, featuresTask, normalizeFeatures } from "../src/tasks/features.js";

describe("normalizeFeatures", () => {
    it("adds app-config when OAuth2 is picked without it", () => {
        assert.deepEqual(normalizeFeatures(["oauth2"]), ["oauth2", "app-config"]);
    });

    it("does not add app-config twice", () => {
        assert.deepEqual(normalizeFeatures(["app-config", "oauth2"]), ["app-config", "oauth2"]);
    });
});

type FeaturesTaskWrapper = Parameters<typeof featuresTask.task>[1];

type PromptOptions = {
    message: string;
};

type FeaturesTaskRun = {
    context: Partial<FeaturesContext>;
    messages: string[];
};

// Answers the prompts in order and records which ones were asked.
const runFeaturesTask = async (answers: unknown[]): Promise<FeaturesTaskRun> => {
    const context: Partial<FeaturesContext> = {};
    const messages: string[] = [];
    const task = {
        prompt: () => ({
            run: async ({ message }: PromptOptions) => {
                messages.push(message);
                return answers.shift();
            },
        }),
    };

    await featuresTask.task(context, task as unknown as FeaturesTaskWrapper);
    return { context, messages };
};

describe("featuresTask", () => {
    it("asks for the provider when OAuth2 is picked", async () => {
        const { context, messages } = await runFeaturesTask([["oauth2"], "cognito"]);

        assert.deepEqual(messages, ["Features:", "OAuth2 provider:"]);
        assert.deepEqual(context, {
            features: ["oauth2", "app-config"],
            oauthProvider: "cognito",
        });
    });

    it("skips the provider prompt without OAuth2", async () => {
        const { context, messages } = await runFeaturesTask([["postgres"]]);

        assert.deepEqual(messages, ["Features:"]);
        assert.deepEqual(context, { features: ["postgres"], oauthProvider: null });
    });
});
