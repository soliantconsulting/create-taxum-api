type StackEnv = {
    account?: string;
    region?: string;
};

const userPoolArnPattern =
    /^arn:aws[a-z-]*:cognito-idp:([a-z0-9-]+):(\d{12}):userpool\/[a-z0-9-]+_[A-Za-z0-9]+$/;

/**
 * Rejects anything but the ARN of a Cognito user pool in the stack's own account and region.
 */
export const checkUserPoolArn = (userPoolArn: string, env: StackEnv | undefined): void => {
    const match = userPoolArnPattern.exec(userPoolArn);

    if (!match) {
        throw new Error(
            `userPoolArn is not a Cognito user pool ARN; copy CognitoUserPoolArn from the React app's stack outputs: ${userPoolArn}`,
        );
    }

    const [, region, account] = match;

    if (env?.region && env.region !== region) {
        throw new Error(`userPoolArn is in ${region}, but this stack deploys to ${env.region}`);
    }

    if (env?.account && env.account !== account) {
        throw new Error(
            `userPoolArn is in account ${account}, but this stack deploys to ${env.account}`,
        );
    }
};
