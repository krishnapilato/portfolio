package com.personal.portfolio.platform;

import java.util.Set;
import org.springframework.data.domain.Pageable;

public final class Pageables {

    private Pageables() {}

    public static Pageable restrict(Pageable pageable, Set<String> sortable) {
        for (var order : pageable.getSort()) {
            if (!sortable.contains(order.getProperty())) {
                throw new ApiException(new Problem.UnsupportedSort(order.getProperty(), sortable));
            }
        }
        return pageable;
    }
}
