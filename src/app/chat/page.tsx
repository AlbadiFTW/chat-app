"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Send, Plus, Hash, LogOut, Users, MessageSquare } from "lucide-react";

type Message = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
};

type Room = {
  id: string;
  name: string;
  description?: string;
  _count: { members: number; messages: number };
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (!session?.token) return;
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      auth: { token: session.token },
    });
    s.on("online_users", (users: string[]) => setOnlineUsers(users));
    s.on("new_message", (msg: Message) => setMessages(prev => [...prev, msg]));
    s.on("user_typing", ({ name }: { name: string }) => {
      setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]);
    });
    s.on("user_stop_typing", () => setTypingUsers([]));
    setSocket(s);
    fetchRooms(session.token);
    return () => { s.disconnect(); };
  }, [session?.token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchRooms(token: string) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setRooms(data);
  }

  async function joinAndOpenRoom(room: Room) {
    if (!session?.token) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${room.id}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}` },
    });
    socket?.emit("join_room", room.id);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${room.id}/messages`, {
      headers: { Authorization: `Bearer ${session.token}` },
    });
    const msgs = await res.json();
    setMessages(msgs);
    setActiveRoom(room);
  }

  async function createRoom() {
    if (!newRoom.trim() || !session?.token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoom }),
    });
    if (res.ok) {
      setNewRoom("");
      setShowNewRoom(false);
      fetchRooms(session.token);
    }
  }

  function sendMessage() {
    if (!input.trim() || !activeRoom || !socket) return;
    socket.emit("send_message", { roomId: activeRoom.id, content: input });
    setInput("");
    socket.emit("stop_typing", { roomId: activeRoom.id });
  }

  function handleTyping() {
    if (!activeRoom || !socket) return;
    socket.emit("typing", { roomId: activeRoom.id });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId: activeRoom.id });
    }, 1500);
  }

  function getInitials(name: string) {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  }

  function getAvatarColor(name: string) {
    const colors = ["bg-violet-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500", "bg-cyan-500", "bg-rose-500"];
    return colors[name.charCodeAt(0) % colors.length];
  }

  if (status === "loading") return (
    <div className="min-h-screen bg-[#0f0a1e] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0f0a1e] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-[#160d2e] border-r border-violet-900/30 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-violet-900/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-white">ChatApp</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs">{onlineUsers.length} online</span>
              </div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-violet-900/30">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${getAvatarColor(session?.user?.name || "U")} flex items-center justify-center text-xs font-bold`}>
              {getInitials(session?.user?.name || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-violet-400 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-violet-400 text-xs font-semibold uppercase tracking-widest">Channels</span>
            <button onClick={() => setShowNewRoom(!showNewRoom)} title="Create new channel"
              className="w-6 h-6 rounded-md bg-violet-600/20 hover:bg-violet-600/40 flex items-center justify-center transition-colors">
              <Plus className="w-3 h-3 text-violet-400" />
            </button>
          </div>

          {showNewRoom && (
            <div className="mb-3 flex gap-2 px-1">
              <Input value={newRoom} onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createRoom()}
                placeholder="channel-name"
                className="bg-violet-900/20 border-violet-700/50 text-white text-xs h-8 placeholder:text-violet-500" />
              <button onClick={createRoom}
                className="px-3 h-8 bg-violet-600 hover:bg-violet-700 rounded-md text-xs font-medium transition-colors">
                Add
              </button>
            </div>
          )}

          <div className="space-y-0.5">
            {rooms.map(room => (
              <button key={room.id} onClick={() => joinAndOpenRoom(room)}
                className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-sm transition-all ${
                  activeRoom?.id === room.id
                    ? "bg-violet-600/30 text-white border border-violet-500/30"
                    : "text-violet-300/70 hover:bg-violet-900/20 hover:text-white"
                }`}>
                <Hash className={`w-4 h-4 flex-shrink-0 ${activeRoom?.id === room.id ? "text-violet-400" : "text-violet-600"}`} />
                <span className="truncate">{room.name}</span>
                {room._count.messages > 0 && (
                  <span className="ml-auto text-xs text-violet-500">{room._count.messages}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="p-3 border-t border-violet-900/30">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-violet-400 hover:text-white hover:bg-violet-900/20 transition-colors text-sm">
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeRoom ? (
          <>
            {/* Room header */}
            <div className="px-6 py-4 border-b border-violet-900/30 bg-[#130b28] flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-600/20 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h2 className="font-semibold text-white">{activeRoom.name}</h2>
                <p className="text-violet-400 text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {activeRoom._count.members} members
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Hash className="w-12 h-12 text-violet-800 mx-auto mb-3" />
                  <p className="text-violet-400 font-medium">Welcome to #{activeRoom.name}</p>
                  <p className="text-violet-600 text-sm mt-1">Send the first message!</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.user.id === session?.user?.id;
                const prevMsg = messages[i - 1];
                const showAvatar = !prevMsg || prevMsg.user.id !== msg.user.id;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? "visible" : "invisible"}`}>
                      <div className={`w-8 h-8 rounded-full ${getAvatarColor(msg.user.name)} flex items-center justify-center text-xs font-bold`}>
                        {getInitials(msg.user.name)}
                      </div>
                    </div>
                    <div className={`flex flex-col max-w-sm ${isMe ? "items-end" : "items-start"}`}>
                      {showAvatar && (
                        <span className={`text-xs text-violet-400 mb-1 ${isMe ? "text-right" : ""}`}>
                          {isMe ? "You" : msg.user.name}
                        </span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-violet-600 text-white rounded-tr-sm"
                          : "bg-[#1e1040] text-white border border-violet-900/40 rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-violet-700 text-xs mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 bg-[#1e1040] px-4 py-3 rounded-2xl rounded-tl-sm border border-violet-900/40">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce-delay-0" />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce-delay-150" />
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce-delay-300" />
                  </div>
                  <span className="text-violet-500 text-xs">{typingUsers.join(", ")} is typing</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-violet-900/30 bg-[#130b28]">
              <div className="flex gap-3 bg-[#1e1040] rounded-xl border border-violet-900/40 px-4 py-2 items-center">
                <input
                  value={input}
                  onChange={e => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={`Message #${activeRoom.name}...`}
                  className="flex-1 bg-transparent text-white placeholder:text-violet-600 outline-none text-sm"
                />
                <button onClick={sendMessage} title="Send message"
                  className="w-8 h-8 bg-violet-600 hover:bg-violet-700 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-violet-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
                <MessageSquare className="w-10 h-10 text-violet-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to ChatApp</h2>
              <p className="text-violet-400 text-sm">Select a channel or create one to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}