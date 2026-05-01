import { TabName } from '../App';

interface Props {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const TABS: { id: TabName; label: string; icon: string }[] = [
  { id: 'home',    label: 'Home',    icon: '🏠' },
  { id: 'market',  label: 'Market',  icon: '🛒' },
  { id: 'explore', label: 'Explore', icon: '🔍' },
  { id: 'chat',    label: 'Chat',    icon: '💬' },
  { id: 'profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav({ activeTab, onTabChange }: Props) {
  return (
    <nav style={{
      display: 'flex',
      background: '#111118',
      borderTop: '1px solid #1E1E2E',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0 8px',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              gap: 3,
              position: 'relative',
            }}
          >
            {/* Active indicator */}
            {isActive && (
              <span style={{
                position: 'absolute',
                top: 0, left: '25%', right: '25%',
                height: 2,
                background: 'linear-gradient(90deg, #FF6B35, #F7931E)',
                borderRadius: '0 0 2px 2px',
              }} />
            )}
            <span style={{ fontSize: 20, lineHeight: 1 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: 0.5,
              color: isActive ? '#FF6B35' : '#555570',
              fontWeight: isActive ? 600 : 400,
              transition: 'color 0.2s',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}