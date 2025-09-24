import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defineSecret } from 'firebase-functions/params';
import { logger } from "firebase-functions";

const geminiApiKey = defineSecret('GEMINI_API_KEY');

initializeApp();

// --- CATEGORIZATION FUNCTION ---
export const categorizeNote = onDocumentCreated(
  {
    document: "notes/{noteId}",
    secrets: [geminiApiKey],
  },
  async (event) => {
    const noteSnapshot = event.data;
    if (!noteSnapshot) { return; }
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const noteData = noteSnapshot.data();
    if (noteData.dossId && noteData.dossId !== "") { return; }
    const db = getFirestore();
    const dossSnapshot = await db.collection("doss").get();
    const doss = dossSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (doss.length === 0) { return noteSnapshot.ref.update({ dossId: "others" }); }
    const dossListWithContext = doss.map(d => `- ${d.name}: (Context: ${d.context?.join(', ') || 'No context'})`).join("\n");
    const prompt = `SYSTEM: You are a strict text classification engine... CATEGORIES & CONTEXT:\n${dossListWithContext}\n- Others: ... NOTE:\n"${noteData.content}"\n\nCLASSIFICATION:`;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { temperature: 0 } });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const chosenDossName = response.text().trim();
      let dossId = "others";
      if (chosenDossName.toLowerCase() !== "others") {
        const chosenDoss = doss.find(d => d.name.toLowerCase() === chosenDossName.toLowerCase());
        if (chosenDoss) { dossId = chosenDoss.id; }
      }
      return noteSnapshot.ref.update({ dossId: dossId });
    } catch (error) {
      logger.error(`Error in categorizeNote for ${event.params.noteId}:`, error);
      return noteSnapshot.ref.update({ dossId: "others" });
    }
  }
);

// --- ACTION ITEM EXTRACTION FUNCTION ---
export const extractActionItems = onDocumentCreated(
  {
    document: "notes/{noteId}",
    secrets: [geminiApiKey],
  },
  async (event) => {
    const noteSnapshot = event.data;
    if (!noteSnapshot) return;
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const noteData = noteSnapshot.data();
    const prompt = `You are a task extraction engine... NOTE:\n"${noteData.content}"\n\nJSON RESPONSE:`;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let actionItems = [];
      const jsonString = response.text().trim().replace(/```json/g, '').replace(/```/g, '');
      try {
        actionItems = JSON.parse(jsonString);
      } catch (parseError) {
        logger.error("Failed to parse JSON from Gemini response:", parseError, { jsonString });
        actionItems = [];
      }
      const tasksWithStatus = actionItems.map(item => ({ ...item, completed: false }));
      return noteSnapshot.ref.update({ actionItems: tasksWithStatus });
    } catch (error) {
      logger.error(`Error in extractActionItems for ${event.params.noteId}:`, error);
      return;
    }
  });

// --- NEW SUMMARY GENERATION FUNCTION ---
export const generateSummary = onDocumentCreated(
  {
    document: "notes/{noteId}",
    secrets: [geminiApiKey],
  },
  async (event) => {
    const noteSnapshot = event.data;
    if (!noteSnapshot) { return; }
    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const noteData = noteSnapshot.data();
    const noteContent = noteData.content;
    if (noteContent.length < 150) {
      return noteSnapshot.ref.update({ summary: noteContent });
    }
    const prompt = `You are a text summarization engine. Provide a concise, one-paragraph summary of the following NOTE.\n\nNOTE:\n"${noteContent}"\n\nSUMMARY:`;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();
      return noteSnapshot.ref.update({ summary: summary });
    } catch (error) {
      logger.error(`Error generating summary for note ${event.params.noteId}:`, error);
      return;
    }
  });
