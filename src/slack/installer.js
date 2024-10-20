import { buildSlackId } from '../brain/memory/db-memory.js';

export default class Installer {
  constructor(db, clients) {
    this.db = db;
    this.clients = clients;
  }

  static from(picky) {
    return new Installer(picky.db, picky.clients);
  }

  async completeInstallation(team, enterprise, accessToken) {
    await this.#setUpTeam(team, enterprise, accessToken);
    return await this.#getTeamUrl(team, enterprise);
  }

  async uninstall(teamId) {
    const enterpriseId = (
      await this.db('teams').returning('enterprise_id').delete().whereILike('slack_id', `%.${teamId}`)
    )[0]?.enterprise_id;

    if (enterpriseId) await this.db('enterprises').delete().where({ id: enterpriseId });
  }

  async #getTeamUrl(team, enterprise) {
    const client = await this.clients.get({ enterpriseId: enterprise?.id, teamId: team.id });
    const teamInfo = await client.team.info();
    return teamInfo.team.url;
  }

  async #setUpTeam(team, enterprise, accessToken) {
    const { id: slackEnterpriseId, name: enterpriseName } = enterprise || {};
    const { id: slackTeamId, name: teamName } = team || {};
    const slackId = buildSlackId(slackEnterpriseId, slackTeamId);

    const teamExists =
      (await this.db('teams').count('id', { as: 'count' }).where({ slack_id: slackId }).first()).count == 1;
    if (teamExists) {
      if (accessToken !== undefined)
        await this.db('teams').update({ access_token: accessToken }).where({ slack_id: slackId });
      return;
    }

    if (slackEnterpriseId !== undefined) {
      await this.db('enterprises')
        .insert({ slack_id: slackEnterpriseId, name: enterpriseName })
        .onConflict(['slack_id'])
        .ignore();

      const enterpriseId = (await this.db('enterprises').select('id').where('slack_id', slackEnterpriseId).first()).id;

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
