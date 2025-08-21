import type { Router } from "@taxum/core/routing";
import { articlesRouter } from "./articles.js";

export const registerRoutes = (router: Router): void => {
    router.nest("/articles", articlesRouter);
};
