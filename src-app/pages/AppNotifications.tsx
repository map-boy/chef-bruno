import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const G = {
  gold:    "#C9973A",
  goldL:   "#E8BB6A",
  white:   "#FFFFFF",
  bg:      "#F0EBE0",
  card:    "#FFFFFF",
  border:  "#E2D9C8",
  text:    "#1A1209",
  muted:   "#7A6A52",
  inputBg: "#FAF7F2",
};

interface Notification {
  id: string;
  type: "like" | "comment" | "message" | "follow" | "sale" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  fromName?: string;
  fromPhoto?: string;
}

interface Props {
  firebaseUser: FirebaseUser | null;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1", type: "like",
    title: "New like on your post",
    body: "Alice liked your post about Kigali Apartments",
    read: false, createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    fromName: "Alice M.",
  },
  {
    id: "2", type: "message",
    title: "New message",
    body: "Bruno: Is the Toyota still available?",
    read: false, createdAt: new Date(Date.now() - 22 * 60000).toISOString(),
    fromName: "Bruno S.",
  },
  {
    id: "3", type: "sale",
    title: "Someone is interested!",
    body: "A buyer is viewing your Gold Nuggets listing",
    read: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "4", type: "comment",
    title: "New comment",
    body: "Jean: What's the minimum order for catering?",
    read: true, createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    fromName: "Jean P.",
  },
  {
    id: "5", type: "system",
    title: "Welcome to Digital World 🌍",
    body: "Your account is set up. Start listing your products!",
    read: true, createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "6", type: "follow",
    title: "New follower",
    body: "Marie is now following your store",
    read: true, createdAt: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
    fromName: "Marie K.",
  },
];

const NOTIF_ICONS: Record<string, string> = {
  like:    "❤️",
  comment: "💬",
  message: "✉️",
  follow:  "👤",
  sale:    "💰",
  system:  "🌍",
};

const NOTIF_COLORS: Record<string, string> = {
  like:    "rgba(220,38,38,0.1)",
  comment: "rgba(201,151,58,0.1)",
  message: "rgba(13,148,136,0.1)",
  follow:  "rgba(201,151,58,0.1)",
  sale:    "rgba(22,163,74,0.1)",
  system:  "rgba(201,151,58,0.08)",
};

export default function AppNotifications({ firebaseUser }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  };

  const filtered = filter === "unread"
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div style={{ background: G.bg, minHeight: "100vh" }}>

      {/* Header */}
      <div style={{
        background: G.white,
        borderBottom: `1px solid ${G.border}`,
        padding: "16px",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 20, fontWeight: 700, margin: 0,
              background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Notifications</h2>
            {unreadCount > 0 && (
              <span style={{
                background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
                color: "#fff", borderRadius: 10, fontSize: 11,
                fontWeight: 700, padding: "2px 8px",
                boxShadow: "0 2px 8px rgba(201,151,58,0.4)",
              }}>{unreadCount}</span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead}
              style={{
                background: "none", border: "none",
                color: G.gold, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", background: G.bg, borderRadius: 10, padding: 3 }}>
          {(["all", "unread"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                flex: 1, padding: "8px", borderRadius: 8, border: "none",
                background: filter === f ? G.white : "transparent",
                color: filter === f ? G.gold : G.muted,
                fontWeight: filter === f ? 700 : 400, fontSize: 13,
                cursor: "pointer",
                boxShadow: filter === f ? "0 1px 6px rgba(0,0,0,0.07)" : "none",
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}>
              {f === "all" ? "All" : `Unread (${unreadCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div style={{ padding: "10px 12px 20px" }}>
        {filtered.length === 0 ? (
          <div style={{
            background: G.white, borderRadius: 16, padding: "52px 24px",
            textAlign: "center", border: `1px solid ${G.border}`,
            marginTop: 8,
          }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🔔</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: G.text, marginBottom: 6 }}>
              All caught up!
            </p>
            <p style={{ color: G.muted, fontSize: 13 }}>
              {filter === "unread" ? "No unread notifications." : "No notifications yet."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filtered.map(notif => (
              <NotifCard
                key={notif.id}
                notif={notif}
                onRead={() => markRead(notif.id)}
                onDelete={() => deleteNotif(notif.id)}
                timeAgo={timeAgo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifCard({
  notif, onRead, onDelete, timeAgo,
}: {
  notif: Notification;
  onRead: () => void;
  onDelete: () => void;
  timeAgo: (ts: string) => string;
}) {
  return (
    <div
      onClick={onRead}
      style={{
        background: notif.read ? G.white : `rgba(201,151,58,0.05)`,
        borderRadius: 14,
        border: `1px solid ${notif.read ? G.border : "rgba(201,151,58,0.25)"}`,
        padding: "13px 14px",
        display: "flex", alignItems: "flex-start", gap: 12,
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        boxShadow: notif.read ? "none" : "0 2px 10px rgba(201,151,58,0.1)",
        position: "relative",
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <span style={{
          position: "absolute", top: 14, right: 14,
          width: 8, height: 8, borderRadius: "50%",
          background: `linear-gradient(135deg, ${G.gold}, ${G.goldL})`,
          boxShadow: "0 0 6px rgba(201,151,58,0.6)",
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
        background: NOTIF_COLORS[notif.type] || "rgba(201,151,58,0.1)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>
        {NOTIF_ICONS[notif.type] || "🔔"}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: "0 0 3px",
          fontSize: 13, fontWeight: notif.read ? 500 : 700,
          color: G.text,
          paddingRight: 20,
        }}>{notif.title}</p>
        <p style={{
          margin: "0 0 5px", fontSize: 12, color: G.muted,
          lineHeight: 1.5,
          overflow: "hidden", textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as any}>{notif.body}</p>
        <span style={{ fontSize: 11, color: G.gold, fontWeight: 600 }}>{timeAgo(notif.createdAt)}</span>
      </div>

      {/* Delete */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        style={{
          background: "none", border: "none",
          color: "#CBD5E1", cursor: "pointer",
          fontSize: 16, padding: 4, marginLeft: 4, flexShrink: 0,
          borderRadius: "50%", transition: "color 0.15s",
          alignSelf: "center",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#EF4444")}
        onMouseLeave={e => (e.currentTarget.style.color = "#CBD5E1")}
        title="Dismiss"
      >✕</button>
    </div>
  );
}