package com.ggalmazor.brain;

import com.ggalmazor.brain.acronyms.RandomAcronyms;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.hamcrest.MatcherAssert.assertThat;

class BrainTest {
    @Nested
    @DisplayName("getDescription()")
    class GetDescriptions {
        @Test
        void returns_the_memorized_descriptions_for_the_provided_acronym() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            Map<String, List<String>> memory = Map.of("ABC", List.of("Astute Bold Cricket", "Agile Boisterous Clown"));
            var brain = new Brain(acronyms, memory);

            assertThat(brain.getDescriptions("ABC"), Matchers.containsInAnyOrder("Astute Bold Cricket", "Agile Boisterous Clown"));
        }

        @Test
        void gets_a_description_from_the_acronyms_source_if_unknown_and_remembers_it() {
            var acronyms = new RandomAcronyms(new Random(12345L));
            var brain = Brain.empty(acronyms);

            assertThat(brain.getDescriptions("DEF"), Matchers.containsInAnyOrder("Daringly Exciting Firetruck"));
            assertThat(brain.getDescriptions("DEF"), Matchers.containsInAnyOrder("Daringly Exciting Firetruck"));
        }
    }
}