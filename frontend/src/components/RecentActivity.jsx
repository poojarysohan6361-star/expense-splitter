import React from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function RecentActivity({ activities = [] }) {
  const items = activities || [];

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Recent Activity</h2>

      {items.length === 0 ? (
        <div style={styles.empty}>No activity yet</div>
      ) : (
        <div style={styles.list}>
          {items.map((item, index) => {
            const isOutgoing = item.isOutgoing !== undefined ? item.isOutgoing : item.type === 'paid';

            return (
              <div key={item.id || index} style={styles.activityItem}>
                <div
                  style={{
                    ...styles.iconCircle,
                    backgroundColor: isOutgoing ? '#EF4444' : '#10B981',
                  }}
                >
                  {isOutgoing ? (
                    <ArrowDown size={17} color="#FFFFFF" strokeWidth={2.4} />
                  ) : (
                    <ArrowUp size={17} color="#FFFFFF" strokeWidth={2.4} />
                  )}
                </div>

                <div style={styles.info}>
                  <div style={styles.activityTitle}>{item.title}</div>
                  <div style={styles.activityTime}>{item.time || item.createdAt}</div>
                </div>
              </div>
            );
          })}
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
  title: {
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '700',
    letterSpacing: '-0.2px',
    marginBottom: '16px',
    marginTop: 0,
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
    gap: '16px',
  },
  activityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  iconCircle: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
  },
  activityTitle: {
    color: '#FFFFFF',
    fontSize: '13.5px',
    fontWeight: '600',
    lineHeight: 1.2,
  },
  activityTime: {
    color: '#717D96',
    fontSize: '11.5px',
    marginTop: '3px',
  },
};