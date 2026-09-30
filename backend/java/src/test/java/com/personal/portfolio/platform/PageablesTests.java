package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import com.personal.portfolio.platform.Problem.UnsupportedSort;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

class PageablesTests {

    private static final Set<String> SORTABLE = Set.of("createdAt", "email", "fullName");

    @Test
    void acceptsAnUnsortedPage() {
        var pageable = PageRequest.of(2, 25);

        assertThat(Pageables.restrict(pageable, SORTABLE)).isSameAs(pageable);
    }

    @Test
    void acceptsAnUnpagedRequest() {
        var unpaged = Pageable.unpaged();

        assertThat(Pageables.restrict(unpaged, SORTABLE)).isSameAs(unpaged);
    }

    @Test
    void acceptsSortingByWhitelistedProperties() {
        var pageable = PageRequest.of(0, 10, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.asc("email")));

        assertThat(Pageables.restrict(pageable, SORTABLE)).isSameAs(pageable);
    }

    @ParameterizedTest
    @ValueSource(strings = {"passwordHash", "EMAIL", "created_at", "user.email", "createdat"})
    void rejectsSortingByAnyOtherProperty(String property) {
        var pageable = PageRequest.of(0, 10, Sort.by(Sort.Order.by(property)));

        var rejection = catchThrowableOfType(ApiException.class, () -> Pageables.restrict(pageable, SORTABLE));

        assertThat(rejection.problem()).isEqualTo(new UnsupportedSort(property, SORTABLE));
    }

    @Test
    void reportsTheFirstUnsupportedPropertyOfAMultiColumnSort() {
        var pageable = PageRequest.of(0, 10, Sort.by("fullName", "role", "passwordHash"));

        var rejection = catchThrowableOfType(ApiException.class, () -> Pageables.restrict(pageable, SORTABLE));

        assertThat(rejection.problem()).isEqualTo(new UnsupportedSort("role", SORTABLE));
    }
}
