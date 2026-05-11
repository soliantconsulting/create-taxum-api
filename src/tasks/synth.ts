import { fileURLToPath } from "node:url";
import {
    type AwsEnvContext,
    createSynthTask,
    type ProjectContext,
} from "@soliantconsulting/starter-lib";
import type { FeaturesContext } from "./features.js";
import type { StagingDomainContext } from "./staging-domain.js";
import type { ZoomErrorNotificationsContext } from "./zoom-error-notifications.js";

export const synthTask = createSynthTask(
    fileURLToPath(new URL("../../skeleton", import.meta.url)),
    {
        ignoreList: (
            context: Partial<
                AwsEnvContext &
                    ProjectContext &
                    ZoomErrorNotificationsContext &
                    FeaturesContext &
                    StagingDomainContext
            >,
        ) => {
            const list: string[] = [];

            if (!context.awsEnv) {
                list.push("cdk");
                list.push("bitbucket-pipelines.yml.liquid");
            }

            if (!context.stagingDomain) {
                list.push(".sld-dns-control.json.liquid");
            }

            if (!context.features?.includes("postgres")) {
                list.push("docker-compose.yml");
                list.push("packages/api/src/mikro-orm.config.ts");
                list.push("packages/api/src/util/mikro-orm.ts");
            }

            if (!context.features?.includes("app-config")) {
                list.push("packages/app-config");
                list.push("packages/cdk/src/app-config.ts");
                list.push("dev-app-config.toml.dist");
            }

            if (!context.features?.includes("oauth2")) {
                list.push("packages/api/src/util/auth.ts.liquid");
            }

            return list;
        },
    },
);
