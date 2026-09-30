package com.personal.portfolio.mail;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class AddressListConverterTests {

    private final AddressListConverter converter = new AddressListConverter();

    static Stream<Arguments> addressLists() {
        return Stream.of(
                arguments(List.of(), ""),
                arguments(List.of("ada@example.test"), "ada@example.test"),
                arguments(List.of("ada@example.test", "alan@example.test", "grace.hopper+navy@example.test"),
                        "ada@example.test,alan@example.test,grace.hopper+navy@example.test"));
    }

    @ParameterizedTest
    @MethodSource("addressLists")
    void joinsAddressesWithCommas(List<String> addresses, String column) {
        assertThat(converter.convertToDatabaseColumn(addresses)).isEqualTo(column);
    }

    @ParameterizedTest
    @MethodSource("addressLists")
    void splitsTheColumnBackIntoTheSameAddresses(List<String> addresses, String column) {
        assertThat(converter.convertToEntityAttribute(column)).containsExactlyElementsOf(addresses).isUnmodifiable();
    }

    @Test
    void roundTripsPreservingOrderAndDuplicates() {
        var addresses = List.of("zed@example.test", "ada@example.test", "zed@example.test");

        assertThat(converter.convertToEntityAttribute(converter.convertToDatabaseColumn(addresses)))
                .containsExactly("zed@example.test", "ada@example.test", "zed@example.test");
    }
}
