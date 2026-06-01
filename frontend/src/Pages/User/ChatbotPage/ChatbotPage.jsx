import React, { useState, useRef, useEffect } from "react";
import { Input, Button, Spin, Empty, message } from "antd";
import { SendOutlined, ClearOutlined, LoadingOutlined } from "@ant-design/icons";
import api from "../../../Apis/apiConfig";
import "./ChatbotPage.css";

const ChatbotPage = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! 👋 Tôi là trợ lý bán hàng AI của bạn. Hãy hỏi tôi về các sản phẩm hoặc bạn cần giúp đỡ gì?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) {
      message.warning("Vui lòng nhập tin nhắn");
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Call chatbot API
      const response = await api.get("/api/v1/chatbot/chat", {
        message: inputValue,
      });

      // API wrapper returns full ApiResponse { success, message, data }
      const botResponse = response.data || "Không thể xử lý yêu cầu của bạn";

      // Add bot message
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Lỗi khi gọi chatbot API:", error);
      message.error("Không thể kết nối đến chatbot. Vui lòng thử lại!");

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau!",
        sender: "bot",
        isError: true,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Xin chào! 👋 Tôi là trợ lý bán hàng AI của bạn. Hãy hỏi tôi về các sản phẩm hoặc bạn cần giúp đỡ gì?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
    message.success("Cuộc trò chuyện đã được xóa");
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="header-content">
          <h1>🤖 Trợ Lý Bán Hàng AI</h1>
          <p>Hỏi tôi về sản phẩm, giá cả, và các khuyến nghị mua sắm</p>
        </div>
      </div>

      <div className="chatbot-messages">
        {messages.length === 0 ? (
          <Empty description="Không có tin nhắn nào" />
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-wrapper ${msg.sender === "user" ? "user-message" : "bot-message"}`}
            >
              <div className={`message ${msg.isError ? "error" : ""}`}>
                <p>{msg.text}</p>
                <span className="timestamp">
                  {msg.timestamp.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message-wrapper bot-message">
            <div className="message loading">
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />}
              />
              <span style={{ marginLeft: 8 }}>Trợ lý đang suy nghĩ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chatbot-footer">
        <Input.TextArea
          placeholder="Nhập tin nhắn của bạn... (Shift + Enter để xuống dòng)"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          autoSize={{ minRows: 2, maxRows: 4 }}
          disabled={loading}
          className="message-input"
        />
        <div className="input-actions">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={loading}
            disabled={!inputValue.trim() || loading}
            className="send-button"
          >
            Gửi
          </Button>
          <Button
            icon={<ClearOutlined />}
            onClick={clearChat}
            disabled={loading}
            className="clear-button"
          >
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
