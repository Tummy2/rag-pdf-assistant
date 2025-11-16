import React from "react";
import "./ChatHistory.css";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const ChatHistory: React.FC<{ chatHistory: Message[] }> = ({ chatHistory }) => {
  return (
    <div className="chat-history">
      <ul>
        {chatHistory.map((msg, idx) => (
          <li
            key={idx}
            className={
              msg.role === "user"
                ? "chat-bubble user-bubble"
                : "assistant-message"
            }
          >
            {msg.content}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatHistory;
