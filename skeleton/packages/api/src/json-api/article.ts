import type { EntitySerializer } from "@jsonapi-serde/server/response";

export type Article = {
    id: string;
    title: string;
};

export const articleSerializer: EntitySerializer<Article> = {
    getId: (entity) => entity.id,
    serialize: (entity) => ({
        attributes: {
            title: entity.title,
        },
    }),
};
