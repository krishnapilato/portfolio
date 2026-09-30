package com.personal.portfolio.user;

import com.personal.portfolio.platform.Tally;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.jspecify.annotations.Nullable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
            select u from User u
            where (:query is null or lower(u.fullName) like :query escape '!' or u.email like :query escape '!')
              and (:role is null or u.role = :role)
              and (:status is null or u.status = :status)
            """)
    Page<User> search(@Nullable String query, @Nullable Role role, @Nullable AccountStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<User> findByRoleAndStatus(Role role, AccountStatus status);

    @Query("select new com.personal.portfolio.platform.Tally(u.status, count(u)) from User u group by u.status")
    List<Tally<AccountStatus>> tallyByStatus();

    @Query("select new com.personal.portfolio.platform.Tally(u.role, count(u)) from User u group by u.role")
    List<Tally<Role>> tallyByRole();
}
