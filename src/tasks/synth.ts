import { fileURLToPath } from "node:url";
import {
    type AwsEnvContext,
    createSynthTask,
    type ProjectContext,
    type SentryContext,
} from "@soliantconsulting/starter-lib";
import type { FeaturesContext } from "./features.js";
import type { StagingDomainContext } from "./staging-domain.js";

type SynthContext = Partial<
    AwsEnvContext & ProjectContext & SentryContext & FeaturesContext & StagingDomainContext
>;

export const ignoreList = (context: SynthContext): string[] => {
    const list: string[] = [];

    if (!context.awsEnv) {
        list.push("cdk");
        list.push("bitbucket-pipelines.yml.liquid");
    }

    if (!context.stagingDomain) {
        list.push(".sld-dns-control.json.liquid");
    }

    if (!context.sentry) {
        list.push("packages/api/src/instrument.ts");
    }

    if (!context.features?.includes("postgres")) {
        list.push("docker-compose.yml");
        list.push("packages/api/src/mikro-orm.config.ts");
        list.push("packages/api/src/util/mikro-orm.ts");
        list.push("packages/api/test/setup");
    }

    if (!context.features?.includes("app-config")) {
        list.push("packages/app-config");
        list.push("packages/cdk/src/app-config.ts");
        list.push("dev-app-config.toml.dist.liquid");
    }

    if (!context.features?.includes("oauth2")) {
        list.push("packages/api/src/util/auth.ts.liquid");
    }

    if (context.oauthProvider !== "cognito") {
        list.push("packages/api/src/util/cognito-claims.ts");
        list.push("packages/api/test/cognito-claims.test.ts");
        list.push("packages/api/test/auth.test.ts.liquid");
        list.push("packages/cdk/src/user-pool-arn.ts");
    }

    return list;
};

export const synthTask = createSynthTask(
    fileURLToPath(new URL("../../skeleton", import.meta.url)),
    {
        ignoreList,
    },
);
