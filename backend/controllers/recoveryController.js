const { prisma } = require("../config/database");
const {
  createNotificationRecord,
  dispatchNotification,
} = require("../services/notificationService");

const claimInclude = {
  claimant: {
    select: {
      id: true,
      name: true,
    },
  },
  lostItem: {
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
    },
  },
  foundItem: {
    select: { id: true, title: true, category: true, status: true, userId: true },
  },
  events: {
    include: {
      actor: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
};

async function getMyRecoveryClaims(req, res) {
  try {
    const claims = await prisma.recoveryClaim.findMany({
      where: { OR: [{ claimantId: req.user.id }, { foundItem: { userId: req.user.id } }] },
      include: claimInclude,
      orderBy: { updatedAt: "desc" },
    });
    return res.json({ success: true, claims });
  } catch (error) {
    console.error("Get my recovery claims error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch your claims" });
  }
}

async function getQrItem(req, res) {
  try {
    const token = req.params.token;
    const foundItem = await prisma.foundItem.findUnique({
      where: { qrToken: token },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        location: true,
        foundDate: true,
        color: true,
        brand: true,
        image: true,
        status: true,
        expiresAt: true,
      },
    });

    if (foundItem) {
      if (
        foundItem.status === "archived" ||
        foundItem.status === "closed" ||
        foundItem.expiresAt <= new Date()
      ) {
        return res.status(404).json({
          success: false,
          message: "QR code item is no longer active",
        });
      }
      return res.json({ success: true, type: "found", item: foundItem });
    }

    const lostItem = await prisma.lostItem.findUnique({
      where: { qrToken: token },
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        location: true,
        lostDate: true,
        color: true,
        brand: true,
        image: true,
        status: true,
        expiresAt: true,
      },
    });

    if (
      !lostItem ||
      lostItem.status === "archived" ||
      lostItem.status === "closed" ||
      lostItem.expiresAt <= new Date()
    ) {
      return res.status(404).json({
        success: false,
        message: "QR code item not found",
      });
    }

    return res.json({ success: true, type: "lost", item: lostItem });
  } catch (error) {
    console.error("Get QR item error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch QR item",
    });
  }
}

async function getMyLostItems(req, res) {
  try {
    const items = await prisma.lostItem.findMany({
      where: {
        userId: req.user.id,
        status: "lost",
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        title: true,
        category: true,
        lostDate: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ success: true, items });
  } catch (error) {
    console.error("Get claimable lost items error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your lost items",
    });
  }
}

async function getRecoveryClaims(req, res) {
  try {
    const foundItemId = Number(req.params.itemId);
    if (!Number.isInteger(foundItemId) || foundItemId < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid found item",
      });
    }

    const foundItem = await prisma.foundItem.findUnique({
      where: { id: foundItemId },
      select: { id: true, userId: true },
    });

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        message: "Found item not found",
      });
    }

    const isReporter = foundItem.userId === req.user.id;
    const claims = await prisma.recoveryClaim.findMany({
      where: {
        foundItemId,
        ...(!isReporter && { claimantId: req.user.id }),
      },
      include: claimInclude,
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!isReporter && claims.length === 0) {
      return res.status(403).json({
        success: false,
        message: "You can only view claims you submitted",
      });
    }

    return res.json({ success: true, isReporter, claims });
  } catch (error) {
    console.error("Get recovery claims error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch recovery history",
    });
  }
}

async function createRecoveryClaim(req, res) {
  try {
    const foundItemId = Number(req.params.itemId);
    const lostItemId = Number(req.body.lostItemId);
    const proof = typeof req.body.proof === "string" ? req.body.proof.trim() : "";

    if (
      !Number.isInteger(foundItemId) ||
      foundItemId < 1 ||
      !Number.isInteger(lostItemId) ||
      lostItemId < 1 ||
      proof.length < 10 ||
      proof.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Select your lost-item report and describe ownership proof (10–2000 characters)",
      });
    }

    const [foundItem, lostItem] = await Promise.all([
      prisma.foundItem.findUnique({ where: { id: foundItemId } }),
      prisma.lostItem.findUnique({ where: { id: lostItemId } }),
    ]);

    if (
      !foundItem ||
      foundItem.status !== "found" ||
      foundItem.expiresAt <= new Date()
    ) {
      return res.status(404).json({
        success: false,
        message: "This found item is no longer available",
      });
    }

    if (foundItem.userId === req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You cannot claim an item you reported as found",
      });
    }

    if (
      !lostItem ||
      lostItem.userId !== req.user.id ||
      lostItem.status !== "lost" ||
      lostItem.expiresAt <= new Date()
    ) {
      return res.status(403).json({
        success: false,
        message: "Select one of your active lost-item reports",
      });
    }

    const activeClaim = await prisma.recoveryClaim.findFirst({
      where: {
        foundItemId,
        claimantId: req.user.id,
        status: { in: ["pending", "verified"] },
      },
      select: { id: true },
    });

    if (activeClaim) {
      return res.status(409).json({
        success: false,
        message: "You already have an active claim for this item",
      });
    }

    const { claim, notification } = await prisma.$transaction(async (transaction) => {
      const createdClaim = await transaction.recoveryClaim.create({
        data: {
          foundItemId,
          lostItemId,
          claimantId: req.user.id,
          proof,
          events: {
            create: {
              actorId: req.user.id,
              action: "claim_submitted",
              note: "Ownership verification requested",
            },
          },
        },
        include: claimInclude,
      });

      const notificationRecord = await createNotificationRecord(transaction, {
          userId: foundItem.userId,
          type: "CLAIM_REQUEST",
          title: "New item claim",
          message: `${createdClaim.claimant.name} requested "${lostItem.title}" as the match for "${foundItem.title}".`,
          href: `/claims?claimId=${createdClaim.id}`,
          relatedItemId: foundItem.id,
          relatedItemType: "FOUND",
          relatedClaimId: createdClaim.id,
          dedupeKey: `claim-request:${createdClaim.id}`,
      });

      return { claim: createdClaim, notification: notificationRecord };
    });

    await dispatchNotification(notification);

    return res.status(201).json({
      success: true,
      message: "Claim submitted for ownership verification",
      claim,
    });
  } catch (error) {
    console.error("Create recovery claim error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit recovery claim",
    });
  }
}

async function reviewRecoveryClaim(req, res) {
  try {
    const claimId = Number(req.params.claimId);
    const { decision } = req.body;
    const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

    if (
      !Number.isInteger(claimId) ||
      claimId < 1 ||
      !["verified", "rejected"].includes(decision) ||
      (decision === "verified" && note.length < 10) ||
      (decision === "rejected" && note.length < 3) ||
      note.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Choose a valid decision and provide a verification note (at least 10 characters to verify)",
      });
    }

    const claim = await prisma.recoveryClaim.findUnique({
      where: { id: claimId },
      include: { foundItem: true },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Recovery claim not found",
      });
    }

    if (claim.foundItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the found-item reporter can verify ownership",
      });
    }

    if (claim.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "This claim has already been reviewed",
      });
    }

    const result = await prisma.$transaction(async (transaction) => {
      const result = await transaction.recoveryClaim.updateMany({
        where: { id: claimId, status: "pending" },
        data: { status: decision },
      });

      if (result.count !== 1) {
        return null;
      }

      await transaction.recoveryVerification.create({
        data: {
          claimId,
          actorId: req.user.id,
          action: decision,
          note,
        },
      });

      if (decision === "verified") {
        await transaction.foundItem.update({ where: { id: claim.foundItemId }, data: { status: "claimed" } });
      }

      const updatedClaim = await transaction.recoveryClaim.findUnique({
        where: { id: claimId },
        include: claimInclude,
      });
      const approved = decision === "verified";
      const notificationRecord = await createNotificationRecord(transaction, {
        userId: claim.claimantId,
        type: approved ? "CLAIM_APPROVED" : "CLAIM_REJECTED",
        title: approved ? "Claim approved" : "Claim rejected",
        message: `Your claim for "${claim.foundItem.title}" was ${approved ? "approved" : "rejected"}.`,
        href: `/claims?claimId=${claimId}`,
        relatedItemId: claim.foundItemId,
        relatedItemType: "FOUND",
        relatedClaimId: claimId,
        dedupeKey: `claim-${decision}:${claimId}`,
      });

      return { updatedClaim, notification: notificationRecord };
    });

    if (!result) {
      return res.status(409).json({
        success: false,
        message: "This claim has already been reviewed",
      });
    }

    await dispatchNotification(result.notification);

    return res.json({
      success: true,
      message: decision === "verified" ? "Ownership verified" : "Claim rejected",
      claim: result.updatedClaim,
    });
  } catch (error) {
    console.error("Review recovery claim error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to review recovery claim",
    });
  }
}

async function markItemReturned(req, res) {
  try {
    const claimId = Number(req.params.claimId);
    const note = typeof req.body.note === "string" ? req.body.note.trim() : "";

    if (!Number.isInteger(claimId) || claimId < 1 || note.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Invalid recovery claim or note",
      });
    }

    const claim = await prisma.recoveryClaim.findUnique({
      where: { id: claimId },
      include: { foundItem: true },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Recovery claim not found",
      });
    }

    if (claim.foundItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Only the found-item reporter can record the handover",
      });
    }

    if (typeof req.body.qrToken !== "string" || req.body.qrToken !== claim.foundItem.qrToken) {
      return res.status(400).json({ success: false, message: "Scan this item's QR code to verify the handover" });
    }

    if (claim.status !== "verified") {
      return res.status(409).json({
        success: false,
        message: "Ownership must be verified before an item can be returned",
      });
    }

    const result = await prisma.$transaction(async (transaction) => {
      const result = await transaction.recoveryClaim.updateMany({
        where: { id: claimId, status: "verified" },
        data: { status: "returned" },
      });

      if (result.count !== 1) {
        return null;
      }

      await Promise.all([
        transaction.foundItem.update({
          where: { id: claim.foundItemId },
          data: { status: "returned" },
        }),
        transaction.lostItem.update({
          where: { id: claim.lostItemId },
          data: { status: "returned" },
        }),
        transaction.recoveryVerification.create({
          data: {
            claimId,
            actorId: req.user.id,
            action: "returned",
            note: note || "Item handover completed",
          },
        }),
      ]);

      const otherClaims = await transaction.recoveryClaim.findMany({
        where: { foundItemId: claim.foundItemId, id: { not: claimId }, status: { in: ["pending", "verified"] } },
        select: { id: true, claimantId: true },
      });
      if (otherClaims.length) {
        await transaction.recoveryClaim.updateMany({
          where: { id: { in: otherClaims.map((other) => other.id) } },
          data: { status: "rejected" },
        });
        await transaction.recoveryVerification.createMany({
          data: otherClaims.map((other) => ({ claimId: other.id, actorId: req.user.id, action: "rejected", note: "Another verified ownership claim completed the handover." })),
        });
      }

      const updatedClaim = await transaction.recoveryClaim.findUnique({
        where: { id: claimId },
        include: claimInclude,
      });
      const notifications = await Promise.all([
        ...[claim.claimantId, claim.foundItem.userId].map((userId) =>
          createNotificationRecord(transaction, {
            userId,
            type: "ITEM_RETURNED",
            title: "Item successfully returned",
            message: `"${claim.foundItem.title}" was successfully returned to its claimant.`,
            href: `/claims?claimId=${claimId}`,
            relatedItemId: claim.foundItemId,
            relatedItemType: "FOUND",
            relatedClaimId: claimId,
            dedupeKey: `item-returned:${claimId}`,
          })
        ),
        ...otherClaims.map((other) =>
          createNotificationRecord(transaction, {
            userId: other.claimantId,
            type: "CLAIM_REJECTED",
            title: "Claim closed",
            message: `"${claim.foundItem.title}" was returned to another verified claimant, so your claim was closed.`,
            href: `/claims?claimId=${other.id}`,
            relatedItemId: claim.foundItemId,
            relatedItemType: "FOUND",
            relatedClaimId: other.id,
            dedupeKey: `claim-closed:${other.id}`,
          })
        ),
      ]);

      return {
        updatedClaim,
        notifications,
      };
    });

    if (!result) {
      return res.status(409).json({
        success: false,
        message: "This item has already been returned",
      });
    }

    await Promise.all(result.notifications.map(dispatchNotification));

    return res.json({
      success: true,
      message: "Item handover recorded",
      claim: result.updatedClaim,
    });
  } catch (error) {
    console.error("Mark item returned error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record item handover",
    });
  }
}

module.exports = {
  getMyRecoveryClaims,
  getQrItem,
  getMyLostItems,
  getRecoveryClaims,
  createRecoveryClaim,
  reviewRecoveryClaim,
  markItemReturned,
};
