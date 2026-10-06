import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkUserPoolArn } from "../skeleton/packages/cdk/src/user-pool-arn.js";

const env = { account: "123456789012", region: "us-east-1" };
const validArn = "arn:aws:cognito-idp:us-east-1:123456789012:userpool/us-east-1_AbC123xyz";

describe("checkUserPoolArn", () => {
    it("accepts a user pool in the stack's account and region", () => {
        assert.doesNotThrow(() => checkUserPoolArn(validArn, env));
    });

    it("accepts other AWS partitions", () => {
        const arn =
            "arn:aws-us-gov:cognito-idp:us-gov-west-1:123456789012:userpool/us-gov-west-1_AbC123";
        assert.doesNotThrow(() => checkUserPoolArn(arn, { ...env, region: "us-gov-west-1" }));
    });

    it("rejects values that are not a user pool ARN", () => {
        const malformed = [
            "us-east-1_AbC123xyz",
            "arn:aws:cognito-idp:us-east-1:123456789012:userpool/*",
            "arn:aws:cognito-idp:us-east-1:12345:userpool/us-east-1_AbC123xyz",
            "arn:aws:cognito-identity:us-east-1:123456789012:identitypool/us-east-1:abc",
            `${validArn}/extra`,
        ];

        for (const value of malformed) {
            assert.throws(() => checkUserPoolArn(value, env), /not a Cognito user pool ARN/, value);
        }
    });

    it("rejects a pool in another region", () => {
        const arn = "arn:aws:cognito-idp:eu-west-1:123456789012:userpool/eu-west-1_AbC123xyz";
        assert.throws(() => checkUserPoolArn(arn, env), /is in eu-west-1/);
    });

    it("rejects a pool in another account", () => {
        const arn = "arn:aws:cognito-idp:us-east-1:999999999999:userpool/us-east-1_AbC123xyz";
        assert.throws(() => checkUserPoolArn(arn, env), /is in account 999999999999/);
    });
});
