import { v4 as uuid } from 'uuid';
import { assertThat, equalTo, hasProperties, is, not } from 'hamjest';
import knex from 'knex';
import profiles from '../../knexfile.js';
import Installer from './installer.js';
import { testSlackClient } from '../../test/utils.js';
import { buildSlackId } from '../brain/memory/db-memory.js';

describe('#completeInstallation()', () => {
  let db;
  let slackTeam;
  let slackEnterprise;
  let client;
  let subject;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    slackTeam = { id: uuid(), name: 'Test team' };
    slackEnterprise = { id: uuid(), name: 'Test enterprise' };
    client = testSlackClient();
    subject = new Installer(db, {
      async get() {
        return client;
      },
    });
    client.team.info = jest.fn().mockReturnValue({ team: { url: 'https://foo.slack.com' } });
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  describe('sets up the team in the database', () => {
    describe('when the team is already set up', () => {
      it('updates the access token', async () => {
        const enterpriseId = (
          await db('enterprises').returning('id').insert({
            slack_id: slackEnterprise.id,
            name: slackEnterprise.name,
          })
        )[0].id;
        const teamId = (
          await db('teams')
            .returning('id')
            .insert({
              enterprise_id: enterpriseId,
              slack_id: buildSlackId(slackEnterprise.id, slackTeam.id),
              name: slackTeam.name,
            })
        )[0].id;

        await subject.completeInstallation(slackTeam, slackEnterprise, 'new token');

        const accessToken = (await db('teams').select('access_token').where('id', teamId).first()).access_token;
        assertThat(accessToken, equalTo('new token'));
      });
    });

    describe("when the team doesn't exist", () => {
      it('creates the enterprise', async () => {
        await subject.completeInstallation(slackTeam, slackEnterprise, 'new token');

        const result = await db('enterprises').select('id', 'name').where('slack_id', slackEnterprise.id).first();
        assertThat(
          result,
          hasProperties({
            id: not(null),
            name: equalTo(slackEnterprise.name),
          }),
        );
      });

      it('creates the team', async () => {
        await subject.completeInstallation(slackTeam, slackEnterprise, 'new token');

        const result = await db('teams')
          .select('id', 'name')
          .where('slack_id', buildSlackId(slackEnterprise.id, slackTeam.id))
          .first();
        assertThat(
          result,
          hasProperties({
            id: not(null),
            name: equalTo(slackTeam.name),
          }),
        );
      });

      it('links the team with the enterprise', async () => {
        await subject.completeInstallation(slackTeam, slackEnterprise, 'new token');

        const enterpriseId = (await db('enterprises').select('id').where('slack_id', slackEnterprise.id).first()).id;
        const linkedEnterpriseId = (
          await db('teams')
            .select('enterprise_id')
            .where('slack_id', buildSlackId(slackEnterprise.id, slackTeam.id))
            .first()
        ).enterprise_id;
        assertThat(linkedEnterpriseId, equalTo(enterpriseId));
      });

      describe("when there's no enterprise", () => {
        it('leaves the enterprise_id column empty', async () => {
          await subject.completeInstallation(slackTeam, null, 'new token');

          const result = await db('teams')
            .select('id', 'name', 'enterprise_id')
            .where('slack_id', buildSlackId(undefined, slackTeam.id))
            .first();
          assertThat(
            result,
            hasProperties({
              enterprise_id: is(null),
            }),
          );
        });
      });
    });

    it("uses a Slack client to get the team's URL and returns it", async () => {
      client.team.info = jest.fn().mockReturnValue({ team: { url: 'https://foo.slack.com' } });

      const teamUrl = await subject.completeInstallation(slackTeam, null, 'new token');

      expect(client.team.info).toHaveBeenCalled();
      assertThat(teamUrl, equalTo('https://foo.slack.com'));
    });
  });
});
