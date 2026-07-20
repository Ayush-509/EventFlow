import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import socket from "../socket";

export default function Chat() {
  const { conversationId } = useParams();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  // Fetch existing messages when chat opens
  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  // Join socket room when user is available
 useEffect(() => {
  console.log("===== SOCKET DEBUG =====");
  console.log("USER:", user);
  console.log("USER._ID:", user?._id);
  console.log("USER.ID:", user?.id);

  if (!user) return;

  socket.emit("join", user._id || user.id);

  socket.on("receiveMessage", (message) => {
    setMessages((prev) => [...prev, message]);
  });

  return () => {
    socket.off("receiveMessage");
  };
}, [user]);

  // Listen for incoming messages
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      // Only add messages for the current conversation
      if (message.conversation !== conversationId && message.conversation._id !== conversationId) {
        return;
      }

      setMessages((prev) => {
        // Prevent duplicate messages
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) return prev;

        return [...prev, message];
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [conversationId]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `/api/chat/messages/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessages(res.data.messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || sending) return;

    try {
      setSending(true);

      const res = await axios.post(
        "/api/chat/send",
        {
          conversationId,
          text: text.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Add message immediately for sender
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === res.data.message._id);
        if (exists) return prev;

        return [...prev, res.data.message];
      });

      setText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <p className="text-lg">Loading chat...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-xl border h-[80vh] flex flex-col">
        {/* Header */}
        <div className="border-b p-4 font-bold text-xl">
          Chat
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              No messages yet.
            </div>
          )}

          {messages.map((msg) => {
            const isMe =
              msg.sender?._id === user?._id ||
              msg.sender === user?._id;

            return (
              <div
                key={msg._id}
                className={`flex mb-4 ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl shadow ${
                    isMe
                      ? "bg-blue-600 text-white"
                      : "bg-white border"
                  }`}
                >
                  {!isMe && msg.sender?.name && (
                    <p className="text-xs font-semibold text-blue-600 mb-1">
                      {msg.sender.name}
                    </p>
                  )}

                  <p>{msg.text}</p>

                  <p
                    className={`text-xs mt-2 ${
                      isMe ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4 flex gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            className="flex-1 border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={sendMessage}
            disabled={sending || !text.trim()}
            className="bg-blue-600 text-white px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}