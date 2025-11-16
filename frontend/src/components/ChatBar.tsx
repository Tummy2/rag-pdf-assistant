import React, { useState } from "react";
import "./ChatBar.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ChatBarProps = {
  chatHistory: Message[];
  setChatHistory: React.Dispatch<React.SetStateAction<Message[]>>;
};

const ChatBar: React.FC<ChatBarProps> = ({ chatHistory, setChatHistory }) => {
  const [input, setInput] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat history
    const newHistory = [
      ...chatHistory,
      { role: "user" as "user", content: input }
    ];
    setChatHistory(newHistory);

    // Make API call
    try {
      const res = await fetch("http://localhost:8000/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: input,
          chat_history: newHistory,
        }),
      });
      const data = await res.json();

      // Add assistant response to chat history
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
    } catch (err) {
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong." },
      ]);
    }

    setInput("");
  };

  return (
    <form className="chat-bar" onSubmit={handleSend}>
      <input
        className="chat-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        autoFocus
      />
      <button type="submit" className="send-btn">
        Send
      </button>
    </form>
  );
};

export default ChatBar;
