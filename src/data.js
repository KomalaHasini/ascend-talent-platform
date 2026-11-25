// Shared constants and helper functions

export const CATEGORIES = [
  { id: 'performing', name: 'Performing Arts', cls: 'cat-performing' },
  { id: 'technical', name: 'Technical', cls: 'cat-technical' },
  { id: 'academic', name: 'Academic', cls: 'cat-academic' },
  { id: 'sports', name: 'Sports & Fitness', cls: 'cat-sports' },
];

// Tier of a single talent, based on endorsements received
export function getTierFromEndorsements(count) {
  if (count >= 50) return { name: 'Legend', cls: 'tier-legend' };
  if (count >= 25) return { name: 'Platinum', cls: 'tier-platinum' };
  if (count >= 10) return { name: 'Gold', cls: 'tier-gold' };
  if (count >= 3) return { name: 'Silver', cls: 'tier-silver' };
  return { name: 'Bronze', cls: 'tier-bronze' };
}

// Activity tier of a user, based on how many talents they posted
export function getActivityTier(postCount) {
  if (postCount >= 20) return { name: 'Hub Legend', min: 20, max: 20 };
  if (postCount >= 10) return { name: 'Core Member', min: 10, max: 20 };
  if (postCount >= 5) return { name: 'Active', min: 5, max: 10 };
  if (postCount >= 1) return { name: 'Rising', min: 1, max: 5 };
  return { name: 'Newcomer', min: 0, max: 1 };
}

// Accepts an email address or a phone number (10-13 digits)
export function isValidContact(value) {
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phone = /^\+?\d{10,13}$/;
  return email.test(value) || phone.test(value.replace(/[\s-]/g, ''));
}

// Number of days in a row (up to today or yesterday) on which the user posted a talent
export function computeStreak(myTalents) {
  const days = new Set(myTalents.map((t) => new Date(t.timestamp).toDateString()));
  const cursor = new Date();
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1); // today not posted yet
  let streak = 0;
  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ---------- Opportunities ----------
// min_tier values stored in the database -> tier number (0 = open to everyone)
const MIN_TIER_RANK = { any: 0, silver: 1, gold: 2, platinum: 3, legend: 4 };
const RANK_NAMES = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Legend'];
const RANK_CLASSES = ['tier-bronze', 'tier-silver', 'tier-gold', 'tier-platinum', 'tier-legend'];

export const OPPORTUNITY_TYPES = ['All', 'Audition', 'Competition', 'Event', 'Workshop'];

export function tierRankFromEndorsements(count) {
  if (count >= 50) return 4;
  if (count >= 25) return 3;
  if (count >= 10) return 2;
  if (count >= 3) return 1;
  return 0;
}

// label + css class for the "minimum tier" shown on an opportunity card
export function minTierInfo(minTier) {
  const rank = MIN_TIER_RANK[minTier] || 0;
  if (rank === 0) return { rank, label: 'Open to all', cls: 'tier-open' };
  return { rank, label: RANK_NAMES[rank] + ' or above', cls: RANK_CLASSES[rank] };
}

// Does this user qualify? Their best talent in the opportunity's category decides.
export function checkEligibility(opportunity, talents, userId) {
  const need = MIN_TIER_RANK[opportunity.minTier] || 0;
  if (need === 0) return { eligible: true, reason: '' };

  const category = CATEGORIES.find((c) => c.id === opportunity.category);
  const categoryName = category ? category.name : opportunity.category;

  const mine = talents.filter((t) => t.authorId === userId && t.category === opportunity.category);
  if (mine.length === 0) {
    return { eligible: false, reason: `Post a ${categoryName} talent to qualify` };
  }
  const best = Math.max(...mine.map((t) => tierRankFromEndorsements(t.endorsements || 0)));
  if (best >= need) return { eligible: true, reason: '' };
  return {
    eligible: false,
    reason: `Reach ${RANK_NAMES[need]} in ${categoryName} (you are ${RANK_NAMES[best]})`,
  };
}

// days left until the deadline (negative = closed). Deadline day itself is still open.
export function daysLeft(deadline) {
  const end = new Date(deadline + 'T23:59:59');
  return Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24));
}
