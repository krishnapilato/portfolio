package com.personal.portfolio.platform;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.entry;

import com.personal.portfolio.mail.MailStatus;
import com.personal.portfolio.user.AccountStatus;
import java.util.List;
import org.junit.jupiter.api.Test;

class TallyTests {

    @Test
    void fillsMissingKeysWithZeroInDeclarationOrder() {
        var counts = Tally.zeroFilled(AccountStatus.class, List.of(
                new Tally<>(AccountStatus.DISABLED, 2), new Tally<>(AccountStatus.ACTIVE, 7)));

        assertThat(counts).containsExactly(
                entry(AccountStatus.PENDING, 0L),
                entry(AccountStatus.ACTIVE, 7L),
                entry(AccountStatus.LOCKED, 0L),
                entry(AccountStatus.DISABLED, 2L));
    }

    @Test
    void reportsZeroForEveryKeyWithoutTallies() {
        assertThat(Tally.zeroFilled(MailStatus.class, List.of()))
                .containsOnlyKeys(MailStatus.values())
                .allSatisfy((_, total) -> assertThat(total).isZero());
    }
}
