import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain, LLMChain } from "@langchain/classic/chains";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;

// Multer setup for file uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({ dest: path.join(__dirname, "data") });

// Initialize OpenAI Embeddings
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const vectorStore = new MemoryVectorStore(embeddings);

// Initialize LLM for question rewriting and answering
const llm = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  model: "gpt-4o-mini",
  temperature: 0.5,
});

const answerPrompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You are a helpful but somewhat sarcastic assistant that answers questions based only on the context provided. If you can't answer the question based on the context, say 'Fuck you idk'.",
  ],
  ["human", "Context:\n{context}\n\nQuestion: {question}"],
]);

// Convert into standalone question
const rephrasePrompt = PromptTemplate.fromTemplate(
  `Given a conversation and a follow up question, rephrase the follow up question to be a standalone question.\n\nChat History:\n{chat_history}\nFollow Up Input: {question}\nStandalone question:`
);

const standaloneQuestion = new LLMChain({
  llm,
  prompt: rephrasePrompt,
});

// RetrievalQAChain setup
const qaChain = RetrievalQAChain.fromLLM(llm, vectorStore.asRetriever(), {
  questionGeneratorChain: standaloneQuestion,
  prompt: answerPrompt,
});

app.get("/", (req, res) => {
  res.send("RAG PDF Assistant backend is running.");
});

app.post("/api/upload", upload.single("pdf"), async (req, res) => {
  try {
    const pdfPath = req.file.path;

    // Read with LangChain
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    // Add to vector store
    await vectorStore.addDocuments(docs);

    res.status(200).json({ message: "PDF uploaded" });
  } catch (err) {
    console.error("PDF failed to upload:", err);
    res.status(500).json({ error: "Failed to upload PDF" });
  }
});

app.post("/api/question", async (req, res) => {
  try {
    const { question, chat_history } = req.body;

    // Don't allow empty questions in frontend
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }

    // Convert chat_history array to a string
    const historyString = Array.isArray(chat_history)
      ? chat_history.map((msg) => `${msg.role}: ${msg.content}`).join("\n")
      : chat_history || "";

    // Call qaChain with question and chat_history
    const answer = await qaChain.invoke({
      query: question,
      chat_history: chat_history || "",
    });

    res.status(200).json({ answer: answer.text || answer });
  } catch (err) {
    console.error("Question answering failed:", err);
    res.status(500).json({ error: "Failed to answer question." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
