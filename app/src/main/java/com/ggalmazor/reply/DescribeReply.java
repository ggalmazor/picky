package com.ggalmazor.reply;

import com.ggalmazor.brain.Brain;
import com.slack.api.bolt.context.Context;
import com.slack.api.methods.SlackApiException;
import com.slack.api.model.event.AppMentionEvent;
import com.slack.api.model.event.Event;
import com.slack.api.model.event.MessageEvent;

import java.io.IOException;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public class DescribeReply implements Reply {
    private static final Pattern ACRONYM_PATTERN = Pattern.compile("\\b([A-Z]{2,5})\\b");
    private static final Predicate<String> TEST = ACRONYM_PATTERN.asPredicate();
    private final Brain brain;

    public DescribeReply(Brain brain) {
        this.brain = brain;
    }

    private static String extractChannel(Event event) {
        return switch (event) {
            case AppMentionEvent e -> e.getChannel();
            default -> throw new RuntimeException("Unexpected event: " + event);
        };
    }

    @Override
    public boolean test(Event event) {
        return switch (event) {
            case MessageEvent e -> TEST.test(e.getText());
            default -> false;
        };
    }

    @Override
    public void accept(Context ctx, Event event) {
        String message = extractText(event);
        ctx.logger.info("Replying message: " + message);
        ACRONYM_PATTERN.matcher(message).results().map(result -> result.group(1)).toList().forEach(acronym -> {
            var definition = this.brain.getDefinitions(acronym);
            var text = definition.size() == 1 ? acronym + " stands for: `" + definition.getFirst() + "`" : acronym + " stands for:\n```" + String.join("\n", definition) + "\n```";
            try {
                ctx.client().chatPostMessage(r -> r.channel(extractChannel(event)).text(text));
            } catch (IOException | SlackApiException e) {
                ctx.logger.error("Error sending response", e);
            }
        });
    }

    private String extractText(Event event) {
        return switch (event) {
            case MessageEvent e -> e.getText();
            default -> throw new RuntimeException("Unexpected event: " + event);
        };
    }
}
