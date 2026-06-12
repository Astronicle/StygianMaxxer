package com.stygianMaxxer.service;

import com.stygianMaxxer.dto.AccountProfileResponse;
import com.stygianMaxxer.dto.AccountUpdateRequest;
import com.stygianMaxxer.model.Account;
import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.repository.AccountRepository;
import com.stygianMaxxer.repository.CharacterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final CharacterRepository characterRepository;

    //Public profile

    @Override
    @Transactional(readOnly = true)
    public AccountProfileResponse getProfile(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));

        return toResponse(account, false);
    }

    //Own profile

    @Override
    @Transactional(readOnly = true)
    public AccountProfileResponse getMyProfile(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));

        return toResponse(account, true);
    }

    //Update

    @Override
    @Transactional
    public AccountProfileResponse updateMyProfile(Integer accountId, AccountUpdateRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new NoSuchElementException("Account not found: " + accountId));

        if (request.username() != null) {
            if (request.username().isBlank()) {
                throw new IllegalArgumentException("Username must not be blank");
            }
            if (!request.username().equals(account.getUsername())
                    && accountRepository.existsByUsername(request.username())) {
                throw new IllegalArgumentException("Username is already taken");
            }
            account.setUsername(request.username());
        }

        if (request.email() != null) {
            if (request.email().isBlank()) {
                throw new IllegalArgumentException("Email must not be blank");
            }
            if (!request.email().equals(account.getEmail())
                    && accountRepository.existsByEmail(request.email())) {
                throw new IllegalArgumentException("Email is already in use");
            }
            account.setEmail(request.email());
        }

        if (request.avatarCharId() != null) {
            // CharacterRepository uses Short as the ID type
            Character character = characterRepository.findById(request.avatarCharId())
                    .orElseThrow(() -> new NoSuchElementException("Character not found: " + request.avatarCharId()));
            account.setAvatarCharacter(character);
        }

        return toResponse(accountRepository.save(account), true);
    }

    //Mapper

    private AccountProfileResponse toResponse(Account account, boolean includeEmail) {
        Character avatar = account.getAvatarCharacter();
        return new AccountProfileResponse(
                account.getAccountId(),
                account.getUsername(),
                includeEmail ? account.getEmail() : null,
                avatar != null ? avatar.getId() : null,     // Short
                avatar != null ? avatar.getName() : null,   // confirmed: field is `name`
                account.getCreationDate()
        );
    }
}
