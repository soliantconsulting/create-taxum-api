import { ListrEnquirerPromptAdapter } from "@listr2/prompt-adapter-enquirer";
import type { AwsEnvContext, ProjectContext } from "@soliantconsulting/starter-lib";
import type { ListrTask } from "listr2";

type Feature = "postgres" | "app-config" | "oauth2";
export type OAuthProvider = "auth0" | "cognito";

export type FeaturesContext = {
    features: Feature[];
    oauthProvider: OAuthProvider | null;
};

export const normalizeFeatures = (features: readonly Feature[]): Feature[] =>
    features.includes("oauth2") && !features.includes("app-config")
        ? [...features, "app-config"]
        : [...features];

export const featuresTask: ListrTask<Partial<ProjectContext & AwsEnvContext & FeaturesContext>> = {
    title: "Select features",
    task: async (context, task): Promise<void> => {
        const prompt = task.prompt(ListrEnquirerPromptAdapter);
        const features = normalizeFeatures(
            await prompt.run<Feature[]>({
                type: "multiselect",
                message: "Features:",
                choices: [
                    { message: "Postgres", name: "postgres" },
                    { message: "AppConfig", name: "app-config" },
                    { message: "OAuth2", name: "oauth2" },
                ],
            }),
        );

        context.features = features;
        context.oauthProvider = features.includes("oauth2")
            ? await prompt.run<OAuthProvider>({
                  type: "select",
                  message: "OAuth2 provider:",
                  choices: [
                      { message: "Auth0", name: "auth0" },
                      { message: "Cognito", name: "cognito" },
                  ],
              })
            : null;
    },
};
