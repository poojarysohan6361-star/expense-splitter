import React from 'react';
import { MapPin, Users, Briefcase } from 'lucide-react';

export default function GroupsCard({ groups, onSelectGroup }) {
  const defaultGroups = [
    {
      id: 1,
      name: 'Goa Trip',
      membersCount: 4,
      amount: '₹1,200',
      icon: MapPin,
      badgeBg: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
    },
    {
      id: 2,
      name: 'Roommates',
      membersCount: 3,
      amount: '₹860',
      icon: Users,
      badgeBg: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
    },
    {
      id: 3,
      name: 'College Project',
      membersCount: 5,
      amount: '₹1,000',
      icon: Briefcase,
      badgeBg: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
    },
  ];

  const items = groups && groups.length > 0 ? groups : defaultGroups;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Groups</h2>

      <div style={styles.list}>
        {items.map((group, index) => {
          const IconComp = group.icon || Users;
          const bgGradient =
            group.badgeBg ||
            (index % 3 === 0
              ? 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)'
              : index % 3 === 1
              ? 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)'
              : 'linear-gradient(135deg, #059669 0%, #10B981 100%)');

          return (
            <div
              key={group.id || index}
              style={styles.groupItem}
              onClick={() => onSelectGroup && onSelectGroup(group)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Group Badge */}
              <div style={{ ...styles.badge, background: bgGradient }}>
                <IconComp size={18} color="#FFFFFF" strokeWidth={2.2} />
              </div>

              {/* Group Name & Members */}
              <div style={styles.groupInfo}>
                <div style={styles.groupName}>{group.name}</div>
                <div style={styles.membersCount}>
                  {group.membersCount || (group.members ? group.members.length : 3)} members
                </div>
              </div>

              {/* Group Total/Balance */}
              <div style={styles.amount}>{group.amount || '₹0'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#11162A',
    borderRadius: '18px',
    padding: '22px 24px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
    boxSizing: 'border-box',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
    marginBottom: '16px',
    marginTop: 0,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  groupItem: {
    backgroundColor: '#151B32',
    borderRadius: '12px',
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  badge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '14px',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  },
  groupInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  groupName: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    lineHeight: 1.2,
  },
  membersCount: {
    color: '#717D96',
    fontSize: '12px',
    marginTop: '3px',
  },
  amount: {
    color: '#FFFFFF',
    fontSize: '14.5px',
    fontWeight: '700',
  },
};
