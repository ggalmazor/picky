export class TeamNeedsSetUpError extends Error {
  constructor(slackEnterpriseId, slackTeamId) {
    super(`A team must be set up for Slack team ${slackTeamId} at ${slackEnterpriseId === undefined ? 'N/A' : slackEnterpriseId}`);
  }
}
