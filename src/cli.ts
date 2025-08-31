#!/usr/bin/env node

import {
    createAwsEnvTask,
    createBitbucketRepositoryTask,
    createDeployRoleTask,
    createGitTask,
    createPnpmVersionTask,
    createProjectTask,
    runPipeline,
} from "@soliantconsulting/starter-lib";
import { featuresTask } from "./tasks/features.js";
import { stagingDomainTask } from "./tasks/staging-domain.js";
import { synthTask } from "./tasks/synth.js";
import { zoomErrorNotificationsTask } from "./tasks/zoom-error-notifications.js";

await runPipeline({
    packageName: "@soliantconsulting/create-taxum-api",
    tasks: [
        createPnpmVersionTask("10.15.0"),
        createProjectTask(),
        createAwsEnvTask(),
        createBitbucketRepositoryTask(),
        createDeployRoleTask(),
        stagingDomainTask,
        zoomErrorNotificationsTask,
        featuresTask,
        synthTask,
        createGitTask(),
    ],
});
