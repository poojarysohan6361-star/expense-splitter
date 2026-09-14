/**
 * Pure, synchronous expense splitting engine.
 *
 * Constraints:
 * - Pure function: no side effects, no imports from express or db.
 * - All internal arithmetic done in integer cents.
 * - Split types supported: equal, exact, percentage, shares.
 */

/**
 * Calculates share amounts in integer cents for each participant.
 *
 * @param {Object} params
 * @param {number} params.amountCents - Total expense amount in integer cents (> 0)
 * @param {'equal'|'exact'|'percentage'|'shares'} params.splitType - Strategy for splitting
 * @param {Array<{ userId: number, rawValue?: number, rawValueCents?: number }>} params.participants
 * @returns {Array<{ userId: number, rawValue: number|null, shareAmountCents: number }>}
 */
export const calculateSplits = ({ amountCents, splitType, participants }) => {
  if (!Number.isInteger(amountCents) || amountCents <= 0) {
    throw new Error('amountCents must be a positive integer');
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    throw new Error('participants must be a non-empty array');
  }

  let result = [];

  switch (splitType) {
    case 'equal': {
      // Sort by ascending userId so leftover cents distribution is deterministic
      const sorted = [...participants].sort((a, b) => a.userId - b.userId);
      const count = sorted.length;
      const baseShare = Math.floor(amountCents / count);
      const remainder = amountCents % count;

      result = sorted.map((p, index) => ({
        userId: p.userId,
        rawValue: null,
        shareAmountCents: baseShare + (index < remainder ? 1 : 0),
      }));
      break;
    }

    case 'exact': {
      result = participants.map((p) => {
        const shareCents = p.rawValueCents !== undefined ? p.rawValueCents : p.rawValue;
        if (!Number.isInteger(shareCents) || shareCents <= 0) {
          throw new Error(`Participant ${p.userId} rawValue must be a positive integer cent amount`);
        }
        return {
          userId: p.userId,
          rawValue: p.rawValue !== undefined ? p.rawValue : shareCents,
          shareAmountCents: shareCents,
        };
      });
      break;
    }

    case 'percentage':
    case 'shares': {
      const isPercentage = splitType === 'percentage';
      const totalWeight = isPercentage
        ? 100
        : participants.reduce((sum, p) => sum + Number(p.rawValue), 0);

      if (totalWeight <= 0) {
        throw new Error('Total weight must be greater than zero');
      }

      // Largest-Remainder Method (Hare-Niemeyer method)
      const allocated = participants.map((p) => {
        const weight = Number(p.rawValue);
        if (Number.isNaN(weight) || weight <= 0) {
          throw new Error(`Participant ${p.userId} must have a positive numeric rawValue`);
        }
        const quota = (amountCents * weight) / totalWeight;
        const baseShare = Math.floor(quota);
        const remainder = quota - baseShare;

        return {
          userId: p.userId,
          rawValue: p.rawValue,
          baseShare,
          remainder,
        };
      });

      const totalBaseShares = allocated.reduce((sum, item) => sum + item.baseShare, 0);
      const leftoverCents = amountCents - totalBaseShares;

      // Sort by largest remainder descending; tie-break with ascending userId
      const sortedByRemainder = [...allocated].sort((a, b) => {
        const diff = b.remainder - a.remainder;
        if (Math.abs(diff) > 1e-9) {
          return diff;
        }
        return a.userId - b.userId;
      });

      const bonusRecipientIds = new Set(
        sortedByRemainder.slice(0, leftoverCents).map((item) => item.userId)
      );

      result = allocated.map((item) => ({
        userId: item.userId,
        rawValue: item.rawValue,
        shareAmountCents: item.baseShare + (bonusRecipientIds.has(item.userId) ? 1 : 0),
      }));
      break;
    }

    default:
      throw new Error(`Unsupported splitType: ${splitType}`);
  }

  // Final sanity check: assert sum(shareAmount) === amount in cents
  const totalAllocated = result.reduce((sum, p) => sum + p.shareAmountCents, 0);
  if (totalAllocated !== amountCents) {
    throw new Error(
      `Sanity check failed: total allocated cents (${totalAllocated}) does not match expense amount (${amountCents})`
    );
  }

  return result;
};
