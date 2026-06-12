package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.AccountProfileResponse;
import com.stygianMaxxer.dto.AccountUpdateRequest;

public interface AccountService {

    // Public profile of any account - email omitted
    AccountProfileResponse getProfile(Integer accountId);

    // Own profile - email included
    AccountProfileResponse getMyProfile(Integer accountId);

    // Update own profile fields
    AccountProfileResponse updateMyProfile(Integer accountId, AccountUpdateRequest request);
}
