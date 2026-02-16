package com.stygianMaxxer.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StygianBossResponse {

    private short bossId;
    private String bossSlug;
    private String bossName;
    private short slot;
}
