package com.ggalmazor.command;

import com.ggalmazor.brain.Brain;
import com.slack.api.bolt.context.Context;
import com.slack.api.methods.SlackApiException;
import com.slack.api.model.event.AppMentionEvent;
import com.slack.api.model.event.Event;

import java.io.IOException;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class LearnCommand implements Command {
    private static final Pattern LEARN_PATTERN = Pattern.compile("learn ([A-Z]{2,5}) (.+?)$");
    private static final Predicate<String> TEST = LEARN_PATTERN.asPredicate();

    private final Brain brain;

    public LearnCommand(Brain brain) {
        this.brain = brain;
    }

    @Override
    public boolean test(Event event) {
        return switch (event) {
            case AppMentionEvent e -> TEST.test(e.getText());
            default -> false;
        };
    }

    @Override
    public void accept(Context ctx, Event event) {
        String message = extractText(event);
        ctx.logger.info("Replying message: " + message);
        var matchGroups = LEARN_PATTERN.matcher(message).results().toList().getFirst();
        brain.learn(matchGroups.group(1), matchGroups.group(2));
        addReaction(ctx, event, "white_check_mark");
    }

    private static void addReaction(Context ctx, Event event, String name) {
        try {
            ctx.client().reactionsAdd(r -> r.channel(extractChannel(event)).timestamp(extractTs(event)).name(name));
        } catch (IOException | SlackApiException e) {
            throw new RuntimeException(e);
        }
    }

    private static String extractTs(Event event) {
        return switch(event) {
            case AppMentionEvent e -> e.getTs();
            default -> throw new RuntimeException("Unexpected event: " + event);
        };
    }

    private static String extractChannel(Event event) {
        return switch(event) {
            case AppMentionEvent e -> e.getChannel();
            default -> throw new RuntimeException("Unexpected event: " + event);
        };
    }

    private String extractText(Event event) {
        return switch(event) {
            case AppMentionEvent e -> e.getText();
            default -> throw new RuntimeException("Unexpected event: " + event);
        };
    }
}
