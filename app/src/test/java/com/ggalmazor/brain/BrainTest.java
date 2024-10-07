package com.ggalmazor.brain;

import com.ggalmazor.brain.acronyms.RandomAcronyms;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.hamcrest.MatcherAssert.assertThat;

class BrainTest {
    @Nested
    @DisplayName("getdefinition()")
    class GetDefinition {
        @Test
        void returns_the_memorized_definition_for_the_provided_acronym() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            Map<String, Set<String>> memory = new HashMap<>(Map.of("ABC", new HashSet<>(List.of("Astute Bold Cricket", "Agile Boisterous Clown"))));
            var brain = new Brain(acronyms, memory);

            assertThat(brain.getDefinitions("ABC"), Matchers.containsInAnyOrder("Astute Bold Cricket", "Agile Boisterous Clown"));
        }

        @Test
        void gets_a_definition_from_the_acronyms_source_if_unknown_and_remembers_it() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            var brain = Brain.empty(acronyms);

            assertThat(brain.getDefinitions("DEF"), Matchers.containsInAnyOrder("Daringly Exciting Firetruck"));
            assertThat(brain.getDefinitions("DEF"), Matchers.containsInAnyOrder("Daringly Exciting Firetruck"));
        }
    }

    @Nested
    @DisplayName("learn(String acronym, String definition)")
    class Learn {
        @Test
        void memorizes_the_provided_acronym_definition() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            var brain = Brain.empty(acronyms);

            brain.learn("ABC", "Some Other Definition");

            assertThat(brain.getDefinitions("ABC"), Matchers.containsInAnyOrder("Some Other Definition"));
        }

        @Test
        void prevents_memorizing_duplicates() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            var brain = Brain.empty(acronyms);

            brain.learn("ABC", "Some Other Definition");
            brain.learn("ABC", "Some Other Definition");

            assertThat(brain.getDefinitions("ABC"), Matchers.containsInAnyOrder("Some Other Definition"));
        }
    }

    @Nested
    @DisplayName("forget(String acronym, String definition)")
    class Forget {
        @Test
        void forgets_the_provided_acronym_definition() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            var brain = Brain.empty(acronyms);

            brain.learn("ABC", "Some Other Definition");
            brain.forget("ABC", "Some Other Definition");

            assertThat(brain.getDefinitions("ABC"), Matchers.containsInAnyOrder("Astute Bold Cricket"));
        }

        @Test
        void silently_ignores_unknown_acronym_definitions() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            var brain = Brain.empty(acronyms);

            brain.forget("ABC", "Some Other Definition");

            assertThat(brain.getDefinitions("ABC"), Matchers.containsInAnyOrder("Astute Bold Cricket"));
        }
    }
}