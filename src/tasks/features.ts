import { ListrEnquirerPromptAdapter } from "@listr2/prompt-adapter-enquirer";
import type { AwsEnvContext, ProjectContext } from "@soliantconsulting/starter-lib";
import type { ListrTask } from "listr2";

type Feature = "postgres" | "app-config" | "oauth2";

export type FeaturesContext = {
    features: Feature[];
};

export const featuresTask: ListrTask<Partial<ProjectContext & AwsEnvContext & FeaturesContext>> = {
    title: "Select features",
    task: async (context, task): Promise<void> => {
        const prompt = task.prompt(ListrEnquirerPromptAdapter);
        context.features = await prompt.run<Feature[]>({
            type: "multiselect",
            message: "Features:",
            choices: [
                { message: "Postgres", name: "postgres" },
                { message: "AppConfig", name: "app-config" },
                { message: "OAuth2", name: "oauth2" },
            ],
        });

        if (context.features.includes("oauth2") && context.features.includes("app-config")) {
            context.features.push("app-config");
        }
    },
};
