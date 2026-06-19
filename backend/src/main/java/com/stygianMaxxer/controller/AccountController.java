package com.stygianMaxxer.controller;

import com.stygianMaxxer.dto.AccountProfileResponse;
import com.stygianMaxxer.dto.AccountSummaryResponse;
import com.stygianMaxxer.dto.AccountUpdateRequest;
import com.stygianMaxxer.security.AuthPrincipal;
import com.stygianMaxxer.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * GET /api/accounts/me
     * Own profile — includes email. Requires JWT.
     */
    @GetMapping("/me")
    public AccountProfileResponse getMyProfile(
            @AuthenticationPrincipal AuthPrincipal principal
    ) {
        return accountService.getMyProfile(principal.accountId());
    }

    /**
     * PATCH /api/accounts/me
     * Update username, email, or avatar. Send only the fields you want to change.
     * Requires JWT.
     */
    @PatchMapping("/me")
    public AccountProfileResponse updateMyProfile(
            @AuthenticationPrincipal AuthPrincipal principal,
            @RequestBody AccountUpdateRequest request
    ) {
        return accountService.updateMyProfile(principal.accountId(), request);
    }

    /**
     * GET /api/accounts
     * Paginated browse list of all accounts. Public.
     */
    @GetMapping
    public Page<AccountSummaryResponse> getAllAccounts(Pageable pageable) {
        return accountService.getAllAccounts(pageable);
    }

    /**
     * GET /api/accounts/by-username/{username}
     * Public profile of any user, looked up by username — email omitted.
     */
    @GetMapping("/by-username/{username}")
    public AccountProfileResponse getProfileByUsername(@PathVariable String username) {
        return accountService.getProfileByUsername(username);
    }

    /**
     * GET /api/accounts/{accountId}
     * Public profile of any user — email omitted.
     */
    @GetMapping("/{accountId}")
    public AccountProfileResponse getProfile(@PathVariable Integer accountId) {
        return accountService.getProfile(accountId);
    }
}
