import bolt from "@slack/bolt";
import 'dotenv/config'
import Brain from "./brain/brain.js";
import Commands from "./commands/commands.js";
import Replies from "./replies/replies.js";

const app = new bolt.App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN
});

const brain = Brain.random(app.logger);
const replies = new Replies(brain, app.client, app.logger);
const commands = new Commands(brain, app.client, app.logger);

app.event("message_event", async ({event, client, logger, ack}) => {
  const reply = replies.get(event);
  if (reply === undefined)
    return await ack();

  await reply.accept(event);
  await ack();
});

app.event("app_mention_event", async ({event, client, logger, say, ack}) => {
  const command = commands.get(event);
  if (command === undefined)
    return await ack();

  await command.accept(event);
  await ack();
});

await app.start(process.env.PORT || 3000);
console.log('⚡️ Bolt app is running!');
