package com.stygianMaxxer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record PostRateRequest(

        @NotNull
        @Min(1)
        @Max(5)
        Short rating
) {}
