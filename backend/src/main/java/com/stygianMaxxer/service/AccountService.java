package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.AccountProfileResponse;
import com.stygianMaxxer.dto.AccountSummaryResponse;
import com.stygianMaxxer.dto.AccountUpdateRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AccountService {

    // Public profile of any account - email omitted
    AccountProfileResponse getProfile(Integer accountId);

    // Public profile lookup by username - email omitted
    AccountProfileResponse getProfileByUsername(String username);

    // Own profile - email included
    AccountProfileResponse getMyProfile(Integer accountId);

    // Update own profile fields
    AccountProfileResponse updateMyProfile(Integer accountId, AccountUpdateRequest request);

    // Paginated browse list of all accounts
    Page<AccountSummaryResponse> getAllAccounts(Pageable pageable);
}
