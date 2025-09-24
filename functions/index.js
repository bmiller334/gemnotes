import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defineSecret } from 'firebase-functions/params';
import { logger } from "firebase-functions";

const geminiApiKey = defineSecret('GEMINI_API_KEY');

initializeApp();

export const categorizeNote = onDocumentCreated(
  {
    document: "notes/{noteId}",
    secrets: [geminiApiKey],
  },
  async (event) => {
    const noteSnapshot = event.data;
    if (!noteSnapshot) {
      logger.log("No data associated with the event");
      return;
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey.value());
    const noteData = noteSnapshot.data();
    const noteContent = noteData.content;

    if (noteData.dossId && noteData.dossId !== "") {
      return;
    }

    logger.log(`Starting categorization for note: ${event.params.noteId}`);
    const db = getFirestore();

    // The Definitive Fix:
    // Wait for the full list of Doss before proceeding.
    const dossSnapshot = await db.collection("doss").get();
    const doss = dossSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (doss.length === 0) {
      return noteSnapshot.ref.update({ dossId: "others" });
    }

    const dossList = doss.map(d => `- ${d.name}`).join("\n");
    
    const prompt = `SYSTEM: You are a text classification engine. Your only job is to classify the user's NOTE into one of the provided CATEGORIES. You must respond with only the single, exact name of the category you choose. Do not add any other words, punctuation, or explanation.

---

CATEGORIES:
${dossList}

---

NOTE:
"${noteContent}"

---

CLASSIFICATION:`;

    logger.log("Full prompt sent to Gemini:", { prompt: prompt });

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0,
        },
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const chosenDossName = response.text().trim();
      
      logger.log(`Gemini response for note ${event.params.noteId}: "${chosenDossName}"`);

      const chosenDoss = doss.find(d => d.name.toLowerCase() === chosenDossName.toLowerCase());
      const dossId = chosenDoss ? chosenDoss.id : "others";

      logger.log(`Assigning note ${event.params.noteId} to Doss ID: ${dossId}`);
      return noteSnapshot.ref.update({ dossId: dossId });

    } catch (error) {
      logger.error(`Error calling Gemini API for note ${event.params.noteId}:`, error);
      return noteSnapshot.ref.update({ dossId: "others" });
    }
  }
);
