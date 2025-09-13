import { JsonApiError } from "@jsonapi-serde/server/common";
import { pathParam } from "@taxum/core/extract";
import { createExtractHandler, m, Router } from "@taxum/core/routing";
import { z } from "zod";
import { serialize } from "../json-api/index.js";

const listHandler = createExtractHandler().handler(() => {
    return serialize("article", [
        {
            id: "9018b265-9d14-403d-850d-968f09fae999",
            title: "Hello world",
        },
    ]);
});

const showHandler = createExtractHandler(pathParam(z.uuid())).handler((articleId) => {
    if (articleId !== "9018b265-9d14-403d-850d-968f09fae999") {
        throw new JsonApiError({ status: "404" });
    }

    return serialize("article", {
        id: "9018b265-9d14-403d-850d-968f09fae999",
        title: "Hello world",
    });
});

export const articlesRouter = new Router()
    .route("/", m.get(listHandler))
    .route("/:articleId", m.get(showHandler));
