#!/usr/bin/env node

import {
    createAwsEnvTask,
    createBitbucketRepositoryTask,
    createDeployRoleTask,
    createGitTask,
    createNodeVersionTask,
    createPnpmVersionTask,
    createProjectTask,
    createSentryTask,
    runPipeline,
} from "@soliantconsulting/starter-lib";
import { featuresTask } from "./tasks/features.js";
import { stagingDomainTask } from "./tasks/staging-domain.js";
import { synthTask } from "./tasks/synth.js";

await runPipeline({
    packageName: "@soliantconsulting/create-taxum-api",
    tasks: [
        createPnpmVersionTask("11.0.0"),
        createNodeVersionTask("26.0.0"),
        createProjectTask(),
        createAwsEnvTask(),
        createBitbucketRepositoryTask(),
        createDeployRoleTask(),
        stagingDomainTask,
        createSentryTask({ projectPlatform: "node" }),
        featuresTask,
        synthTask,
        createGitTask(),
    ],
});
