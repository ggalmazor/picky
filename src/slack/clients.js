import {WebClient} from "@slack/web-api";
import {buildSlackId} from "../brain/memory/db-memory.js";
import {TeamNeedsSetUpError} from "../errors/errors.js";
import ClientCache from "./client-cache.js";

export default class SlackClients {
  constructor(db, logger, cache) {
    this.db = db;
    this.logger = logger;
    this.cache = cache;
  }

  static build(db, logger) {
    return new ClientCache(db, logger, ClientCache.empty());
  }

  async get(context) {
    const slackId = buildSlackId(context.enterpriseId, context.teamId);
    return this.cache.fetch(slackId, async () => {
      const result = await this.db('teams').select('access_token').where('slack_id', slackId).first();
      if (result === undefined)
        throw new TeamNeedsSetUpError();

      return new WebClient(result.access_token, {logger: this.logger});
    });
  }
}
