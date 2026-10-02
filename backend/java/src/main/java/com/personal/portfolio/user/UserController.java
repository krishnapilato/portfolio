package com.personal.portfolio.user;

import com.personal.portfolio.security.AccessTokens;
import com.personal.portfolio.user.UserPayloads.CreateUser;
import com.personal.portfolio.user.UserPayloads.StatusChange;
import com.personal.portfolio.user.UserPayloads.UpdateUser;
import com.personal.portfolio.user.UserPayloads.UserStats;
import com.personal.portfolio.user.UserPayloads.UserView;
import com.personal.portfolio.user.UserService.Criteria;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@Tag(name = "Users", description = "Administrative account search, lifecycle and statistics")
@RequestMapping(path = "/api/v{version}/users", version = "1")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
class UserController {

    private final UserService users;

    @GetMapping
    Page<UserView> search(@Valid @ParameterObject Criteria criteria, @ParameterObject @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return users.search(criteria, pageable);
    }

    @GetMapping("/stats")
    UserStats stats() {
        return users.stats();
    }

    @GetMapping("/{id}")
    UserView get(@PathVariable long id) {
        return users.get(id);
    }

    @PostMapping
    ResponseEntity<UserView> create(@Valid @RequestBody CreateUser request, @AuthenticationPrincipal Jwt actor) {
        var user = users.create(request, AccessTokens.userId(actor));
        var location = ServletUriComponentsBuilder.fromCurrentRequestUri()
            .path("/{id}")
            .buildAndExpand(user.id())
            .toUri();
        return ResponseEntity.created(location).body(user);
    }

    @PatchMapping("/{id}")
    UserView update(@PathVariable long id, @Valid @RequestBody UpdateUser request, @AuthenticationPrincipal Jwt actor) {
        return users.update(id, request, AccessTokens.userId(actor));
    }

    @PutMapping("/{id}/status")
    UserView changeStatus(@PathVariable long id, @Valid @RequestBody StatusChange request, @AuthenticationPrincipal Jwt actor) {
        return users.changeStatus(id, request.status(), AccessTokens.userId(actor));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(@PathVariable long id, @AuthenticationPrincipal Jwt actor) {
        users.delete(id, AccessTokens.userId(actor));
    }
}
