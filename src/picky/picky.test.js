import { TestLogger, testSlackClient } from '../../test/utils.js';
import Picky from './picky.js';
import Brain from '../brain/brain.js';
import RandomAcronyms from '../brain/acronyms/random-acronyms.js';
import Replies from '../replies/replies.js';
import Commands from '../commands/commands.js';
import VolatileMemory from '../brain/memory/volatile-memory.js';
import { assertThat, before, empty, hasItem, instanceOf, is, not } from 'hamjest';
import { v4 as uuid } from 'uuid';
import knex from 'knex';
import profiles from '../../knexfile.js';
import DbMemory from '../brain/memory/db-memory.js';

function buildReplyOrCommandSpy(testResult) {
  const acceptSpy = jest.fn();

  function Constructor() {}

  Constructor.test = () => testResult;
  Constructor.prototype.accept = acceptSpy;

  return [Constructor, acceptSpy];
}

describe('Picky.from(...) factory', () => {
  let db, team, teamId, app;

  beforeAll(async () => {
    db = knex(profiles.test);
  });

  beforeEach(async () => {
    await db.raw('START TRANSACTION');
    teamId = uuid();
    team = {
      id: teamId,
      name: 'Test team',
      url: 'https://test.team.org',
    };

    app = { client: testSlackClient(), logger: new TestLogger() };
    app.client.team.info = jest.fn().mockResolvedValue({ team });
  });

  afterEach(async () => {
    await db.raw('ROLLBACK TRANSACTION');
  });

  afterAll(async () => {
    db.destroy();
  });

  it('configures the dependencies tree and returns a new Picky instance', async () => {
    const subject = await Picky.from(db, app);

    assertThat(subject, is(instanceOf(Picky)));
    assertThat(subject.brain, is(instanceOf(Brain)));
    assertThat(subject.brain.memory, is(instanceOf(DbMemory)));
    assertThat(subject.commands, is(instanceOf(Commands)));
    assertThat(subject.commands.commands, is(not(empty())));
    assertThat(subject.replies, is(instanceOf(Replies)));
    assertThat(subject.replies.replies, is(not(empty())));
    assertThat(subject.logger, is(app.logger));
  });
});

describe('Picky', () => {
  let brain, client, logger, replies, commands;
  let subject;
  let context, event, payload;

  beforeEach(() => {
    brain = new Brain(
      new RandomAcronyms(Math.random),
      new VolatileMemory({
        HTML: ['Hyper Text Markup Language'],
        API: ['Application Programming Interface'],
      }),
    );
    client = testSlackClient();
    logger = new TestLogger();
    replies = new Replies([], brain, logger);
    commands = new Commands([], brain, client, logger);
    subject = new Picky(
      brain,
      replies,
      commands,
      {
        async get() {
          return client;
        },
      },
      logger,
    );
  });

  describe('onMessage', () => {
    beforeEach(async () => {
      context = {};
      event = { type: 'message', channel: 'C07QK0MHHKM', text: 'Some message', ts: 1728412412 };
      payload = { event, context };
    });

    describe("when there's a Reply for the message", () => {
      let Reply, replySpy;

      beforeEach(() => {
        [Reply, replySpy] = buildReplyOrCommandSpy(true);
        replies.add(Reply);
      });

      it('logs an info message', async () => {
        await subject.onMessage(payload);

        assertThat(logger.messages.info, hasItem(`Replying to message: ${event.text}`));
      });

      it('executes the Reply', async () => {
        await subject.onMessage(payload);

        expect(replySpy).toHaveBeenCalledWith(context, event);
      });
    });

    describe("when there's no Reply for the message", () => {
      it('logs a debug message', async () => {
        await subject.onMessage(payload);

        assertThat(logger.messages.debug, hasItem(`No reply for: ${event.text}`));
      });

      it("doesn't send any reply message", async () => {
        const spy = jest.spyOn(client.chat, 'postMessage');

        await subject.onMessage(payload);

        expect(spy).not.toHaveBeenCalled();
      });

      describe('when `true` is provided in the `replyAll` param', () => {
        it("doesn't log a debug message", async () => {
          await subject.onMessage(payload, true);

          assertThat(logger.messages.debug, not(hasItem(`No reply for: ${event.text}`)));
        });

        it("replies informing that it doesn't know how to reply to the message", async () => {
          const spy = jest.spyOn(client.chat, 'postMessage');

          await subject.onMessage(payload, true);

          expect(spy).toHaveBeenCalledWith({
            channel: event.channel,
            text: `I don't know how to reply to: \`${event.text}\``,
          });
        });
      });
    });
  });

  describe('onAppMention', () => {
    beforeEach(async () => {
      context = {};
      event = { type: 'app_mention', channel: 'C07QK0MHHKM', text: '@Picky do something', ts: 1728412412 };
      payload = { event, context };
    });

    describe("when there's a Command for the message", () => {
      let Command, commandSpy;

      beforeEach(() => {
        [Command, commandSpy] = buildReplyOrCommandSpy(true);
        commands.add(Command);
      });

      it('logs an info message', async () => {
        await subject.onAppMention(payload);

        assertThat(logger.messages.info, hasItem(`Replying to mention: ${event.text}`));
      });

      it('executes the Reply', async () => {
        await subject.onAppMention(payload);

        expect(commandSpy).toHaveBeenCalledWith(context, event);
      });
    });

    describe("when there's no Command for the message", () => {
      it('logs a debug message', async () => {
        await subject.onAppMention(payload);

        assertThat(logger.messages.debug, hasItem(`No command for: ${event.text}`));
      });

      it("doesn't send any reply message", async () => {
        const spy = jest.spyOn(client.chat, 'postMessage');

        await subject.onAppMention(payload);

        expect(spy).not.toHaveBeenCalled();
      });

      describe('when `true` is provided in the `replyAll` param', () => {
        it("doesn't log a debug message", async () => {
          await subject.onAppMention(payload, true);

          assertThat(logger.messages.debug, not(hasItem(`No command for: ${event.text}`)));
        });

        it("replies informing that it doesn't know how to reply to the message", async () => {
          const spy = jest.spyOn(client.chat, 'postMessage');

          await subject.onAppMention(payload, true);

          expect(spy).toHaveBeenCalledWith({
            channel: event.channel,
            text: `I don't know how to reply to: \`${event.text}\``,
          });
        });
      });
    });
  });

  describe('onAppHomeOpened', () => {
    beforeEach(async () => {
      context = { userId: 'U123ABC456' };
      event = { type: 'app_home_opened', channel: 'C07QK0MHHKM', tab: 'home', view: {} };
      payload = { event, context };
    });

    it('uses a Slack client to publish a view', async () => {
      const spy = jest.spyOn(client.views, 'publish');

      await subject.onAppHomeOpened(payload);

      expect(spy).toHaveBeenCalledWith({
        user_id: context.userId,
        view: expect.stringMatching('"type":"home"'),
      });
    });
  });
});
