const { prisma } = require("../config/database");
const { getReportExpiryDate } = require("../services/itemLifecycleService");
const { findMatchesForLostItem, findPotentialDuplicates } = require("../services/matchingService");
const { parseCoordinatePair, parseNearbyFilter, filterItemsWithinRadius } = require("../services/geoService");

async function createLostItem(req, res) {
  try {
    const {
      title,
      category,
      description,
      location,
      lostDate,
      color,
      brand,
      image,
      images,
      imageHashes,
      latitude,
      longitude,
    } = req.body;

    const coordinateResult = parseCoordinatePair(latitude, longitude);
    if (coordinateResult.error || !coordinateResult.hasCoordinates) {
      return res.status(400).json({
        success: false,
        message: coordinateResult.error || "Choose a location on the map or from the location suggestions.",
      });
    }

    const parsedLostDate = new Date(lostDate);
    if (typeof title !== "string" || !title.trim() || title.trim().length > 120 || typeof category !== "string" || !category.trim() || category.trim().length > 80 || typeof location !== "string" || !location.trim() || location.trim().length > 500 || !lostDate || Number.isNaN(parsedLostDate.getTime()) || (description != null && (typeof description !== "string" || description.length > 3000))) {
      return res.status(400).json({
        success: false,
        message: "Title, category, location and lost date are required",
      });
    }

    const uploadedImages = Array.isArray(images) ? images : image ? [image] : [];
    const uploadedHashes = Array.isArray(imageHashes) ? imageHashes : [];
    if (uploadedImages.length > 5 || uploadedImages.some((photo) => typeof photo !== "string" || !/^data:image\/(png|jpeg|webp|gif);base64,/.test(photo) || photo.length > 7 * 1024 * 1024) || uploadedHashes.length > 5 || uploadedHashes.some((hash) => typeof hash !== "string" || !/^[a-f0-9]{16}$/i.test(hash))) {
      return res.status(400).json({ success: false, message: "Upload up to 5 valid images, each smaller than 5 MB." });
    }

    const lostItem = await prisma.lostItem.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        category: category.trim(),
        description: description?.trim() || null,
        location: location.trim(),
        lostDate: parsedLostDate,
        color: color?.trim() || null,
        brand: brand?.trim() || null,
        image: image || null,
        images: uploadedImages,
        imageHashes: uploadedHashes,
        expiresAt: getReportExpiryDate(),
        ...coordinateResult.coordinates,
      },
    });

    // Automatically check existing found items
    const matches = await findMatchesForLostItem(lostItem.id);
    const possibleDuplicates = await findPotentialDuplicates(lostItem, "lost");

    return res.status(201).json({
      success: true,
      message: "Lost item reported successfully",
      item: lostItem,
      matches,
      possibleDuplicates,
    });
  } catch (error) {
    console.error("Create lost item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create lost item",
    });
  }
}

async function getLostItems(req, res) {
  try {
    const nearbyFilter = parseNearbyFilter(req.query);
    if (nearbyFilter.error) {
      return res.status(400).json({ success: false, message: nearbyFilter.error });
    }

    const items = await prisma.lostItem.findMany({
      where: { status: "lost", expiresAt: { gt: new Date() } },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const resultItems = nearbyFilter.provided
      ? filterItemsWithinRadius(items, nearbyFilter.center, nearbyFilter.radiusKm)
      : items;

    return res.json({
      success: true,
      items: resultItems,
      ...(nearbyFilter.provided && {
        center: nearbyFilter.center,
        radiusKm: nearbyFilter.radiusKm,
      }),
    });
  } catch (error) {
    console.error("Get lost items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lost items",
    });
  }
}

async function getLostItemById(req, res) {
  try {
    const item = await prisma.lostItem.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        matches: true,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
    }

    return res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get lost item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch lost item",
    });
  }
}

async function updateLostItem(req, res) {
  try {
    const itemId = Number(req.params.id);

    const existingItem = await prisma.lostItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
    }

    if (existingItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own lost items",
      });
    }

    if (req.body.status !== undefined && req.body.status !== existingItem.status) {
      return res.status(400).json({ success: false, message: "Item status changes are managed through claim verification and QR handover" });
    }

    const {
      title,
      category,
      description,
      location,
      lostDate,
      color,
      brand,
      image,
      status,
      latitude,
      longitude,
    } = req.body;

    const coordinateResult = parseCoordinatePair(latitude, longitude);
    if (coordinateResult.error) {
      return res.status(400).json({ success: false, message: coordinateResult.error });
    }
    const locationChanged = location !== undefined && location.trim() !== existingItem.location;
    if (locationChanged && !coordinateResult.hasCoordinates) {
      return res.status(400).json({
        success: false,
        message: "Choose coordinates for the updated location before saving.",
      });
    }

    const updatedItem = await prisma.lostItem.update({
      where: {
        id: itemId,
      },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(category !== undefined && { category: category.trim() }),
        ...(description !== undefined && {
          description: description?.trim() || null,
        }),
        ...(location !== undefined && { location: location.trim() }),
        ...(lostDate !== undefined && {
          lostDate: new Date(lostDate),
        }),
        ...(color !== undefined && {
          color: color?.trim() || null,
        }),
        ...(brand !== undefined && {
          brand: brand?.trim() || null,
        }),
        ...(coordinateResult.coordinates || {}),
        ...(image !== undefined && { image }),
        ...(status !== undefined && { status }),
      },
    });

    return res.json({
      success: true,
      message: "Lost item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update lost item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update lost item",
    });
  }
}

async function deleteLostItem(req, res) {
  try {
    const itemId = Number(req.params.id);

    const item = await prisma.lostItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Lost item not found",
      });
    }

    if (item.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own lost items",
      });
    }

    await prisma.lostItem.delete({
      where: {
        id: itemId,
      },
    });

    return res.json({
      success: true,
      message: "Lost item deleted successfully",
    });
  } catch (error) {
    console.error("Delete lost item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete lost item",
    });
  }
}

module.exports = {
  createLostItem,
  getLostItems,
  getLostItemById,
  updateLostItem,
  deleteLostItem,
};
