package com.ggalmazor.reply;

import com.ggalmazor.brain.Brain;
import com.slack.api.model.event.Event;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Function;

public class Replies {
    private static final List<Function<Brain, Reply>> REPLIES = new ArrayList<>();

    public static void initialize() {
        REPLIES.add(DescribeReply::new);
    }

    public static Optional<Reply> get(Brain brain, Event event) {
        return REPLIES.stream().map(replyFactory -> {
            Reply reply = replyFactory.apply(brain);
            if (reply.test(event))
                return reply;

            return null;
        }).filter(Objects::nonNull).findFirst();
    }
}
