import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Messages() {
  const { user } = useAuth();
  const isOrganizer = user?.role === "organizer";

  // Sidebar DATA (still frontend-only structure)
  const organizerEvents = [
    {
      id: "e1",
      event: "React Workshop",
      date: "15 July 2026",
      location: "Bhopal",
      participants: [
        { id: "u1", name: "Ayush", ticket: "VIP", unread: 1 },
        { id: "u2", name: "Rahul", ticket: "General", unread: 0 },
        { id: "u3", name: "Priya", ticket: "Student", unread: 0 },
      ],
    },
  ];

  const customerChats = [];

  const sidebarData = isOrganizer ? organizerEvents : customerChats;

  const [selectedEvent, setSelectedEvent] = useState(
    sidebarData[0] || null
  );

  const [selectedUser, setSelectedUser] = useState(
    isOrganizer ? sidebarData[0]?.participants?.[0] : null
  );

  // messages stored per conversation (event + user based)
  const [conversationMap, setConversationMap] = useState({});

  const getChatKey = () => {
    if (!selectedEvent) return null;

    if (isOrganizer) {
      return `${selectedEvent.id}_${selectedUser?.id}`;
    }

    return selectedEvent.id;
  };

  const chatKey = getChatKey();
  const messages = conversationMap[chatKey] || [];

  const [text, setText] = useState("");

  const sendMessage = () => {
    if (!text.trim() || !chatKey) return;

    const newMsg = {
      id: Date.now(),
      text,
      sender: "me",
      time: new Date().toISOString(),
    };

    setConversationMap((prev) => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), newMsg],
    }));

    setText("");
  };

  return (
    <div className="h-[80vh] rounded-2xl border bg-white dark:bg-slate-950 dark:border-slate-800 overflow-hidden">

      {/* HEADER */}
      <div className="p-5 border-b dark:border-slate-800">
        <h1 className="text-2xl font-bold">📨 Messages</h1>
        <p className="text-sm text-slate-500">
          {isOrganizer
            ? "Manage conversations from your events"
            : "Chat with event organizers"}
        </p>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] h-full">

        {/* SIDEBAR */}
        <div className="overflow-y-auto border-r dark:border-slate-800">

          {isOrganizer &&
            sidebarData.map((event) => (
              <motion.div
                key={event.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setSelectedEvent(event);
                  setSelectedUser(event.participants[0]);
                }}
                className={`p-4 cursor-pointer border-b dark:border-slate-800 ${
                  selectedEvent?.id === event.id
                    ? "bg-blue-50 dark:bg-slate-900"
                    : ""
                }`}
              >
                <h3 className="font-semibold">{event.event}</h3>
                <p className="text-sm text-slate-500">
                  {event.participants.length} participants
                </p>
              </motion.div>
            ))}
        </div>

        {/* CHAT AREA */}
        <div className="flex flex-col">

          {/* EVENT HEADER */}
          <div className="p-4 border-b dark:border-slate-800">
            <h2 className="text-xl font-bold">
              {selectedEvent?.event}
            </h2>

            <p className="text-sm text-slate-500">
              📅 {selectedEvent?.date} • 📍{" "}
              {selectedEvent?.location}
            </p>

            {isOrganizer && selectedUser && (
              <p className="text-sm mt-1 text-blue-600">
                Chatting with: {selectedUser.name} 🎟{" "}
                {selectedUser.ticket}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] flex-1">

            {/* MESSAGES */}
            <div className="p-4 space-y-3 overflow-y-auto bg-slate-50 dark:bg-slate-900">

              {!chatKey || messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">
                  No messages yet. Start conversation 👋
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.sender === "me"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 rounded-xl max-w-[70%] ${
                        msg.sender === "me"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* PARTICIPANTS (organizer only) */}
            {isOrganizer && (
              <div className="border-l dark:border-slate-800 p-3 overflow-y-auto">
                <h3 className="font-semibold mb-2">
                  Participants
                </h3>

                {selectedEvent?.participants?.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedUser(p)}
                    className={`p-2 cursor-pointer rounded-lg mb-2 ${
                      selectedUser?.id === p.id
                        ? "bg-blue-100 dark:bg-slate-800"
                        : ""
                    }`}
                  >
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      🎟 {p.ticket}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="p-3 border-t dark:border-slate-800 flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && sendMessage()
              }
              className="flex-1 px-3 py-2 border rounded-lg dark:bg-slate-900"
              placeholder="Type a message..."
              disabled={!chatKey}
            />

            <button
              onClick={sendMessage}
              disabled={!chatKey}
              className="bg-blue-600 text-white px-4 rounded-lg disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}