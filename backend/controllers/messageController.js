const { prisma } = require("../config/database");
const {
  createNotificationRecord,
  dispatchNotification,
} = require("../services/notificationService");
const {
  emitToConversation,
  isUserViewingConversation,
} = require("../services/socketService");

async function getConversations(req, res) {
  try {
    const userId = req.user.id;

    const conversations = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
        match: {
          include: {
            lostItem: {
              select: {
                title: true,
              },
            },
            foundItem: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["matchId"],
    });

    return res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Get conversations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
}

async function getMessages(req, res) {
  try {
    const matchId = Number(req.params.matchId);
    const userId = req.user.id;

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
      match.lostItem.userId === userId ||
      match.foundItem.userId === userId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not part of this conversation",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        matchId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
}

async function sendMessage(req, res) {
  try {
    const matchId = Number(req.params.matchId);
    const senderId = req.user.id;

    const { message } = req.body;

    if (!message || !message.trim() || message.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: "Message must contain 1 to 5000 characters",
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

    const lostUserId = match.lostItem.userId;
    const foundUserId = match.foundItem.userId;

    if (
      senderId !== lostUserId &&
      senderId !== foundUserId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot send messages in this match",
      });
    }

    const receiverId =
      senderId === lostUserId
        ? foundUserId
        : lostUserId;

    const shouldNotify = !isUserViewingConversation(receiverId, matchId);
    const { newMessage, notification } = await prisma.$transaction(async (transaction) => {
      const savedMessage = await transaction.message.create({
        data: {
          senderId,
          receiverId,
          matchId,
          message: message.trim(),
        },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
      });

      const itemName = match.lostItem.userId === receiverId
        ? match.lostItem.title
        : match.foundItem.title;
      const preview = message.trim().length > 120
        ? `${message.trim().slice(0, 117)}...`
        : message.trim();
      const notificationRecord = shouldNotify
        ? await createNotificationRecord(transaction, {
            userId: receiverId,
            type: "MESSAGE",
            title: `New message from ${savedMessage.sender.name}`,
            message: `${savedMessage.sender.name} sent a message about "${itemName}": ${preview}`,
            href: `/messages?matchId=${matchId}`,
            relatedMatchId: matchId,
            dedupeKey: `message:${savedMessage.id}`,
          })
        : null;

      return {
        newMessage: savedMessage,
        notification: notificationRecord,
      };
    });

    emitToConversation(matchId, "message:new", newMessage);
    if (notification) await dispatchNotification(notification);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
}

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
};
