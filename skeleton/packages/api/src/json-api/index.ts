import { SerializeBuilder } from "@jsonapi-serde/server/response";
import { articleSerializer } from "./article.js";

export const serialize = SerializeBuilder.new().add("article", articleSerializer).build();
