import DescribeReply from "./describe-reply.js";

const REPLIES = [DescribeReply];

export default class Replies {
  constructor(brain, client, logger) {
    this.brain = brain;
    this.client = client;
    this.logger = logger;
  }

  get(event) {
    const ReplyConstructor = REPLIES.find(Reply => Reply.test(event));
    return new ReplyConstructor(this.brain, this.client, this.logger);
  }
}
