import { pool, query } from '../config/db.js';
 
// `db` defaults to the pool (unchanged behavior for existing callers) but can
// be given a transaction client instead, so this insert can be composed into
// a larger transaction (see groupService.createGroup).
export const createGroup = async ({ name, createdBy }, db = pool) => {
  const result = await db.query(
    `INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *`,
    [name, createdBy]
  );
  return result.rows[0];
};
 
export const findGroupById = async (groupId) => {
  const result = await query('SELECT * FROM groups WHERE id = $1', [groupId]);
  return result.rows[0] || null;
};
 
export const getGroupsForUser = async (userId) => {
  const result = await query(
    `SELECT g.*,
            (SELECT COUNT(*)::int FROM group_members gm2 WHERE gm2.group_id = g.id) AS member_count
     FROM groups g
     JOIN group_members gm ON gm.group_id = g.id
     WHERE gm.user_id = $1
     ORDER BY g.created_at DESC`,
    [userId]
  );
  return result.rows;
};
 
export const getGroupMembers = async (groupId) => {
  const result = await query(
    `SELECT u.id, u.name, u.email FROM users u
     JOIN group_members gm ON gm.user_id = u.id
     WHERE gm.group_id = $1`,
    [groupId]
  );
  return result.rows;
};
 
export const isGroupMember = async (groupId, userId) => {
  const result = await query(
    'SELECT 1 FROM group_members WHERE group_id = $1 AND user_id = $2',
    [groupId, userId]
  );
  return result.rows.length > 0;
};
 
export const addGroupMember = async (groupId, userId, db = pool) => {
  await db.query(
    'INSERT INTO group_members (group_id, user_id) VALUES ($1, $2)',
    [groupId, userId]
  );
};