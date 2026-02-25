"use client";

import { useEffect, useState, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Send, Plus, Hash, LogOut, Users, MessageSquare, Star, Search, Loader2, Lock, Link2, Trash2, X } from "lucide-react";

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
  ownerId: string;
  hasPassword?: boolean;
  _count: { members: number; messages: number };
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, Message[]>>({});
  const [loadingRoomId, setLoadingRoomId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newRoomPassword, setNewRoomPassword] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showNewRoom, setShowNewRoom] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [pendingRoom, setPendingRoom] = useState<Room | null>(null);
  const [joinPassword, setJoinPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [inviteFeedback, setInviteFeedback] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeRoomIdRef = useRef<string | null>(null);
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
    s.on("new_message", (msg: Message) => {
      setMessages(prev => {
        const cleaned = prev.filter(item => !(
          item.id.startsWith("temp-") &&
          item.user.id === msg.user.id &&
          item.content === msg.content
        ));
        return [...cleaned, msg];
      });
      setMessagesByRoom(prev => {
        const roomId = activeRoomIdRef.current;
        if (!roomId) return prev;
        const cached = prev[roomId] ?? [];
        const cleaned = cached.filter(item => !(
          item.id.startsWith("temp-") &&
          item.user.id === msg.user.id &&
          item.content === msg.content
        ));
        return { ...prev, [roomId]: [...cleaned, msg] };
      });
    });
    s.on("user_typing", ({ name }: { name: string }) => {
      setTypingUsers(prev => prev.includes(name) ? prev : [...prev, name]);
    });
    s.on("user_stop_typing", () => setTypingUsers([]));
    setSocket(s);
    fetchRooms(session.token);
    return () => { s.disconnect(); };
  }, [session?.token]);

  useEffect(() => {
    activeRoomIdRef.current = activeRoom?.id ?? null;
  }, [activeRoom?.id]);

  useEffect(() => {
    const stored = localStorage.getItem("chatapp:favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("chatapp:favorites", JSON.stringify(favorites));
  }, [favorites]);

  const inviteToken = searchParams.get("invite");

  useEffect(() => {
    if (!inviteToken || !session?.token || !socket) return;
    joinByInvite(inviteToken).finally(() => {
      router.replace("/chat");
    });
  }, [inviteToken, session?.token, socket, router]);

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

  async function joinAndOpenRoom(
    room: Room,
    options: { password?: string; inviteToken?: string } = {}
  ) {
    if (!session?.token) return;
    if (room.hasPassword && !options.password && !options.inviteToken) {
      setPendingRoom(room);
      setJoinPassword("");
      setJoinError("");
      return;
    }
    setLoadingRoomId(room.id);
    activeRoomIdRef.current = room.id;
    const cached = messagesByRoom[room.id];
    if (cached) setMessages(cached);

    const joinRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${room.id}/join`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: options.password,
        inviteToken: options.inviteToken,
      }),
    });

    if (!joinRes.ok) {
      const data = await joinRes.json().catch(() => ({}));
      if (data?.error !== "Already a member") {
        setJoinError(data?.error || "Unable to join room");
        setPendingRoom(room);
        setLoadingRoomId(null);
        return;
      }
    }

    setActiveRoom(room);
    socket?.emit("join_room", room.id);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${room.id}/messages`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const msgs = await res.json();
      setMessages(msgs);
      setMessagesByRoom(prev => ({ ...prev, [room.id]: msgs }));
    } finally {
      setLoadingRoomId(null);
    }
  }

  async function createRoom() {
    if (!newRoom.trim() || !session?.token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms`, {
      method: "POST",
      headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ name: newRoom, password: newRoomPassword || undefined }),
    });
    if (res.ok) {
      setNewRoom("");
      setNewRoomPassword("");
      setShowNewRoom(false);
      fetchRooms(session.token);
    }
  }

  async function joinByInvite(token: string) {
    if (!session?.token) return;
    setInviteLoading(true);
    setInviteFeedback("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/invites/${token}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInviteFeedback(data?.error || "Invite invalid");
        return;
      }
      const room = await res.json();
      setInviteFeedback("Invite accepted");
      setActiveRoom(room);
      await fetchRooms(session.token);
      socket?.emit("join_room", room.id);
      const msgsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${room.id}/messages`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const msgs = await msgsRes.json();
      setMessages(msgs);
      setMessagesByRoom(prev => ({ ...prev, [room.id]: msgs }));
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleCreateInvite() {
    if (!activeRoom || !session?.token) return;
    setInviteLoading(true);
    setInviteFeedback("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${activeRoom.id}/invites`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ expiresInDays: 3 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInviteFeedback(data?.error || "Invite failed");
        return;
      }
      const data = await res.json();
      const link = `${window.location.origin}/chat?invite=${data.token}`;
      await navigator.clipboard.writeText(link);
      setInviteFeedback("Invite copied");
    } catch {
      setInviteFeedback("Invite failed");
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleDeleteRoom() {
    if (!activeRoom || !session?.token) return;
    const confirmed = window.confirm(`Delete #${activeRoom.name}? This cannot be undone.`);
    if (!confirmed) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/rooms/${activeRoom.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session.token}` },
      });
      if (res.ok) {
        setActiveRoom(null);
        setMessages([]);
        setMessagesByRoom(prev => {
          const { [activeRoom.id]: _removed, ...rest } = prev;
          return rest;
        });
        fetchRooms(session.token);
      } else {
        const data = await res.json().catch(() => ({}));
        setInviteFeedback(data?.error || "Delete failed");
      }
    } finally {
      setDeleteLoading(false);
    }
  }

  function sendMessage() {
    if (!input.trim() || !activeRoom || !socket || !session?.user) return;
    const content = input.trim();
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
      user: {
        id: session.user.id ?? "me",
        name: session.user.name ?? "You",
      },
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setMessagesByRoom(prev => ({
      ...prev,
      [activeRoom.id]: [...(prev[activeRoom.id] ?? []), optimisticMessage],
    }));
    socket.emit("send_message", { roomId: activeRoom.id, content });
    setInput("");
    socket.emit("stop_typing", { roomId: activeRoom.id });
  }

  function toggleFavorite(roomId: string) {
    setFavorites(prev => ({ ...prev, [roomId]: !prev[roomId] }));
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

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRooms = rooms.filter(room => {
    if (showFavorites && !favorites[room.id]) return false;
    if (!normalizedSearch) return true;
    return room.name.toLowerCase().includes(normalizedSearch);
  });
  const isOwner = Boolean(activeRoom && session?.user?.id && activeRoom.ownerId === session.user.id);

  if (status === "loading") return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
      <div className="flex h-screen bg-[#0b0b0f] text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 bg-[#0f1117] border-r border-white/10 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-black" />
            </div>
            <div>
              <h1 className="font-semibold text-white">ChatApp</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-emerald-400 text-xs">{onlineUsers.length} online</span>
              </div>
            </div>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full ${getAvatarColor(session?.user?.name || "U")} flex items-center justify-center text-xs font-bold`}>
              {getInitials(session?.user?.name || "U")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-white/50 text-xs truncate">{session?.user?.email}</p>
            </div>
          </div>
        </div>

        {/* Rooms */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="mb-4 px-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <Search className="h-4 w-4 text-white/40" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search channels"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowFavorites(prev => !prev)}
                className={`rounded-md px-2 py-1 text-xs font-semibold transition ${
                  showFavorites ? "bg-white text-black" : "bg-white/10 text-white/70"
                }`}
              >
                Favorites
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-3 px-2">
            <span className="text-white/50 text-xs font-semibold uppercase tracking-widest">Channels</span>
            <button onClick={() => setShowNewRoom(!showNewRoom)} title="Create new channel"
              className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <Plus className="w-3 h-3 text-white/60" />
            </button>
          </div>

          {showNewRoom && (
            <div className="mb-3 flex flex-col gap-2 px-1">
              <Input
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                onKeyDown={e => e.key === "Enter" && createRoom()}
                placeholder="channel-name"
                className="bg-black/40 border-white/10 text-white text-xs h-8 placeholder:text-white/40"
              />
              <div className="flex gap-2">
                <Input
                  value={newRoomPassword}
                  onChange={e => setNewRoomPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && createRoom()}
                  placeholder="optional password"
                  type="password"
                  className="bg-black/40 border-white/10 text-white text-xs h-8 placeholder:text-white/40"
                />
                <button
                  onClick={createRoom}
                  className="px-3 h-8 bg-white text-black hover:bg-white/90 rounded-md text-xs font-semibold transition"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            {filteredRooms.map(room => (
              <div
                key={room.id}
                role="button"
                tabIndex={0}
                onClick={() => joinAndOpenRoom(room)}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    joinAndOpenRoom(room);
                  }
                }}
                className={`w-full cursor-pointer text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 text-sm transition-all ${
                  activeRoom?.id === room.id
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Hash className={`w-4 h-4 flex-shrink-0 ${activeRoom?.id === room.id ? "text-white" : "text-white/40"}`} />
                <span className="truncate">{room.name}</span>
                {room.hasPassword && <Lock className="h-3.5 w-3.5 text-white/40" />}
                <span className="ml-auto flex items-center gap-2 text-xs text-white/40">
                  {room._count.messages > 0 && <span>{room._count.messages}</span>}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={event => {
                      event.stopPropagation();
                      toggleFavorite(room.id);
                    }}
                    onKeyDown={event => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFavorite(room.id);
                      }
                    }}
                    aria-label={favorites[room.id] ? "Remove favorite" : "Add favorite"}
                    className="rounded-md p-1 transition hover:bg-white/10"
                  >
                    <Star
                      className={`h-4 w-4 ${favorites[room.id] ? "text-white fill-white" : "text-white/40"}`}
                    />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sign out */}
        <div className="p-3 border-t border-white/10">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm">
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
            <div className="px-6 py-4 border-b border-white/10 bg-[#0f1117] flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                <Hash className="w-4 h-4 text-white/70" />
              </div>
              <div>
                <h2 className="font-semibold text-white">{activeRoom.name}</h2>
                <p className="text-white/50 text-xs flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {activeRoom._count.members} members
                </p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                {inviteFeedback && (
                  <span className="text-xs text-white/40">{inviteFeedback}</span>
                )}
                {loadingRoomId === activeRoom.id && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Syncing
                  </div>
                )}
                {isOwner && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCreateInvite}
                      disabled={inviteLoading}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-50"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      Invite
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteRoom}
                      disabled={deleteLoading}
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 transition hover:border-white/40 hover:text-white disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && loadingRoomId === activeRoom.id && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="h-4 w-40 rounded-full bg-white/10" />
                  <div className="mt-3 h-3 w-72 rounded-full bg-white/5" />
                </div>
              )}
              {messages.length === 0 && loadingRoomId !== activeRoom.id && (
                <div className="text-center py-12">
                  <Hash className="w-12 h-12 text-white/20 mx-auto mb-3" />
                  <p className="text-white/70 font-medium">Welcome to #{activeRoom.name}</p>
                  <p className="text-white/40 text-sm mt-1">Send the first message!</p>
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
                        <span className={`text-xs text-white/40 mb-1 ${isMe ? "text-right" : ""}`}>
                          {isMe ? "You" : msg.user.name}
                        </span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-white text-black rounded-tr-sm"
                          : "bg-white/5 text-white border border-white/10 rounded-tl-sm"
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-white/30 text-xs mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-1 bg-white/5 px-4 py-3 rounded-2xl rounded-tl-sm border border-white/10">
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce-delay-0" />
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce-delay-150" />
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce-delay-300" />
                  </div>
                  <span className="text-white/40 text-xs">{typingUsers.join(", ")} is typing</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-[#0f1117]">
              <div className="flex gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-2 items-center">
                <input
                  value={input}
                  onChange={e => { setInput(e.target.value); handleTyping(); }}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder={`Message #${activeRoom.name}...`}
                  className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none text-sm"
                />
                <button onClick={sendMessage} title="Send message"
                  className="w-8 h-8 bg-white hover:bg-white/90 rounded-lg flex items-center justify-center transition flex-shrink-0">
                  <Send className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <MessageSquare className="w-10 h-10 text-white/40" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Welcome to ChatApp</h2>
              <p className="text-white/50 text-sm">Select a channel or create one to start chatting</p>
              {inviteFeedback && (
                <p className="mt-3 text-sm text-white/60">{inviteFeedback}</p>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      {pendingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0f1117] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Enter channel password</h3>
              <button
                type="button"
                onClick={() => {
                  setPendingRoom(null);
                  setJoinPassword("");
                  setJoinError("");
                }}
                aria-label="Close password prompt"
                className="rounded-full p-2 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm text-white/50">#{pendingRoom.name} is protected.</p>
            <div className="mt-4 space-y-3">
              <Input
                type="password"
                value={joinPassword}
                onChange={e => setJoinPassword(e.target.value)}
                placeholder="Password"
                className="bg-black/40 border-white/10 text-white placeholder:text-white/40"
              />
              {joinError && <p className="text-sm text-red-400">{joinError}</p>}
              <button
                type="button"
                onClick={() => joinAndOpenRoom(pendingRoom, { password: joinPassword })}
                className="w-full rounded-xl bg-white py-2 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Join channel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}