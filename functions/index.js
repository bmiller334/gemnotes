const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");
const { getVertexAI } = require("firebase-admin/vertex-ai");

initializeApp();
const db = getFirestore();

function getGenerativeModel() {
  return getVertexAI().getGenerativeModel({ model: "gemini-pro" });
}

exports.geminiTado = onDocumentCreated("notes/{noteId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const { content, dossId, dossName, userId } = snapshot.data();

  try {
    const model = getGenerativeModel();
    const prompt = `Analyze text. If task, state concisely. If not, respond "NO_TASK". Text: "${content}" Task:`;
    const resp = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
    const taskText = resp.response.candidates[0].content.parts[0].text.trim();
    
    const actionTaken = taskText !== 'NO_TASK' && taskText.length > 0 ? `Tado Created: ${taskText}` : 'No task found.';
    await db.collection("gemini_logs").add({ userId, createdAt: new Date(), noteContent: content, dossId, dossName, geminiResponse: taskText, actionTaken });

    if (taskText !== 'NO_TASK' && taskText.length > 0) {
      await db.collection("tados").add({ task: taskText, dossId, dossName, userId, completed: false, createdAt: new Date(), sourceNoteId: snapshot.id });
    }
  } catch (error) {
    console.error("Error in geminiTado:", error.message);
    await db.collection("gemini_logs").add({ userId, createdAt: new Date(), noteContent: content, error: error.message });
  }
});

exports.processDataPlate = onDocumentCreated("extracted_text/{docId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const { text: rawText, fileMetadata } = snapshot.data();
    const { dossId, userId, filePath } = fileMetadata;

    if (!dossId || !userId || !rawText) return;

    try {
        const model = getGenerativeModel();
        const prompt = `Analyze equipment data plate text. Return JSON with "model", "serial", and "specs" object for other pairs. Text: \`\`\`${rawText}\`\`\` JSON Output:`;
        const resp = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
        const jsonText = resp.response.candidates[0].content.parts[0].text.replace(/```json|```/g, '').trim();
        const parsedData = JSON.parse(jsonText);

        const file = getStorage().bucket().file(filePath);
        const [publicUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });

        const newEquipment = {
            dossId, userId,
            model: parsedData.model || "N/A", serial: parsedData.serial || "N/A",
            specs: parsedData.specs || {}, group: 'Default', 
            createdAt: new Date(), scannedImage: publicUrl
        };
        await db.collection("doss").doc(dossId).collection("equipment").add(newEquipment);
    } catch (error) {
        console.error("Error in processDataPlate:", error.message);
    }
});