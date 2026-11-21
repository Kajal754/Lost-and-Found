const { prisma, retryDatabaseQuery } = require("../config/database");
const { getReportExpiryDate } = require("../services/itemLifecycleRules");
const { findMatchesForFoundItem, findPotentialDuplicates } = require("../services/matchingService");
const { parseCoordinatePair, parseNearbyFilter, filterItemsWithinRadius } = require("../services/geoService");

async function createFoundItem(req, res) {
  try {
    const {
      title,
      category,
      description,
      location,
      foundDate,
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

    const parsedFoundDate = new Date(foundDate);
    if (typeof title !== "string" || !title.trim() || title.trim().length > 120 || typeof category !== "string" || !category.trim() || category.trim().length > 80 || typeof location !== "string" || !location.trim() || location.trim().length > 500 || !foundDate || Number.isNaN(parsedFoundDate.getTime()) || (description != null && (typeof description !== "string" || description.length > 3000))) {
      return res.status(400).json({
        success: false,
        message: "Title, category, location and found date are required",
      });
    }

    const uploadedImages = Array.isArray(images) ? images : image ? [image] : [];
    const uploadedHashes = Array.isArray(imageHashes) ? imageHashes : [];
    if (uploadedImages.length > 5 || uploadedImages.some((photo) => typeof photo !== "string" || !/^data:image\/(png|jpeg|webp|gif);base64,/.test(photo) || photo.length > 7 * 1024 * 1024) || uploadedHashes.length > 5 || uploadedHashes.some((hash) => typeof hash !== "string" || !/^[a-f0-9]{16}$/i.test(hash))) {
      return res.status(400).json({ success: false, message: "Upload up to 5 valid images, each smaller than 5 MB." });
    }

    const foundItem = await prisma.foundItem.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        category: category.trim(),
        description: description?.trim() || null,
        location: location.trim(),
        foundDate: parsedFoundDate,
        color: color?.trim() || null,
        brand: brand?.trim() || null,
        image: image || null,
        images: uploadedImages,
        imageHashes: uploadedHashes,
        expiresAt: getReportExpiryDate(),
        ...coordinateResult.coordinates,
      },
    });

    // The report is already saved, so optional matching failures must not
    // make the client treat the completed report as a failed submission.
    let matches = [];
    let possibleDuplicates = [];
    const matchingWarnings = [];
    try {
      matches = await findMatchesForFoundItem(foundItem.id);
    } catch (error) {
      console.error("Find matches for new found item error:", error);
      matchingWarnings.push("Automatic match search is temporarily unavailable.");
    }
    try {
      possibleDuplicates = await findPotentialDuplicates(foundItem, "found");
    } catch (error) {
      console.error("Find duplicate found items error:", error);
      matchingWarnings.push("Duplicate report checking is temporarily unavailable.");
    }

    return res.status(201).json({
      success: true,
      message: "Found item reported successfully",
      ...(matchingWarnings.length && { warning: matchingWarnings.join(" ") }),
      item: foundItem,
      matches,
      possibleDuplicates,
    });
  } catch (error) {
    console.error("Create found item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create found item",
    });
  }
}

async function getFoundItems(req, res) {
  try {
    const nearbyFilter = parseNearbyFilter(req.query);
    if (nearbyFilter.error) {
      return res.status(400).json({ success: false, message: nearbyFilter.error });
    }

    const items = await retryDatabaseQuery(() => prisma.foundItem.findMany({
      where: { status: "found", expiresAt: { gt: new Date() } },
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
    }));
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
    console.error("Get found items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch found items",
    });
  }
}

async function getFoundItemById(req, res) {
  try {
    const item = await prisma.foundItem.findUnique({
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
        message: "Found item not found",
      });
    }

    return res.json({
      success: true,
      item,
    });
  } catch (error) {
    console.error("Get found item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch found item",
    });
  }
}

async function updateFoundItem(req, res) {
  try {
    const itemId = Number(req.params.id);

    const existingItem = await prisma.foundItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: "Found item not found",
      });
    }

    if (existingItem.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own found items",
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
      foundDate,
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

    const updatedItem = await prisma.foundItem.update({
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
        ...(foundDate !== undefined && {
          foundDate: new Date(foundDate),
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
      message: "Found item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update found item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update found item",
    });
  }
}

async function deleteFoundItem(req, res) {
  try {
    const itemId = Number(req.params.id);

    const item = await prisma.foundItem.findUnique({
      where: {
        id: itemId,
      },
    });

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Found item not found",
      });
    }

    if (item.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own found items",
      });
    }

    await prisma.foundItem.delete({
      where: {
        id: itemId,
      },
    });

    return res.json({
      success: true,
      message: "Found item deleted successfully",
    });
  } catch (error) {
    console.error("Delete found item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete found item",
    });
  }
}

module.exports = {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  updateFoundItem,
  deleteFoundItem,
};
