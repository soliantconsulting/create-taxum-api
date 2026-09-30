#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import {
    type AwsEnvContext,
    createPnpmVersionTask,
    type DeployRoleContext,
    type ProjectContext,
    runPipeline,
    type SentryContext,
} from "@soliantconsulting/starter-lib";
import type { FeaturesContext } from "./tasks/features.js";
import type { StagingDomainContext } from "./tasks/staging-domain.js";
import { synthTask } from "./tasks/synth.js";

type BaseContext = ProjectContext &
    AwsEnvContext &
    DeployRoleContext &
    FeaturesContext &
    StagingDomainContext &
    SentryContext;

const cognito = process.argv[2] === "cognito";
const directory = cognito ? "test-synth-cognito" : "test-synth";

await runPipeline({
    packageName: "@soliantconsulting/create-taxum-api",
    tasks: [createPnpmVersionTask("10.0.0"), synthTask],
    baseContext: {
        project: {
            name: directory,
            title: "Test Synth",
            path: fileURLToPath(new URL(`../${directory}`, import.meta.url)),
        },
        awsEnv: {
            accountId: "123456789",
            region: "us-east-1",
        },
        deployRole: {
            arn: "arn://unknown",
        },
        stagingDomain: {
            domainName: "test-synth.soliant-dev.io",
            certificateArn: "arn://example",
        },
        features: cognito ? ["app-config", "oauth2"] : ["postgres", "app-config", "oauth2"],
        oauthProvider: cognito ? "cognito" : "auth0",
        sentry: {
            org: "soliant-consulting-inc",
            projectSlug: "test-synth",
            dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
            authToken: "sntrys_example",
            authTokenId: "0",
        },
    } satisfies BaseContext,
});
