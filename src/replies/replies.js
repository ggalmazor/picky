import DefineReply from './define-reply.js';

const REPLIES = [DefineReply];

export default class Replies {
  constructor(replies, brain, logger) {
    this.replies = replies;
    this.brain = brain;
    this.logger = logger;
  }

  static load(brain, logger) {
    return new Replies(REPLIES, brain, logger);
  }

  add(reply) {
    this.replies.push(reply);
  }

  get(event) {
    const ReplyConstructor = this.replies.find((Reply) => Reply.test(event));
    if (ReplyConstructor === undefined) return;

    return new ReplyConstructor(this.brain, this.logger);
  }
}
