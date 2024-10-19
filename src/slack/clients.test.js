import knex from 'knex';
import profiles from '../../knexfile.js';
import { v4 as uuid } from 'uuid';
import DbMemory, { buildSlackId } from '../brain/memory/db-memory.js';
import SlackClients from './clients.js';
import { TestLogger } from '../../test/utils.js';
import { assertThat, equalTo, instanceOf, is, isRejectedWith, promiseThat } from 'hamjest';
import { WebClient } from '@slack/web-api';
import { TeamNeedsSetUpError } from '../errors/errors.js';

class TestCache {
  async fetch(key, factory) {
    return factory();
  }
}
describe('Clients', () => {
  let db;
  let logger;
  let cache;
  let subject;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    logger = new TestLogger();
    cache = new TestCache();
    subject = new SlackClients(db, logger, cache);
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  describe('#get', () => {
    it('returns a configured WebClient for the provided Slack Team ID', async () => {
      const context = {
        enterpriseId: 'enterprise',
        teamId: 'team',
      };
      const slackId = buildSlackId(context.enterpriseId, context.teamId);
      await db('teams').insert({ name: 'Test team', slack_id: slackId, access_token: 'access token' });

      const client = await subject.get(context);

      assertThat(client, is(instanceOf(WebClient)));
      assertThat(client.token, equalTo('access token'));
    });

    it("throws an error when the team hasn't been set up yet", async () => {
      await promiseThat(
        subject.get({ enterpriseId: 'unknown', teamId: 'unknown' }),
        isRejectedWith(instanceOf(TeamNeedsSetUpError)),
      );
    });
  });
});
