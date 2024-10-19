import { buildSlackId } from '../brain/memory/db-memory.js';

export default class Installer {
  constructor(db, clients) {
    this.db = db;
    this.clients = clients;
  }

  static from(picky) {
    return new Installer(picky.db, picky.clients);
  }

  async completeInstallation(enterprise, team, accessToken) {
    await this.#setUpTeam(enterprise, team, accessToken);
    return await this.#getTeamUrl(enterprise, team);
  }

  async #getTeamUrl(enterprise, team) {
    const client = await this.clients.get({ enterpriseId: enterprise?.id, teamId: team.id });
    const teamInfo = await client.team.info();
    return teamInfo.team.url;
  }

  async #setUpTeam(enterprise, team, accessToken) {
    const { id: slackEnterpriseId, name: enterpriseName } = (enterprise || {})
    const { id: slackTeamId, name: teamName } = (team || {})
    const slackId = buildSlackId(slackEnterpriseId, slackTeamId);

    const teamExists =
      (await this.db('teams').count('id', { as: 'count' }).where({ slack_id: slackId }).first()).count == 1;
    if (teamExists) {
      if (accessToken !== undefined)
        await this.db('teams').update({ access_token: accessToken }).where({ slack_id: slackId });
      return;
    }

    if (slackEnterpriseId !== undefined) {
      const enterpriseId = (
        await this.db('enterprises').returning('id').insert({
          slack_id: slackEnterpriseId,
          name: enterpriseName,
        })
      )[0].id;
      await this.db('teams').insert({
        enterprise_id: enterpriseId,
        slack_id: slackId,
        name: teamName,
        access_token: accessToken,
      });
    } else {
      await this.db('teams').insert({
        slack_id: slackId,
        name: teamName,
        access_token: accessToken,
      });
    }
  }
}
