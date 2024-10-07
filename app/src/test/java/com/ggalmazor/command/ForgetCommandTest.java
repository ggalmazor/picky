package com.ggalmazor.command;

import com.ggalmazor.brain.Brain;
import com.ggalmazor.brain.acronyms.RandomAcronyms;
import com.slack.api.model.event.AppMentionEvent;
import com.slack.api.model.event.Event;
import com.slack.api.model.event.MessageEvent;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.lang.reflect.InvocationTargetException;
import java.util.Random;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.is;

class ForgetCommandTest {

    private static AppMentionEvent event(String text) {
        AppMentionEvent event = new AppMentionEvent();
        event.setText(text);
        return event;
    }

    private static <T extends Event> T event(Class<T> klass, String text) {
        try {
            T event = klass.getDeclaredConstructor().newInstance();

            klass.getMethod("setText", String.class).invoke(event, text);
            return event;
        } catch (InstantiationException | IllegalAccessException | InvocationTargetException |
                 NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
    }

    @Nested
    @DisplayName("test(Event event)")
    class TestEvent {
        @Test
        void matches_app_mention_events_with_forget_command_pattern() {
            var brain = Brain.empty(new RandomAcronyms(new Random(12345L)));
            var subject = new ForgetCommand(brain);

            assertThat(subject.test(event("@Picky forget SED Some Existing Definition")), is(true));
            assertThat(subject.test(event("@Picky some other message")), is(false));
            assertThat(subject.test(event(MessageEvent.class, "@Picky forget SED Some Existing Definition")), is(false));
        }
    }

    @Nested
    @DisplayName("apply(Context ctx, Event event)")
    class Apply {
        @Test
        void matches_app_mention_events_with_forget_command_pattern() {
            var brain = Brain.empty(new RandomAcronyms(new Random(12345L)));
            var subject = new ForgetCommand(brain);

            assertThat(subject.test(event("@Picky forget SED Some Existing Definition")), is(true));
            assertThat(subject.test(event("@Picky some other message")), is(false));
            assertThat(subject.test(event(MessageEvent.class, "@Picky forget SED Some Existing Definition")), is(false));
        }

        @Test
        void thows_an_exception_if_the_provided_event_is_not_an_app_mention() {
            var brain = Brain.empty(new RandomAcronyms(new Random(12345L)));
            var subject = new ForgetCommand(brain);

            assertThat(() -> subject.accept(event(MessageEvent.class, "foo")), Matchers.exce)
        }
    }

}