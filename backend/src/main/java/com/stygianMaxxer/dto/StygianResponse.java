package com.stygianMaxxer.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StygianResponse {

    private short id;
    private String name;
    private String version;
    private List<StygianBossResponse> bosses;
}
