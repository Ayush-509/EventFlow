import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import socket from "../socket";

export default function Messages() {
  const { user } = useAuth();

console.log("Logged User:", user);
  const isOrganizer = user?.role === "organizer";

const [events, setEvents] = useState([]);

const [participants, setParticipants] = useState([]);

const [selectedEvent, setSelectedEvent] = useState(null);

const [selectedParticipant, setSelectedParticipant] = useState(null);

const [conversationId, setConversationId] = useState("");

const [messages, setMessages] = useState([]);

const [text, setText] = useState("");

const bottomRef = useRef(null);

useEffect(() => {

    bottomRef.current?.scrollIntoView({

        behavior:"smooth"

    });

},[messages]);
useEffect(() => {

    if (!user) return;

    console.log("Joining room:", user.id);

    socket.emit("join", user.id);

}, [user]);

useEffect(()=>{

    socket.on("receiveMessage",(message)=>{

        setMessages(prev=>{

            const alreadyExists=prev.some(

                m=>m._id===message._id

            );

            if(alreadyExists){

                return prev;

            }

            return [...prev,message];

        });

    });

    return ()=>{

        socket.off("receiveMessage");

    };

},[]);

const fetchEvents=async()=>{

    try{

        const res=await axios.get(

            "/api/events/my-events",

            {

                headers:{

                    Authorization:

                    `Bearer ${localStorage.getItem("token")}`

                }

            }

        );

        setEvents(res.data.events);

        if(res.data.events.length){

            setSelectedEvent(

                res.data.events[0]

            );

        }

    }

    catch(err){

        console.log(err);

    }

}
useEffect(()=>{

    if(isOrganizer){

        fetchEvents();

    }

},[]);

const fetchParticipants = async (eventId) => {

  try {

    const res = await axios.get(

      `/api/chat/participants/${eventId}`,

      {

        headers: {

          Authorization: `Bearer ${localStorage.getItem("token")}`,

        },

      }

    );

    setParticipants(res.data.participants);

    if (res.data.participants.length > 0) {

      openConversation(res.data.participants[0]);

    }

  }

  catch (err) {

    console.log(err);

  }

};
useEffect(() => {

  if (

    isOrganizer &&

    selectedEvent

  ) {

    fetchParticipants(selectedEvent._id);

  }

}, [selectedEvent]);

const openConversation = async (participant) => {

  try {

    setSelectedParticipant(participant);

    const res = await axios.get(

      `/api/chat/conversation/${selectedEvent._id}/${participant._id}`,

      {

        headers: {

          Authorization: `Bearer ${localStorage.getItem("token")}`,

        },

      }

    );

    setConversationId(

      res.data.conversation._id

    );

    setMessages(

      res.data.messages

    );

  }

  catch (err) {

    console.log(err);

  }

};
const sendMessage = async () => {

  if (

    !text.trim() ||

    !conversationId

  )

    return;

  try {

    const res = await axios.post(

      "/api/chat/send",

      {

        conversationId,

        text,

      },

      {

        headers: {

          Authorization: `Bearer ${localStorage.getItem("token")}`,

        },

      }

    );

    setMessages((prev) => [

      ...prev,

      res.data.message,

    ]);

    socket.emit(

      "sendMessage",

      res.data.message

    );

    setText("");

  }

  catch (err) {

    console.log(err);

  }

};

const fetchCustomerConversation = async () => {

  try {

    const res = await axios.get(

      "/api/chat/my-chat",

      {

        headers: {

          Authorization: `Bearer ${localStorage.getItem("token")}`,

        },

      }

    );

    if (!res.data.conversation)

      return;

    setConversationId(

      res.data.conversation._id

    );

    setMessages(

      res.data.messages

    );

  }

  catch (err) {

    console.log(err);

  }

};
useEffect(() => {

  if (!isOrganizer) {

    fetchCustomerConversation();

  }

}, []);

  const customerChats = [];

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
  events.map((event) => (

    <motion.div
      key={event._id}
      whileHover={{ scale: 1.02 }}
      onClick={() => setSelectedEvent(event)}
      className={`p-4 cursor-pointer border-b dark:border-slate-800 ${
        selectedEvent?._id === event._id
          ? "bg-blue-50 dark:bg-slate-900"
          : ""
      }`}
    >
      <h3 className="font-semibold">
        {event.title}
      </h3>

      <p className="text-sm text-slate-500">
        {event.location}
      </p>

    </motion.div>

  ))}
        </div>

        {/* CHAT AREA */}
        <div className="flex flex-col">

          {/* EVENT HEADER */}
          <div className="p-4 border-b dark:border-slate-800">
            <h2 className="text-xl font-bold">
              {selectedEvent?.title}
            </h2>

            <p className="text-sm text-slate-500">
              📅

{selectedEvent?.date &&
new Date(selectedEvent.date).toLocaleDateString()} • 📍{" "}
              {selectedEvent?.location}
            </p>

            {isOrganizer && selectedParticipant && (
              <p className="text-sm mt-1 text-blue-600">
                Chatting with: {selectedParticipant.name} 🎟{" "}
                {selectedParticipant.ticket}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] flex-1">

            {/* MESSAGES */}
            <div className="p-4 space-y-3 overflow-y-auto bg-slate-50 dark:bg-slate-900">

              {messages.length === 0 ? (

<div className="h-full flex items-center justify-center text-slate-500">

No messages yet.

</div>

) : (

messages.map((msg) => {

const isMe = msg.sender._id === user._id;

return (

<div

key={msg._id}

className={`flex mb-3 ${
isMe
? "justify-end"
: "justify-start"
}`}

>

<div

className={`max-w-[70%] px-4 py-2 rounded-xl ${
isMe
? "bg-blue-600 text-white"
: "bg-white dark:bg-slate-800"
}`}

>

{

!isMe &&

<p className="font-semibold text-xs mb-1">

{msg.sender.name}

</p>

}

<p>

{msg.text}

</p>

<p className="text-xs opacity-60 mt-2">

{

new Date(msg.createdAt)

.toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

})

}

</p>

</div>

</div>

);

})

)}
<div ref={bottomRef}></div>
            </div>

            {/* PARTICIPANTS (organizer only) */}
            {isOrganizer && (
              <div className="border-l dark:border-slate-800 p-3 overflow-y-auto">
                <h3 className="font-semibold mb-2">
                  Participants
                </h3>

                {selectedEvent?.participants.map((p)=>(

<div

key={p._id}

onClick={()=>openConversation(p)}

className={`

p-2

cursor-pointer

rounded-lg

mb-2

${
selectedParticipant?._id===p._id
?
"bg-blue-100 dark:bg-slate-800"
:
""
}

`}

>

<p className="font-medium">

{p.name}

</p>

<p className="text-xs text-slate-500">

🎟 {p.ticketType}

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
              disabled={!conversationId}
            />

            <button
              onClick={sendMessage}
              disabled={!conversationId}
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