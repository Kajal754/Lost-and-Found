const { prisma } = require("../config/database");
const {
  createNotificationRecord,
  dispatchNotification,
} = require("./notificationService");
const { compareItemPhotos } = require("./aiImageMatchService");

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .trim();
}

function containsMatch(value1, value2) {
  const a = normalize(value1);
  const b = normalize(value2);

  if (!a || !b) {
    return false;
  }

  return a.includes(b) || b.includes(a);
}

function distanceKm(a, b) {
  if ([a.latitude, a.longitude, b.latitude, b.longitude].some((value) => value == null)) return null;
  const radians = (value) => (value * Math.PI) / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

async function findPotentialDuplicates(item, type) {
  const model = type === "lost" ? prisma.lostItem : prisma.foundItem;
  const candidates = await model.findMany({
    where: {
      userId: { not: item.userId },
      category: { equals: item.category, mode: "insensitive" },
      status: type,
      expiresAt: { gt: new Date() },
    },
    select: { id: true, title: true, category: true, location: true, image: true, createdAt: true },
    take: 100,
    orderBy: { createdAt: "desc" },
  });
  const words = normalize(item.title).split(/\s+/).filter((word) => word.length > 2);
  if (!words.length) return [];
  return candidates
    .map((candidate) => {
      const title = normalize(candidate.title);
      const overlap = words.filter((word) => title.includes(word)).length / words.length;
      const sameLocation = containsMatch(item.location, candidate.location);
      return { ...candidate, similarity: Math.round(Math.min(100, overlap * 85 + (sameLocation ? 15 : 0))) };
    })
    .filter((candidate) => candidate.similarity >= 55)
    .slice(0, 5);
}

function calculateMatchScore(lostItem, foundItem) {
  let score = 0;

  // Category - 25 points
  if (
    normalize(lostItem.category) ===
    normalize(foundItem.category)
  ) {
    score += 25;
  }

  // Brand - 20 points
  if (
    lostItem.brand &&
    foundItem.brand &&
    containsMatch(lostItem.brand, foundItem.brand)
  ) {
    score += 20;
  }

  // Color - 15 points
  if (
    lostItem.color &&
    foundItem.color &&
    containsMatch(lostItem.color, foundItem.color)
  ) {
    score += 15;
  }

  // Title - 15 points
  if (containsMatch(lostItem.title, foundItem.title)) {
    score += 15;
  }

  // Location - 15 points
  const distance = distanceKm(lostItem, foundItem);
  if (distance !== null) {
    score += distance <= 0.5 ? 15 : distance <= 1 ? 12 : distance <= 5 ? 8 : distance <= 10 ? 4 : 0;
  } else if (containsMatch(lostItem.location, foundItem.location)) score += 15;

  // Description - 10 points
  if (
    lostItem.description &&
    foundItem.description &&
    containsMatch(
      lostItem.description,
      foundItem.description
    )
  ) {
    score += 10;
  }

  return score;
}

function calculateImageSimilarity(lostItem, foundItem) {
  const lostHashes = lostItem.imageHashes || [];
  const foundHashes = foundItem.imageHashes || [];
  if (!lostHashes.length || !foundHashes.length) return null;
  let closest = 0;
  for (const lostHash of lostHashes) for (const foundHash of foundHashes) {
    if (!/^[a-f0-9]{16}$/i.test(lostHash) || !/^[a-f0-9]{16}$/i.test(foundHash)) continue;
    let bits = BigInt(`0x${lostHash}`) ^ BigInt(`0x${foundHash}`), different = 0;
    while (bits) { different += Number(bits & 1n); bits >>= 1n; }
    closest = Math.max(closest, 100 * (64 - different) / 64);
  }
  return Math.round(closest);
}

async function createMatchIfNeeded(lostItem, foundItem, { allowAiImageMatch = false } = {}) {
  // A person can report both a lost and a found item. Those reports should
  // never create a "match" with themselves or open a self-chat.
  if (lostItem.userId === foundItem.userId) {
    return null;
  }

  const existingMatch = await prisma.match.findUnique({
    where: { lostItemId_foundItemId: { lostItemId: lostItem.id, foundItemId: foundItem.id } },
  });
  if (existingMatch) return existingMatch;

  const baseScore = calculateMatchScore(
    lostItem,
    foundItem
  );
  const localImageScore = calculateImageSimilarity(lostItem, foundItem);
  const aiImageScore = allowAiImageMatch ? await compareItemPhotos(lostItem, foundItem) : null;
  const imageScore = aiImageScore ?? localImageScore;
  let score = imageScore === null ? baseScore : Math.round(baseScore * 0.7 + imageScore * 0.3);
  if (imageScore !== null && imageScore >= 85) score = Math.max(score, 45);

  // Only create matches above the 30% notification threshold.
  if (score <= 30) {
    return null;
  }

  let match;
  let notifications;
  try {
    ({ match, notifications } = await prisma.$transaction(async (transaction) => {
      const createdMatch = await transaction.match.create({
        data: {
          lostItemId: lostItem.id,
          foundItemId: foundItem.id,
          matchScore: score,
          imageScore,
        },
      });

      const matchMessage = `A ${Math.round(score)}% possible match was found between "${lostItem.title}" and "${foundItem.title}".`;
      const records = await Promise.all([
        createNotificationRecord(transaction, {
          userId: lostItem.userId,
          type: "MATCH_FOUND",
          title: "Possible item match",
          message: matchMessage,
          href: `/matches?matchId=${createdMatch.id}`,
          relatedItemId: lostItem.id,
          relatedItemType: "LOST",
          relatedMatchId: createdMatch.id,
          dedupeKey: `match:${createdMatch.id}`,
        }),
        createNotificationRecord(transaction, {
          userId: foundItem.userId,
          type: "MATCH_FOUND",
          title: "Possible item match",
          message: matchMessage,
          href: `/matches?matchId=${createdMatch.id}`,
          relatedItemId: foundItem.id,
          relatedItemType: "FOUND",
          relatedMatchId: createdMatch.id,
          dedupeKey: `match:${createdMatch.id}`,
        }),
      ]);
      return { match: createdMatch, notifications: records };
    }));
  } catch (error) {
    if (error.code === "P2002") {
      return prisma.match.findUnique({
        where: { lostItemId_foundItemId: { lostItemId: lostItem.id, foundItemId: foundItem.id } },
      });
    }
    throw error;
  }

  await Promise.all(notifications.map(dispatchNotification));

  console.log(
    `🎯 Match created: Lost #${lostItem.id} + Found #${foundItem.id} = ${score}%`
  );

  return match;
}

async function findMatchesForFoundItem(foundItemId) {
  const foundItem = await prisma.foundItem.findUnique({
    where: {
      id: foundItemId,
    },
  });

  if (!foundItem) {
    return [];
  }

  const lostItems = await prisma.lostItem.findMany({
    where: {
      status: "lost",
      expiresAt: { gt: new Date() },
    },
  });

  const matches = [];
  const aiCandidateIds = process.env.AI_IMAGE_MATCH_ENABLED === "true" && process.env.OPENAI_API_KEY
    ? new Set(lostItems.filter((item) => item.image || item.images?.length).map((item) => ({ item, rank: calculateMatchScore(item, foundItem) + (calculateImageSimilarity(item, foundItem) || 0) * 0.3 })).sort((a, b) => b.rank - a.rank).slice(0, 2).map(({ item }) => item.id))
    : new Set();

  for (const lostItem of lostItems) {
    const match = await createMatchIfNeeded(
      lostItem,
      foundItem,
      { allowAiImageMatch: aiCandidateIds.has(lostItem.id) }
    );

    if (match) {
      matches.push(match);
    }
  }

  return matches;
}

async function findMatchesForLostItem(lostItemId) {
  const lostItem = await prisma.lostItem.findUnique({
    where: {
      id: lostItemId,
    },
  });

  if (!lostItem) {
    return [];
  }

  const foundItems = await prisma.foundItem.findMany({
    where: {
      status: "found",
      expiresAt: { gt: new Date() },
    },
  });

  const matches = [];
  const aiCandidateIds = process.env.AI_IMAGE_MATCH_ENABLED === "true" && process.env.OPENAI_API_KEY
    ? new Set(foundItems.filter((item) => item.image || item.images?.length).map((item) => ({ item, rank: calculateMatchScore(lostItem, item) + (calculateImageSimilarity(lostItem, item) || 0) * 0.3 })).sort((a, b) => b.rank - a.rank).slice(0, 2).map(({ item }) => item.id))
    : new Set();

  for (const foundItem of foundItems) {
    const match = await createMatchIfNeeded(
      lostItem,
      foundItem,
      { allowAiImageMatch: aiCandidateIds.has(foundItem.id) }
    );

    if (match) {
      matches.push(match);
    }
  }

  return matches;
}

module.exports = {
  calculateMatchScore,
  calculateImageSimilarity,
  findPotentialDuplicates,
  findMatchesForFoundItem,
  findMatchesForLostItem,
};
