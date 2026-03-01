import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const conversationsRouter = Router();

conversationsRouter.post("/", async (_req, res) => {
  try {
    const conversation = await prisma.conversation.create({
      data: {},
    });
    res.status(201).json({ id: conversation.id });
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation." });
  }
});

conversationsRouter.get("/:id/messages", async (req, res) => {
  const id = req.params.id?.trim();
  if (!id) {
    res.status(400).json({ error: "Missing conversation id." });
    return;
  }
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });
    res.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Failed to load messages." });
  }
});

conversationsRouter.post("/:id/messages", async (req, res) => {
  const id = req.params.id?.trim();
  const role = typeof req.body?.role === "string" ? req.body.role.trim() : "";
  const content = typeof req.body?.content === "string" ? req.body.content : String(req.body?.content ?? "");
  if (!id) {
    res.status(400).json({ error: "Missing conversation id." });
    return;
  }
  if (role !== "user" && role !== "assistant") {
    res.status(400).json({ error: "Role must be 'user' or 'assistant'." });
    return;
  }
  try {
    const message = await prisma.message.create({
      data: { conversationId: id, role, content },
    });
    res.status(201).json({
      id: message.id,
      role: message.role,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (err) {
    console.error("Add message error:", err);
    res.status(500).json({ error: "Failed to add message." });
  }
});
