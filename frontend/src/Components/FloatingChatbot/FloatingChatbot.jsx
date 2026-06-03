import React, { useState, useRef, useEffect } from "react";
import { Button, Input, Spin, message, Tooltip } from "antd";
import { SendOutlined, CloseOutlined, MessageOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../Apis/apiConfig";
import "./FloatingChatbot.css";

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim()) {
      return;
    }

    const userInput = inputValue.trim();

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: userInput,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    try {
      // Call chatbot API - api.get already wraps params
      const response = await api.get("/api/v1/chatbot/chat", {
        message: userInput,
      });

      // Based on apiConfig, response is already response.data
      // And ChatbotPage.jsx uses response.data (which would be response.data.data from axios)
      // Actually let's look at ChatbotPage.jsx again.
      // ChatbotPage.jsx: const botResponse = response.data || "Không thể xử lý yêu cầu của bạn";
      // apiConfig: get: ... axiosInstance.get(endpoint, { params }).then(res => res.data)
      // So if backend returns ApiResponse { data: "string" }, then res.data is ApiResponse, and response.data is the string.
      
      const botResponse = response?.data || "Xin lỗi, tôi không thể xử lý yêu cầu này.";

      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau!",
        sender: "bot",
        timestamp: new Date(),
        isError: true,
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
    message.success("Đã xóa lịch sử trò chuyện");
  };

  return (
    <>
      {/* Floating Chat Bubble Container */}
      <div className="floating-chat-bubble-container">
        {isOpen ? (
          <div className="floating-chat-window">
            {/* Header */}
            <div className="floating-chat-header">
              <div className="floating-chat-title">
                <MessageOutlined style={{ marginRight: "8px" }} />
                AI Chatbot
              </div>
              <div className="floating-chat-header-actions">
                <Tooltip title="Xóa hội thoại">
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={clearChat}
                    className="floating-chat-header-btn"
                  />
                </Tooltip>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setIsOpen(false)}
                  className="floating-chat-header-btn"
                />
              </div>
            </div>

            {/* Messages Container */}
            <div className="floating-chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`floating-message ${msg.sender} ${msg.isError ? "error" : ""}`}
                >
                  <div className="floating-message-text">{msg.text}</div>
                  <div className="floating-message-time">
                    {msg.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="floating-message bot">
                  <div className="floating-message-text loading">
                    <Spin size="small" />
                    <span style={{ marginLeft: "8px" }}>Đang trả lời...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="floating-chat-input-area">
              <Input.TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                rows={1}
                maxLength={500}
                disabled={loading}
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="floating-chat-textarea"
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={sendMessage}
                disabled={!inputValue.trim() || loading}
                className="floating-chat-send-btn"
              />
            </div>
          </div>
        ) : (
          <Tooltip title="Trợ lý AI" placement="left">
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={<MessageOutlined />}
              onClick={() => setIsOpen(true)}
              className="floating-chat-bubble"
            />
          </Tooltip>
        )}
      </div>
    </>
  );
};

export default FloatingChatbot;
