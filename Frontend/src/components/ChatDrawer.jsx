import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPaperPlane, FaTimes } from "react-icons/fa";

export default function ChatDrawer({
  open,
  onClose,
  eventTitle,
}) {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (!message.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "user",
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setMessage("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 25,
              stiffness: 250,
            }}
            className="
              fixed right-0 top-0
              h-screen
              w-full sm:w-[420px]
              bg-white dark:bg-slate-950
              shadow-2xl
              z-50
              flex flex-col
            "
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">
                  {eventTitle}
                </h2>

                <div className="flex items-center gap-2 text-sm text-green-500">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Organizer Online
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-xl hover:rotate-90 transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.25,
                  }}
                  className={`flex ${
                    msg.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`
                      max-w-[80%]
                      px-4 py-3
                      rounded-2xl
                      shadow-sm
                      ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-white dark:bg-slate-800"
                      }
                    `}
                  >
                    <p>{msg.text}</p>

                    <div
                      className={`text-xs mt-1 ${
                        msg.sender === "user"
                          ? "text-blue-100"
                          : "text-slate-400"
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Fake Typing */}
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                    <span
                      className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></span>
                    <span
                      className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && sendMessage()
                  }
                  placeholder="Type a message..."
                  className="
                    flex-1
                    px-4 py-3
                    rounded-xl
                    border
                    border-slate-300
                    dark:border-slate-700
                    bg-white
                    dark:bg-slate-900
                  "
                />

                <button
                  onClick={sendMessage}
                  className="
                    px-4
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    transition
                  "
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}