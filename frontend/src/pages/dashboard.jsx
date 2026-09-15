import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Users, Receipt, ArrowDown, ArrowUp, LogOut, Check, Calendar, ShieldCheck, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import TotalBalanceCard from '../components/TotalBalanceCard';
import RecentExpenses from '../components/RecentExpenses';
import GroupsCard from '../components/GroupsCard';
import RecentActivity from '../components/RecentActivity';
import AddExpenseModal from '../components/AddExpenseModal';
import CreateGroupModal from '../components/CreateGroupModal';
import AddMemberModal from '../components/AddMemberModal';
import { groupsAPI, expensesAPI, authAPI } from '../api/api';
import { formatINR, formatRelativeTime } from '../utils/format';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = authAPI.getCurrentUser();
  const userName = currentUser?.name || 'User';

  const [activeNav, setActiveNav] = useState('Overview');
  const [toastMessage, setToastMessage] = useState('');

  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupDetails, setSelectedGroupDetails] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState(null);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const loadGroups = useCallback(async () => {
    try {
      setLoadingGroups(true);
      const data = await groupsAPI.list();
      const list = Array.isArray(data) ? data : [];
      setGroups(list);
      setSelectedGroupId((prev) => {
        if (prev && list.some((g) => g.id === prev)) return prev;
        return list.length > 0 ? list[0].id : null;
      });
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const loadGroupData = useCallback(async (groupId) => {
    if (!groupId) return;
    try {
      setLoadingExpenses(true);
      const [expData, balData] = await Promise.all([
        expensesAPI.list(groupId),
        groupsAPI.getBalances(groupId),
      ]);
      setExpenses(Array.isArray(expData) ? expData : []);
      setBalances(balData);
    } catch (err) {
      console.error('Failed to load group data:', err);
      showToast('Failed to load group data');
    } finally {
      setLoadingExpenses(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupData(selectedGroupId);
      groupsAPI.getDetails(selectedGroupId).then(setSelectedGroupDetails).catch(() => {});
    } else {
      setExpenses([]);
      setBalances(null);
      setSelectedGroupDetails(null);
    }
  }, [selectedGroupId, loadGroupData]);

  const handleGroupSelect = (group) => {
    setSelectedGroupId(group.id);
  };

  const handleCreateGroup = async (name) => {
    const group = await groupsAPI.create({ name });
    showToast(`Group "${name}" created!`);
    await loadGroups();
    setSelectedGroupId(group.id);
  };

  const handleAddMember = async (email) => {
    if (!selectedGroupId) {
      showToast('Select a group first');
      return;
    }
    await groupsAPI.addMember(selectedGroupId, email);
    showToast(`Member added!`);
    const [details, balData] = await Promise.all([
      groupsAPI.getDetails(selectedGroupId),
      groupsAPI.getBalances(selectedGroupId),
    ]);
    setSelectedGroupDetails(details);
    setBalances(balData);
    await loadGroups();
  };

  const handleAddExpense = async (expenseData) => {
    const targetGroupId = expenseData.groupId || selectedGroupId;
    if (!targetGroupId) {
      showToast('Please select a group first');
      return;
    }

    await expensesAPI.create(targetGroupId, {
      description: expenseData.description,
      amount: expenseData.amount,
      paidBy: expenseData.paidBy || currentUser?.id,
      splitType: expenseData.splitType || 'equal',
      participants: expenseData.participants,
    });

    showToast(`Expense "${expenseData.description}" saved!`);
    if (targetGroupId === selectedGroupId) {
      await loadGroupData(targetGroupId);
    } else {
      setSelectedGroupId(targetGroupId);
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '₹0';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return formatINR(num);
  };

  const totalBalanceVal = balances ? parseFloat(balances.netAmount || 0) : 0;
  const youOweVal = balances ? parseFloat(balances.youOwe || 0) : 0;
  const owedToYouVal = balances ? parseFloat(balances.owedToYou || 0) : 0;
  const groupExpensesVal = balances ? parseFloat(balances.groupExpenses || 0) : 0;

  const displayExpenses = expenses.map((e) => ({
    id: e.id,
    title: e.description,
    date: formatRelativeTime(e.createdAt),
    amount: formatCurrency(e.amount),
    paidByName: e.paidByName,
    splitType: e.splitType,
    participants: e.participants || [],
  }));

  const groupCards = groups.map((g) => ({
    id: g.id,
    name: g.name,
    membersCount: g.member_count,
    isSelected: g.id === selectedGroupId,
  }));

  const selectedGroupName =
    selectedGroupDetails?.name || groups.find((g) => g.id === selectedGroupId)?.name || '';

  // Generate real activities from expense records
  const activities = expenses.map((e) => {
    const isPayer = e.paidBy === currentUser?.id;
    return {
      id: e.id,
      title: isPayer
        ? `You paid ₹${e.amount} for ${e.description}`
        : `${e.paidByName || 'Member'} paid ₹${e.amount} for ${e.description}`,
      isOutgoing: isPayer,
      time: formatRelativeTime(e.createdAt),
      type: isPayer ? 'paid' : 'owed',
    };
  });

  return (
    <div style={styles.layout}>
      {toastMessage && (
        <div style={styles.toast}>
          <span>{toastMessage}</span>
        </div>
      )}

      <Sidebar
        activeNav={activeNav}
        onNavSelect={setActiveNav}
        userName={userName}
        onLogout={handleLogout}
      />

      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          {/* OVERVIEW TAB */}
          {activeNav === 'Overview' && (
            <>
              <Header
                userName={userName}
                onAddExpense={() => {
                  if (groups.length === 0) {
                    showToast('Create a group first');
                    setIsCreateGroupModalOpen(true);
                    return;
                  }
                  setIsExpenseModalOpen(true);
                }}
              />

              <TotalBalanceCard
                totalBalance={selectedGroupId ? formatCurrency(totalBalanceVal) : '₹0'}
                youOwe={selectedGroupId ? formatCurrency(youOweVal) : '₹0'}
                owedToYou={selectedGroupId ? formatCurrency(owedToYouVal) : '₹0'}
                groupExpenses={selectedGroupId ? formatCurrency(groupExpensesVal) : '₹0'}
              />

              <div style={styles.columnsGrid}>
                <div style={styles.leftColumn}>
                  <RecentExpenses
                    expenses={displayExpenses}
                    loading={loadingExpenses}
                    emptyMessage={
                      selectedGroupId
                        ? 'No expenses yet in this group. Click "+ Add Expense" to create one!'
                        : 'Select or create a group to view expenses'
                    }
                    onViewAll={() => setActiveNav('Expenses')}
                  />
                </div>

                <div style={styles.rightColumn}>
                  <GroupsCard
                    groups={groupCards}
                    loading={loadingGroups}
                    selectedGroupId={selectedGroupId}
                    onSelectGroup={handleGroupSelect}
                    onCreateGroup={() => setIsCreateGroupModalOpen(true)}
                    onAddMember={() => {
                      if (!selectedGroupId) {
                        showToast('Select a group first');
                        return;
                      }
                      setIsAddMemberModalOpen(true);
                    }}
                    selectedGroupName={selectedGroupName}
                    members={selectedGroupDetails?.members}
                    memberBalances={balances?.members}
                  />
                  <RecentActivity activities={activities} />
                </div>
              </div>
            </>
          )}

          {/* GROUPS TAB */}
          {activeNav === 'Groups' && (
            <div style={styles.sectionView}>
              <div style={styles.sectionHeader}>
                <div>
                  <h1 style={styles.sectionTitle}>Groups</h1>
                  <p style={styles.sectionSubtitle}>Manage your groups, members, and settlement balances</p>
                </div>
                <div style={styles.headerBtnRow}>
                  {selectedGroupId && (
                    <button
                      style={styles.secondaryBtn}
                      onClick={() => setIsAddMemberModalOpen(true)}
                    >
                      <UserPlus size={16} color="#A855F7" />
                      <span>Add Member</span>
                    </button>
                  )}
                  <button
                    style={styles.primaryBtn}
                    onClick={() => setIsCreateGroupModalOpen(true)}
                  >
                    <Plus size={16} strokeWidth={2.6} color="#FFFFFF" />
                    <span>Create Group</span>
                  </button>
                </div>
              </div>

              {loadingGroups ? (
                <div style={styles.emptyStateCard}>Loading groups...</div>
              ) : groups.length === 0 ? (
                <div style={styles.emptyStateCard}>
                  <Users size={36} color="#7C3AED" style={{ marginBottom: '12px' }} />
                  <div style={styles.emptyStateTitle}>No groups yet</div>
                  <div style={styles.emptyStateDesc}>Create your first group to start splitting expenses with friends.</div>
                  <button
                    style={{ ...styles.primaryBtn, marginTop: '16px' }}
                    onClick={() => setIsCreateGroupModalOpen(true)}
                  >
                    <Plus size={16} strokeWidth={2.6} color="#FFFFFF" />
                    <span>Create Group</span>
                  </button>
                </div>
              ) : (
                <div style={styles.groupsViewGrid}>
                  {/* Left: Group Cards List */}
                  <div style={styles.groupsListCol}>
                    <div style={styles.cardSubHeader}>Your Groups ({groups.length})</div>
                    <div style={styles.groupCardList}>
                      {groups.map((g) => {
                        const isSel = g.id === selectedGroupId;
                        return (
                          <div
                            key={g.id}
                            style={{
                              ...styles.groupCardItem,
                              ...(isSel ? styles.groupCardItemSelected : {}),
                            }}
                            onClick={() => setSelectedGroupId(g.id)}
                          >
                            <div style={styles.groupCardItemHeader}>
                              <span style={styles.groupCardName}>{g.name}</span>
                              <span style={styles.badgeCount}>{g.member_count || 1} members</span>
                            </div>
                            <div style={styles.groupCardDate}>
                              Created {formatRelativeTime(g.created_at)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Selected Group Full Details */}
                  <div style={styles.groupDetailsCol}>
                    {selectedGroupDetails ? (
                      <div style={styles.groupDetailCard}>
                        <div style={styles.groupDetailTop}>
                          <div>
                            <h2 style={styles.groupDetailTitle}>{selectedGroupDetails.name}</h2>
                            <div style={styles.groupDetailMeta}>
                              Created {formatRelativeTime(selectedGroupDetails.created_at)}
                            </div>
                          </div>
                          <button
                            style={styles.secondaryBtn}
                            onClick={() => setIsAddMemberModalOpen(true)}
                          >
                            <UserPlus size={15} color="#A855F7" />
                            <span>Add Member</span>
                          </button>
                        </div>

                        {/* Balance Summary for group */}
                        {balances && (
                          <div style={styles.groupMetricsGrid}>
                            <div style={styles.metricMini}>
                              <span style={styles.metricMiniLabel}>Total Expenses</span>
                              <span style={styles.metricMiniValue}>
                                {formatCurrency(balances.groupExpenses)}
                              </span>
                            </div>
                            <div style={styles.metricMini}>
                              <span style={styles.metricMiniLabel}>Your Balance</span>
                              <span
                                style={{
                                  ...styles.metricMiniValue,
                                  color:
                                    parseFloat(balances.netAmount) > 0
                                      ? '#10B981'
                                      : parseFloat(balances.netAmount) < 0
                                      ? '#F43F5E'
                                      : '#FFFFFF',
                                }}
                              >
                                {formatCurrency(balances.netAmount)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Members Breakdown Table */}
                        <div style={{ marginTop: '20px' }}>
                          <div style={styles.cardSubHeader}>Group Members & Net Balances</div>
                          <div style={styles.memberTable}>
                            <div style={styles.memberTableHeader}>
                              <span style={{ flex: 1.5 }}>Member</span>
                              <span style={{ flex: 1, textAlign: 'right' }}>Paid</span>
                              <span style={{ flex: 1, textAlign: 'right' }}>Share</span>
                              <span style={{ flex: 1, textAlign: 'right' }}>Net</span>
                            </div>
                            {(selectedGroupDetails.members || []).map((m) => {
                              const mb = balances?.members?.find((b) => b.userId === m.id);
                              const net = mb ? parseFloat(mb.netAmount || 0) : 0;
                              const netColor = net > 0 ? '#10B981' : net < 0 ? '#F43F5E' : '#8E9CAE';
                              const netStr = net > 0 ? `+₹${net.toFixed(2)}` : net < 0 ? `-₹${Math.abs(net).toFixed(2)}` : '₹0.00';

                              return (
                                <div key={m.id} style={styles.memberTableRow}>
                                  <div style={{ flex: 1.5, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={styles.memberAvatarSmall}>
                                      {m.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                    <div>
                                      <div style={styles.tableMemberName}>
                                        {m.name} {m.id === currentUser?.id ? '(You)' : ''}
                                      </div>
                                      <div style={styles.tableMemberEmail}>{m.email}</div>
                                    </div>
                                  </div>
                                  <div style={{ flex: 1, textAlign: 'right', color: '#FFFFFF', fontSize: '13.5px' }}>
                                    ₹{mb ? parseFloat(mb.paidTotal || 0).toFixed(2) : '0.00'}
                                  </div>
                                  <div style={{ flex: 1, textAlign: 'right', color: '#8E9CAE', fontSize: '13.5px' }}>
                                    ₹{mb ? parseFloat(mb.shareTotal || 0).toFixed(2) : '0.00'}
                                  </div>
                                  <div style={{ flex: 1, textAlign: 'right', fontWeight: '700', fontSize: '14px', color: netColor }}>
                                    {netStr}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.emptyStateCard}>Select a group to see its members and balances</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* EXPENSES TAB */}
          {activeNav === 'Expenses' && (
            <div style={styles.sectionView}>
              <div style={styles.sectionHeader}>
                <div>
                  <h1 style={styles.sectionTitle}>Expenses</h1>
                  <p style={styles.sectionSubtitle}>
                    {selectedGroupName ? `Viewing expenses for "${selectedGroupName}"` : 'Select a group to manage expenses'}
                  </p>
                </div>
                <div style={styles.headerBtnRow}>
                  {groups.length > 1 && (
                    <select
                      value={selectedGroupId || ''}
                      onChange={(e) => setSelectedGroupId(Number(e.target.value))}
                      style={styles.groupFilterSelect}
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    style={styles.primaryBtn}
                    onClick={() => {
                      if (groups.length === 0) {
                        showToast('Create a group first');
                        setIsCreateGroupModalOpen(true);
                        return;
                      }
                      setIsExpenseModalOpen(true);
                    }}
                  >
                    <Plus size={16} strokeWidth={2.6} color="#FFFFFF" />
                    <span>Add Expense</span>
                  </button>
                </div>
              </div>

              {loadingExpenses ? (
                <div style={styles.emptyStateCard}>Loading expenses...</div>
              ) : expenses.length === 0 ? (
                <div style={styles.emptyStateCard}>
                  <Receipt size={36} color="#7C3AED" style={{ marginBottom: '12px' }} />
                  <div style={styles.emptyStateTitle}>No expenses found</div>
                  <div style={styles.emptyStateDesc}>
                    {selectedGroupId
                      ? `There are no expenses in "${selectedGroupName}" yet.`
                      : 'Select or create a group to start adding expenses.'}
                  </div>
                  {selectedGroupId && (
                    <button
                      style={{ ...styles.primaryBtn, marginTop: '16px' }}
                      onClick={() => setIsExpenseModalOpen(true)}
                    >
                      <Plus size={16} strokeWidth={2.6} color="#FFFFFF" />
                      <span>Add First Expense</span>
                    </button>
                  )}
                </div>
              ) : (
                <div style={styles.expensesListContainer}>
                  {expenses.map((exp) => (
                    <div key={exp.id} style={styles.expenseFullCard}>
                      <div style={styles.expenseFullTop}>
                        <div style={styles.expenseFullMain}>
                          <div style={styles.expenseFullTitle}>{exp.description}</div>
                          <div style={styles.expenseFullMeta}>
                            <span>Paid by <strong style={{ color: '#FFFFFF' }}>{exp.paidByName}</strong></span>
                            <span>•</span>
                            <span>{formatRelativeTime(exp.createdAt)}</span>
                            <span>•</span>
                            <span style={styles.splitTypeBadge}>{exp.splitType} split</span>
                          </div>
                        </div>
                        <div style={styles.expenseFullAmount}>{formatCurrency(exp.amount)}</div>
                      </div>

                      {/* Participant Shares Breakdown */}
                      {exp.participants && exp.participants.length > 0 && (
                        <div style={styles.expenseParticipantsGrid}>
                          <div style={styles.splitParticipantsLabel}>Split between:</div>
                          <div style={styles.splitChipsRow}>
                            {exp.participants.map((p) => (
                              <div key={p.userId} style={styles.splitChip}>
                                <span style={styles.splitChipName}>{p.name}</span>
                                <span style={styles.splitChipShare}>
                                  ₹{parseFloat(p.shareAmount || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ACTIVITY TAB */}
          {activeNav === 'Activity' && (
            <div style={styles.sectionView}>
              <div style={styles.sectionHeader}>
                <div>
                  <h1 style={styles.sectionTitle}>Activity Log</h1>
                  <p style={styles.sectionSubtitle}>Chronological record of expenses and payments in your active group</p>
                </div>
              </div>

              {activities.length === 0 ? (
                <div style={styles.emptyStateCard}>
                  <div style={styles.emptyStateTitle}>No recent activity</div>
                  <div style={styles.emptyStateDesc}>
                    Activity will appear here once expenses are recorded in your groups.
                  </div>
                </div>
              ) : (
                <div style={styles.activityListContainer}>
                  {activities.map((act) => (
                    <div key={act.id} style={styles.activityCardItem}>
                      <div
                        style={{
                          ...styles.actIconBadge,
                          backgroundColor: act.isOutgoing ? '#EF4444' : '#10B981',
                        }}
                      >
                        {act.isOutgoing ? (
                          <ArrowDown size={18} color="#FFFFFF" strokeWidth={2.4} />
                        ) : (
                          <ArrowUp size={18} color="#FFFFFF" strokeWidth={2.4} />
                        )}
                      </div>
                      <div style={styles.actInfoCol}>
                        <div style={styles.actTitleText}>{act.title}</div>
                        <div style={styles.actTimeText}>{act.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeNav === 'Settings' && (
            <div style={styles.sectionView}>
              <div style={styles.sectionHeader}>
                <div>
                  <h1 style={styles.sectionTitle}>Account & Settings</h1>
                  <p style={styles.sectionSubtitle}>Manage your profile details and session</p>
                </div>
              </div>

              <div style={styles.settingsCard}>
                <div style={styles.settingsAvatarRow}>
                  <div style={styles.profileAvatarLarge}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={styles.profileLargeName}>{userName}</h2>
                    <div style={styles.profileLargeEmail}>{currentUser?.email || 'Registered User'}</div>
                  </div>
                </div>

                <div style={styles.settingsDetailsGrid}>
                  <div style={styles.settingsField}>
                    <span style={styles.settingsLabel}>Full Name</span>
                    <span style={styles.settingsValue}>{userName}</span>
                  </div>
                  <div style={styles.settingsField}>
                    <span style={styles.settingsLabel}>Email Address</span>
                    <span style={styles.settingsValue}>{currentUser?.email || '—'}</span>
                  </div>
                  <div style={styles.settingsField}>
                    <span style={styles.settingsLabel}>User ID</span>
                    <span style={styles.settingsValue}>#{currentUser?.id || '—'}</span>
                  </div>
                  <div style={styles.settingsField}>
                    <span style={styles.settingsLabel}>Account Status</span>
                    <span style={{ ...styles.settingsValue, color: '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} /> Verified Active
                    </span>
                  </div>
                </div>

                <div style={styles.settingsDangerZone}>
                  <div>
                    <div style={styles.dangerTitle}>Sign Out</div>
                    <div style={styles.dangerDesc}>End your current session on this device</div>
                  </div>
                  <button
                    style={styles.logoutActionBtn}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        groups={groups}
        selectedGroupId={selectedGroupId}
        currentUserId={currentUser?.id}
        onAddExpenseSuccess={handleAddExpense}
      />

      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreate={handleCreateGroup}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onAdd={handleAddMember}
        groupName={selectedGroupName}
      />
    </div>
  );
}

const styles = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#080B14',
    width: '100%',
    position: 'relative',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#080B14',
    padding: '32px 36px 48px 36px',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'center',
  },
  contentContainer: {
    width: '100%',
    maxWidth: '1180px',
    display: 'flex',
    flexDirection: 'column',
  },
  columnsGrid: {
    display: 'grid',
    gridTemplateColumns: '1.25fr 0.85fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '24px',
    backgroundColor: '#1E1736',
    border: '1px solid #7C3AED',
    color: '#FFFFFF',
    padding: '12px 20px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(124, 58, 237, 0.3)',
    fontSize: '13.5px',
    fontWeight: '600',
    zIndex: 2000,
    animation: 'fadeIn 0.2s ease',
  },
  sectionView: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    animation: 'fadeIn 0.2s ease',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: '25px',
    fontWeight: '700',
    letterSpacing: '-0.4px',
    margin: '0 0 4px 0',
  },
  sectionSubtitle: {
    color: '#8E9CAE',
    fontSize: '13.5px',
    margin: 0,
  },
  headerBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    color: '#FFFFFF',
    padding: '10px 20px',
    borderRadius: '11px',
    fontSize: '13.5px',
    fontWeight: '600',
    boxShadow: '0 4px 18px rgba(124, 58, 237, 0.45)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#151B32',
    color: '#FFFFFF',
    padding: '10px 18px',
    borderRadius: '11px',
    fontSize: '13.5px',
    fontWeight: '600',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyStateCard: {
    backgroundColor: '#11162A',
    borderRadius: '18px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '48px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: '#8E9CAE',
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  emptyStateDesc: {
    fontSize: '13.5px',
    color: '#717D96',
    maxWidth: '380px',
  },
  groupsViewGrid: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  groupsListCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardSubHeader: {
    color: '#8E9CAE',
    fontSize: '12.5px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  groupCardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  groupCardItem: {
    backgroundColor: '#11162A',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '14px',
    padding: '16px 18px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  groupCardItemSelected: {
    borderColor: 'rgba(168, 85, 247, 0.6)',
    backgroundColor: '#151B32',
    boxShadow: '0 0 20px rgba(124, 58, 237, 0.15)',
  },
  groupCardItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  groupCardName: {
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '600',
  },
  badgeCount: {
    fontSize: '12px',
    color: '#A855F7',
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    padding: '3px 8px',
    borderRadius: '6px',
    fontWeight: '600',
  },
  groupCardDate: {
    color: '#717D96',
    fontSize: '12px',
  },
  groupDetailsCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  groupDetailCard: {
    backgroundColor: '#11162A',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '18px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
  },
  groupDetailTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  groupDetailTitle: {
    color: '#FFFFFF',
    fontSize: '22px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  groupDetailMeta: {
    color: '#717D96',
    fontSize: '13px',
  },
  groupMetricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '8px',
  },
  metricMini: {
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '12px',
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  metricMiniLabel: {
    color: '#7C89A0',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricMiniValue: {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: '700',
  },
  memberTable: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '10px',
    backgroundColor: '#151B32',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  memberTableHeader: {
    display: 'flex',
    padding: '12px 16px',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    color: '#8E9CAE',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  memberTableRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  memberAvatarSmall: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#7C3AED',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    flexShrink: 0,
  },
  tableMemberName: {
    color: '#FFFFFF',
    fontSize: '13.5px',
    fontWeight: '600',
  },
  tableMemberEmail: {
    color: '#717D96',
    fontSize: '11.5px',
  },
  groupFilterSelect: {
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    color: '#FFFFFF',
    padding: '10px 14px',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  },
  expensesListContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  expenseFullCard: {
    backgroundColor: '#11162A',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    transition: 'all 0.2s ease',
  },
  expenseFullTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseFullMain: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  expenseFullTitle: {
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '600',
  },
  expenseFullMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#717D96',
    fontSize: '12.5px',
  },
  splitTypeBadge: {
    backgroundColor: 'rgba(168, 85, 247, 0.12)',
    color: '#C084FC',
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  expenseFullAmount: {
    color: '#FFFFFF',
    fontSize: '19px',
    fontWeight: '700',
  },
  expenseParticipantsGrid: {
    borderTop: '1px solid rgba(255, 255, 255, 0.04)',
    paddingTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  splitParticipantsLabel: {
    color: '#8E9CAE',
    fontSize: '12px',
    fontWeight: '500',
  },
  splitChipsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  splitChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '8px',
    padding: '4px 10px',
    fontSize: '12px',
  },
  splitChipName: {
    color: '#D1D5DB',
  },
  splitChipShare: {
    color: '#A855F7',
    fontWeight: '600',
  },
  activityListContainer: {
    backgroundColor: '#11162A',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '18px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  activityCardItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 14px',
    borderRadius: '12px',
    backgroundColor: '#151B32',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  actIconBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actInfoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  actTitleText: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
  },
  actTimeText: {
    color: '#717D96',
    fontSize: '12px',
  },
  settingsCard: {
    backgroundColor: '#11162A',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '18px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    maxWidth: '680px',
  },
  settingsAvatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  profileAvatarLarge: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
    color: '#FFFFFF',
    fontSize: '26px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 16px rgba(124, 58, 237, 0.35)',
  },
  profileLargeName: {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  profileLargeEmail: {
    color: '#8E9CAE',
    fontSize: '13.5px',
  },
  settingsDetailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    backgroundColor: '#151B32',
    padding: '20px',
    borderRadius: '14px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  settingsField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  settingsLabel: {
    color: '#7C89A0',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  settingsValue: {
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '500',
  },
  settingsDangerZone: {
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    paddingTop: '24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dangerTitle: {
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: '600',
  },
  dangerDesc: {
    color: '#717D96',
    fontSize: '12.5px',
    marginTop: '2px',
  },
  logoutActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#F87171',
    padding: '10px 18px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
