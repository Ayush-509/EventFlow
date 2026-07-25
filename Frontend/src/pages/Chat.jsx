import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);



// Inside Chat component
const { token, user } = useAuth();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
  if (!token || !user) {
    navigate("/auth");
    return;
  }

  socket.connect();

  socket.emit("join", user.id);

  return () => {
    socket.disconnect();
  };
}, [token, user, navigate]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `/api/chat/messages/${conversationId}`,
        { headers }
      );

      setMessages(res.data.messages);

      setLoading(false);
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    socket.on("receiveMessage", (message) => {
  setMessages((prev) => {
    if (prev.some((m) => m._id === message._id)) {
      return prev;
    }

    return [...prev, message];
  });
});

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    try {
      const res = await axios.post(
        "/api/chat/send",
        {
          conversationId,
          message: text,
        },
        {
          headers,
        }
      );

      const newMessage = res.data.message;

      setMessages((prev) => [...prev, newMessage]);

      socket.emit("sendMessage", {
        ...newMessage,
        receiverId: res.data.receiverId,
      });

      setText("");
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-4xl mx-auto h-screen flex flex-col">

        <div className="bg-blue-600 text-white p-4 text-xl font-semibold shadow">
          Chat
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {loading ? (
            <p>Loading...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            messages.map((msg) => (

              <div
                key={msg._id}
                className={`flex ${
                  msg.sender?._id === user.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >

                <div
                  className={`px-4 py-2 rounded-xl max-w-sm ${
                    msg.sender._id === user.id
                      ? "bg-blue-600 text-white"
                      : "bg-white shadow"
                  }`}
                >

                  <p>{msg.message}</p>

                  <p className="text-xs mt-1 opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>

                </div>

              </div>

            ))
          )}

          <div ref={bottomRef}></div>

        </div>

        <form
          onSubmit={handleSend}
          className="p-4 bg-white flex gap-2 border-t"
        >

          <input
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
  type="submit"
  className="bg-blue-600 text-white px-6 rounded-lg"
>
  Send
</button>

        </form>

      </div>

    </div>
  );
};

export default Chat;