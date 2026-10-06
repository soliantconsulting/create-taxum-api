import { ExtensionKey, type HttpRequest, type HttpResponse, StatusCode } from "@taxum/core/http";
import { fromFn } from "@taxum/core/middleware/from-fn";
import type { HttpService } from "@taxum/core/service";
import { ClientError } from "@taxum/core/util";
import { z } from "zod";

const cognitoAccessTokenSchema = z.object({
    sub: z.string(),
    token_use: z.literal("access"),
    client_id: z.string(),
    "cognito:groups": z.array(z.string()).optional(),
});

export type JwtPayload = {
    sub: string;
    groups: string[];
};

export const JWT_PAYLOAD = new ExtensionKey<JwtPayload>("JWT Payload");

/**
 * Cognito access tokens carry `client_id` instead of `aud`, so the audience is checked here.
 */
export const parseCognitoClaims = (
    payload: unknown,
    allowedClientIds: readonly string[],
): JwtPayload | null => {
    const result = cognitoAccessTokenSchema.safeParse(payload);

    if (!(result.success && allowedClientIds.includes(result.data.client_id))) {
        return null;
    }

    return {
        sub: result.data.sub,
        groups: result.data["cognito:groups"] ?? [],
    };
};

export const requireGroup = (group: string) =>
    fromFn(async (req: HttpRequest, next: HttpService): Promise<HttpResponse> => {
        const payload = req.extensions.get(JWT_PAYLOAD);

        // No payload means the route is missing jwtPayloadLayer or the caller is anonymous.
        if (!payload) {
            throw new ClientError(StatusCode.UNAUTHORIZED, "Authentication required");
        }

        if (!payload.groups.includes(group)) {
            throw new ClientError(StatusCode.FORBIDDEN, "Forbidden");
        }

        return next.invoke(req);
    });
