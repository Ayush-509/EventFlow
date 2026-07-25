import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const OrganizerChats = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const fetchChats = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/chat/organizer", {
        headers,
      });

      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error("Error fetching organizer chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchChats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-4">
        <div className="border-b pb-3 mb-4">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <p className="text-sm text-gray-500">
            Conversations from customers
          </p>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading chats...</p>
        ) : conversations.length === 0 ? (
          <p className="text-gray-500">No conversations yet.</p>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                className="flex items-center justify-between border rounded-xl p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => openChat(conv._id)}
              >
                <div>
                  <h3 className="font-semibold">
                    {conv.customer?.name || "Customer"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Event: {conv.event?.title || "Event"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {conv.lastMessage || "No messages yet"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {conv.lastMessageAt
                      ? new Date(conv.lastMessageAt).toLocaleString()
                      : ""}
                  </p>
                  <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerChats;