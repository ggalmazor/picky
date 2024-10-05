package com.ggalmazor.brain.acronyms;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.Random;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;

class RandomAcronymsTest {

    @Nested
    @DisplayName("getDescription()")
    class GetDescription {
        @Test
        void returns_a_description_for_the_provided_acronym() {
            assertThat(new RandomAcronyms(new Random(12345L)).getDescription("ABC"), equalTo("Astute Bold Cricket"));
        }

        @Test
        void assigns_words_randomly() {
            assertThat(new RandomAcronyms(new Random(54321L)).getDescription("ABC"), equalTo("Agile Boisterous Clown"));
        }

        @Test
        void supports_characters_not_in_the_alphabet() {
            assertThat(new RandomAcronyms(new Random(12345L)).getDescription("*.,"), equalTo("Nimble Alluring Unicycle"));
        }
    }
}