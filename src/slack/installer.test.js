// noinspection EqualityComparisonWithCoercionJS

import { v4 as uuid } from 'uuid';
import { assertThat, equalTo, fulfilled, hasProperties, is, not, promiseThat } from 'hamjest';
import knex from 'knex';
import profiles from '../../knexfile.js';
import Installer from './installer.js';
import { testSlackClient } from '../../test/utils.js';
import { buildSlackId } from '../brain/memory/db-memory.js';

describe('Installer', () => {
  let db;
  let client;
  let subject;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    client = testSlackClient();
    subject = new Installer(db, {
      async get() {
        return client;
      },
    });
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  describe('#completeInstallation()', () => {
    let slackTeam;
    let slackEnterprise;

    beforeEach(async () => {
      slackTeam = { id: uuid(), name: 'Test team' };
      slackEnterprise = { id: uuid(), name: 'Test enterprise' };
      client.team.info = jest.fn().mockReturnValue({ team: { url: 'https://foo.slack.com' } });
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

  describe('#uninstall', () => {
    let teamId, acronymId, definitionId;

    beforeEach(async () => {
      teamId = (await db('teams').returning('id').insert({ name: 'Test team', slack_id: '_.TEAMID' }))[0].id;
      acronymId = (await db('acronyms').returning('id').insert({ acronym: 'ABC', team_id: teamId }))[0].id;
      definitionId = (
        await db('definitions').returning('id').insert({ acronym_id: acronymId, definition: 'some definition' })
      )[0].id;
    });

    it('deletes the team and all associated acronyms and definitions', async () => {
      await subject.uninstall('TEAMID', undefined);

      const definitionExists = (await db('definitions').count('id').where({ id: definitionId }).first()).id == 1;
      assertThat(definitionExists, is(false));
      const acronymExists = (await db('acronyms').count('id').where({ id: acronymId }).first()).id == 1;
      assertThat(acronymExists, is(false));
      const teamExists = (await db('teams').count('id').where({ id: teamId }).first()).id == 1;
      assertThat(teamExists, is(false));
    });

    describe('when the team belongs to an enterprise', () => {
      let enterpriseId;

      beforeEach(async () => {
        enterpriseId = (
          await db('enterprises').returning('id').insert({ name: 'Test enterprise', slack_id: 'ENTERPRISEID' })
        )[0].id;
        await db('teams')
          .update({ enterprise_id: enterpriseId, slack_id: 'ENTERPRISEID.TEAMID' })
          .where({ id: teamId });
      });

      it('deletes the enterprise too', async () => {
        await subject.uninstall('TEAMID', 'ENTERPRISEID');

        const definitionExists = (await db('definitions').count('id').where({ id: definitionId }).first()).id == 1;
        assertThat(definitionExists, is(false));
        const acronymExists = (await db('acronyms').count('id').where({ id: acronymId }).first()).id == 1;
        assertThat(acronymExists, is(false));
        const teamExists = (await db('teams').count('id').where({ id: teamId }).first()).id == 1;
        assertThat(teamExists, is(false));
        const enterpriseExists = (await db('enterprises').count('id').where({ id: enterpriseId }).first()).id == 1;
        assertThat(enterpriseExists, is(false));
      });
    });

    describe("When the team doesn't exist", () => {
      it('silently completes the operation', async () => {
        await promiseThat(subject.uninstall('NONEXISTINGTEAM'), is(fulfilled()));
        await promiseThat(subject.uninstall('NONEXISTINGTEAM', 'NONEXISTINGENTERPRISE'), is(fulfilled()));
      });
    });
  });
});
