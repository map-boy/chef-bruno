import { TabName } from '../App';
import { User as FirebaseUser } from 'firebase/auth';

interface Props {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  firebaseUser: FirebaseUser | null;
}

const G = {
  gold:   "#C9973A",
  goldL:  "#E8BB6A",
  white:  "#FFFFFF",
  border: "#E2D9C8",
  muted:  "#A89880",
  bg:     "#FDFAF5",
};

const TABS: { id: TabName; label: string; icon: (active: boolean) => string }[] = [
  {
    id: "home",
    label: "Home",
    icon: (a) => a
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 12L12 3l9 9M5 10v10h5v-6h4v6h5V10"/></svg>`,
  },
  {
    id: "reels",
    label: "Reels",
    icon: (a) => a
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><polygon points="10,8 16,12 10,16"/></svg>`,
  },
  {
    id: "market",
    label: "Market",
    icon: (a) => a
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.83 6H19l-1.68 8.39c-.16.8-.87 1.36-1.68 1.36H8.55c-.82 0-1.53-.57-1.69-1.38L5.83 6zM4.5 3H2V1H0v2h2l3.6 7.59-1.35 2.44C3.52 13.37 4.48 15 6 15h14v-2H6.42c-.14 0-.25-.11-.25-.25l.03-.12L7.1 11h9.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0020.96 2H5.21l-.71-1.5z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
  },
  {
    id: "chat",
    label: "Chat",
    icon: (a) => a
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  },
  {
    id: "notifications",
    label: "Alerts",
    icon: (a) => a
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  },
  {
    id: "profile",
    label: "Profile",
    icon: (a) => a
      ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  },
];

export default function BottomNav({ activeTab, onTabChange, firebaseUser }: Props) {
  return (
    <nav style={{
      display: "flex",
      background: G.white,
      borderTop: `1px solid ${G.border}`,
      paddingBottom: "env(safe-area-inset-bottom)",
      boxShadow: "0 -2px 16px rgba(0,0,0,0.07)",
      position: "relative",
      zIndex: 50,
    }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 0 8px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              gap: 3,
              position: "relative",
              transition: "opacity 0.15s",
            }}
          >
            {/* Gold top line indicator */}
            <span style={{
              position: "absolute",
              top: 0, left: "20%", right: "20%",
              height: isActive ? 2.5 : 0,
              background: `linear-gradient(90deg, ${G.gold}, ${G.goldL})`,
              borderRadius: "0 0 3px 3px",
              transition: "height 0.2s cubic-bezier(.22,1,.36,1)",
            }} />

            {/* Icon */}
            <span
              style={{
                width: 24, height: 24,
                color: isActive ? G.gold : G.muted,
                transition: "color 0.18s, transform 0.18s",
                transform: isActive ? "scale(1.12)" : "scale(1)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              dangerouslySetInnerHTML={{ __html: tab.icon(isActive) }}
            />

            {/* Label */}
            <span style={{
              fontSize: 10,
              letterSpacing: 0.3,
              color: isActive ? G.gold : G.muted,
              fontWeight: isActive ? 700 : 400,
              transition: "color 0.18s",
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {tab.label}
            </span>

            {/* Notification dot for chat/alerts */}
            {(tab.id === "chat" || tab.id === "notifications") && !isActive && (
              <span style={{
                position: "absolute",
                top: 7, right: "calc(50% - 16px)",
                width: 7, height: 7,
                borderRadius: "50%",
                background: G.gold,
                border: `1.5px solid ${G.white}`,
              }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}