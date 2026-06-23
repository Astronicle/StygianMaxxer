package com.stygianMaxxer.service;

import com.stygianMaxxer.model.Character;
import com.stygianMaxxer.model.Weapon;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Implements the team cost formula:
 * <pre>
 *   4★ character (any)        = 0
 *   5★ limited character      = cons + 1
 *   5★ standard character     = (cons + 1) × 0.5
 *
 *   4★ and below weapon (any) = 0
 *   5★ limited weapon         = refinement
 *   5★ standard weapon        = refinement × 0.5
 * </pre>
 * A character slot's cost is characterCost + weaponCost. A boss's cost is
 * the sum of every character slot's cost. Half-step totals (e.g. 6.5) are
 * expected whenever a standard 5★ character or weapon is involved.
 */
public final class CostCalculator {

    private static final BigDecimal HALF = new BigDecimal("0.5");

    private CostCalculator() {}

    public static BigDecimal characterCost(Character character, short cons) {
        if (character.getRarity() < 5) {
            return BigDecimal.ZERO;
        }
        BigDecimal base = BigDecimal.valueOf(cons + 1);
        return character.isLimited() ? base : base.multiply(HALF);
    }

    public static BigDecimal weaponCost(Weapon weapon, short refinement) {
        if (weapon.getRarity() < 5) {
            return BigDecimal.ZERO;
        }
        BigDecimal base = BigDecimal.valueOf(refinement);
        return weapon.isLimited() ? base : base.multiply(HALF);
    }

    public static BigDecimal characterSlotCost(Character character, short cons, Weapon weapon, short refinement) {
        return characterCost(character, cons)
                .add(weaponCost(weapon, refinement))
                .setScale(1, RoundingMode.UNNECESSARY);
    }
}
