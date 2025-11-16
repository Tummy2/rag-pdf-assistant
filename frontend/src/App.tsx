import { useState } from "react";
import ChatHistory from "./components/ChatHistory";
import ChatBar from "./components/ChatBar";
import UploadPDF from "./components/UploadPDF";
import "./App.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function App() {
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: "user", content: "Hello!" },
    { role: "assistant", content: "Hi, how can I help you?" },
  ]);

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("http://localhost:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        alert("PDF uploaded successfully!");
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Upload failed: " + err);
    }
  };

  return (
    <div className="chat-container">
      <ChatHistory chatHistory={chatHistory} />
      <div className="chat-bar-row">
        <UploadPDF onUpload={handleUpload} />
        <ChatBar chatHistory={chatHistory} setChatHistory={setChatHistory} />
      </div>
    </div>
  );
}

export default App;
