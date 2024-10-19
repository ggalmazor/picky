export default class SlackOAuth {
  constructor(client, credentials, logger) {
    this.client = client;
    this.credentials = credentials;
    this.logger = logger;
  }

  async access(code) {
    const response = await this.client.oauth.v2.access({
      client_id: this.credentials.id,
      client_secret: this.credentials.secret,
      code,
    });
    if (this.logger) {
      const safeResponse = JSON.parse(JSON.stringify(response));
      delete safeResponse.access_token;
      this.logger.debug(safeResponse);
    }
    const { access_token: accessToken, team, enterprise } = response;
    return { accessToken, team, enterprise };
  }
}
