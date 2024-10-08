import DescribeReply from './describe-reply.js';

const REPLIES = [DescribeReply];

export default class Replies {
  constructor(brain, logger) {
    this.brain = brain;
    this.logger = logger;
  }

  get(event) {
    const ReplyConstructor = REPLIES.find((Reply) => Reply.test(event));
    if (ReplyConstructor === undefined) return;

    return new ReplyConstructor(this.brain, this.logger);
  }
}
