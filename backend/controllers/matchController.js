const { prisma } = require("../config/database");

async function getMatches(req, res) {
  try {
    const userId = req.user.id;

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          {
            lostItem: {
              userId,
            },
          },
          {
            foundItem: {
              userId,
            },
          },
        ],
      },
      include: {
        lostItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        foundItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        matchScore: "desc",
      },
    });

    return res.json({
      success: true,
      matches,
    });
  } catch (error) {
    console.error("Get matches error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch matches",
    });
  }
}

async function getMatchById(req, res) {
  try {
    const matchId = Number(req.params.id);
    const userId = req.user.id;

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        lostItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        foundItem: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        messages: {
          include: {
            sender: {
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
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    const isParticipant =
      match.lostItem.userId === userId ||
      match.foundItem.userId === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this match",
      });
    }

    return res.json({
      success: true,
      match,
    });
  } catch (error) {
    console.error("Get match error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch match",
    });
  }
}

async function updateMatchStatus(req, res) {
  try {
    const matchId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "accepted",
      "rejected",
      "resolved",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match status",
      });
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId,
      },
      include: {
        lostItem: true,
        foundItem: true,
      },
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: "Match not found",
      });
    }

    const isParticipant =
      match.lostItem.userId === req.user.id ||
      match.foundItem.userId === req.user.id;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You cannot update this match",
      });
    }

    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId,
      },
      data: {
        status,
      },
    });

    return res.json({
      success: true,
      message: "Match status updated",
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Update match status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update match",
    });
  }
}

module.exports = {
  getMatches,
  getMatchById,
  updateMatchStatus,
};