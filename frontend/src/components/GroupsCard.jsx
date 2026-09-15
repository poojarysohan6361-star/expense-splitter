import React from 'react';
import { Users, Plus, UserPlus } from 'lucide-react';

const GRADIENTS = [
  'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
  'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
  'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
];

export default function GroupsCard({
  groups = [],
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onAddMember,
  selectedGroupName,
  members = [],
  memberBalances = [],
  loading,
}) {
  return (
    <div style={styles.card}>
      <div style={styles.titleRow}>
        <h2 style={styles.title}>Groups</h2>
        <div style={styles.titleActions}>
          {onAddMember && selectedGroupId && (
            <button
              style={styles.iconActionBtn}
              onClick={onAddMember}
              title="Add member"
            >
              <UserPlus size={15} color="#A855F7" />
            </button>
          )}
          {onCreateGroup && (
            <button
              style={styles.iconActionBtn}
              onClick={onCreateGroup}
              title="Create group"
            >
              <Plus size={16} color="#A855F7" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={styles.empty}>Loading groups...</div>
      ) : groups.length === 0 ? (
        <div style={styles.empty}>No groups yet. Create one!</div>
      ) : (
        <div style={styles.list}>
          {groups.map((group, index) => {
            const isSelected = group.id === selectedGroupId;
            const bgGradient = GRADIENTS[index % GRADIENTS.length];

            return (
              <div
                key={group.id}
                style={{
                  ...styles.groupItem,
                  ...(isSelected ? styles.groupItemSelected : {}),
                }}
                onClick={() => onSelectGroup && onSelectGroup(group)}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{ ...styles.badge, background: bgGradient }}>
                  <Users size={18} color="#FFFFFF" strokeWidth={2.2} />
                </div>

                <div style={styles.groupInfo}>
                  <div style={styles.groupName}>{group.name}</div>
                  <div style={styles.membersCount}>
                    {group.membersCount || 0} members
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedGroupName && members && members.length > 0 && (
        <div style={styles.memberSection}>
          <div style={styles.memberTitle}>{selectedGroupName} — Members</div>
          <div style={styles.memberList}>
            {members.map((m) => {
              const mb = Array.isArray(memberBalances) ? memberBalances.find((b) => b.userId === m.id) : null;
              const net = mb ? parseFloat(mb.netAmount || 0) : null;
              const netColor = net !== null ? (net > 0 ? '#10B981' : net < 0 ? '#F43F5E' : '#8E9CAE') : '#8E9CAE';
              const netText = net !== null ? (net > 0 ? `+₹${net}` : net < 0 ? `-₹${Math.abs(net)}` : '₹0') : null;

              return (
                <div key={m.id} style={styles.memberChip}>
                  <span style={styles.memberInitial}>{m.name?.charAt(0)?.toUpperCase() || '?'}</span>
                  <span style={styles.memberName}>{m.name}</span>
                  {netText && (
                    <span style={{ fontSize: '11px', fontWeight: '700', color: netColor, marginLeft: '2px' }}>
                      {netText}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
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
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
    margin: 0,
  },
  titleActions: {
    display: 'flex',
    gap: '6px',
  },
  iconActionBtn: {
    width: '30px',
    height: '30px',
    borderRadius: '8px',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  empty: {
    color: '#717D96',
    fontSize: '13px',
    padding: '12px 0',
    textAlign: 'center',
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
  groupItemSelected: {
    borderColor: 'rgba(168, 85, 247, 0.6)',
    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(59, 130, 246, 0.05) 100%)',
    boxShadow: '0 0 15px rgba(168, 85, 247, 0.15)',
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
  memberSection: {
    marginTop: '16px',
    paddingTop: '14px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  memberTitle: {
    color: '#8E9CAE',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '10px',
  },
  memberList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  memberChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '8px',
    padding: '5px 10px',
  },
  memberInitial: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  memberName: {
    color: '#D1D5DB',
    fontSize: '12.5px',
    fontWeight: '500',
  },
};
