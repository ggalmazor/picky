export function buildTeamSlackId(slackEnterpriseId, slackTeamId) {
  if (slackEnterpriseId === undefined)
    return `_.${slackTeamId}`;

  return `${slackEnterpriseId}.${slackTeamId}`;
}

// noinspection EqualityComparisonWithCoercionJS
export default class DbMemory {
  constructor(db, teamId) {
    this.db = db;
    this.teamId = teamId;
  }

  static async from(db, team, enterprise) {
    const teamSlackId = buildTeamSlackId(enterprise?.id, team.id);
    let teamId;
    if (enterprise?.id === undefined) {
      teamId = (await db('teams').select("id").where({slack_id: teamSlackId}).first()).id;
    } else {
      const result = await db('teams')
        .join("enterprises", "enterprises.id", "teams.enterprise_id")
        .select("teams.id")
        .where("teams.slack_id", teamSlackId)
        .where("enterprises.slack_id", enterprise.id)
        .first();
      if (result === undefined)
        throw new Error(`Team ${teamSlackId} not found`);

      teamId = result.id;
    }
    return new DbMemory(db, teamId);
  }

  static async setUpTeam(db, team, accessToken, enterprise) {
    const teamSlackId = buildTeamSlackId(enterprise?.id, team.id);
    const teamExists = (await db('teams').count('id', {as: 'count'}).where({slack_id: teamSlackId}).first()).count == 1;
    if (teamExists) {
      if (accessToken !== undefined)
        await db('teams').update({access_token: accessToken}).where({slack_id: teamSlackId});
      return;
    }

    if (enterprise?.id !== undefined) {
      const enterpriseId = (await db('enterprises').returning("id").insert({slack_id: enterprise.id, name: enterprise.name}))[0].id;
      await db('teams').insert({enterprise_id: enterpriseId, slack_id: teamSlackId, name: team.name, access_token: accessToken})
    } else {
      await db('teams').insert({
        slack_id: teamSlackId,
        name: team.name,
        access_token: accessToken
      })
    }
  }

  async knows(acronym, definition) {
    if (definition === undefined) {
      const exists = (
        await this.db('acronyms')
          .count('acronyms.id', {as: 'exists'})
          .where('team_id', this.teamId)
          .where('acronym', acronym)
          .first()
      ).exists;
      return exists == 1;
    }

    const exists = (
      await this.db('acronyms')
        .count('acronyms.id', {as: 'exists'})
        .join('definitions', 'acronyms.id', 'acronym_id')
        .where('team_id', this.teamId)
        .where('acronym', acronym)
        .where('definition', definition)
        .first()
    ).exists;
    return exists == 1;
  }

  async recall(acronym) {
    const results = await this.db('definitions')
      .join('acronyms', 'acronyms.id', 'definitions.acronym_id')
      .select('definition')
      .where('team_id', this.teamId)
      .where('acronym', acronym)
      .orderBy('definition');
    return results.map((result) => result.definition);
  }

  async learn(acronym, definition) {
    let acronymId;
    const result = await this.db('acronyms')
      .select('acronyms.id')
      .where('team_id', this.teamId)
      .where('acronym', acronym)
      .first();
    if (result === undefined) {
      acronymId = (
        await this.db('acronyms').returning('acronyms.id').insert({team_id: this.teamId, acronym: acronym})
      )[0].id;
    } else {
      acronymId = result.id;
    }

    await this.db('definitions')
      .onConflict(['acronym_id', 'definition'])
      .ignore()
      .insert({acronym_id: acronymId, definition: definition});
  }

  async forget(acronym, definition) {
    const result = await this.db('acronyms')
      .select('acronyms.id')
      .where('team_id', this.teamId)
      .where('acronym', acronym)
      .first();
    if (result === undefined) return;

    const acronymId = result.id;

    await this.db('definitions').delete().where('acronym_id', acronymId).where('definition', definition);

    const count = (await this.db('definitions').count('id', {as: 'count'}).where('acronym_id', acronymId).first())
      .count;

    if (count == 0) await this.db('acronyms').delete().where('id', acronymId);
  }
}
