import * as groupQueries from '../db/groupQueries.js';
import { findUserByEmail } from '../db/userQueries.js';
import { withTransaction } from '../config/db.js';
 
const notFound = (message) => {
  const err = new Error(message);
  err.status = 404;
  return err;
};
 
const forbidden = (message) => {
  const err = new Error(message);
  err.status = 403;
  return err;
};
 
export const createGroup = async ({ name, userId }) => {
  // Both writes must succeed together — otherwise a group could exist with
  // no members, which would make it invisible to its own creator (listGroupsForUser
  // only returns groups joined through group_members).
  return withTransaction(async (client) => {
    const group = await groupQueries.createGroup({ name, createdBy: userId }, client);
    // Creator is automatically a member of their own group.
    await groupQueries.addGroupMember(group.id, userId, client);
    return group;
  });
};
 
export const listGroupsForUser = async (userId) => {
  return groupQueries.getGroupsForUser(userId);
};
 
export const getGroupDetails = async ({ groupId, userId }) => {
  const group = await groupQueries.findGroupById(groupId);
  if (!group) throw notFound('Group not found');
 
  const isMember = await groupQueries.isGroupMember(groupId, userId);
  if (!isMember) throw forbidden('You are not a member of this group');
 
  const members = await groupQueries.getGroupMembers(groupId);
  return { ...group, members };
};
 
export const addMemberByEmail = async ({ groupId, requestingUserId, email }) => {
  const group = await groupQueries.findGroupById(groupId);
  if (!group) throw notFound('Group not found');
 
  const requesterIsMember = await groupQueries.isGroupMember(groupId, requestingUserId);
  if (!requesterIsMember) throw forbidden('You are not a member of this group');
 
  const userToAdd = await findUserByEmail(email);
  if (!userToAdd) {
    const err = new Error('No account found with that email — they need to sign up first');
    err.status = 404;
    throw err;
  }
 
  const alreadyMember = await groupQueries.isGroupMember(groupId, userToAdd.id);
  if (alreadyMember) {
    const err = new Error('That user is already a member of this group');
    err.status = 409;
    throw err;
  }
 
  await groupQueries.addGroupMember(groupId, userToAdd.id);
  return { id: userToAdd.id, name: userToAdd.name, email: userToAdd.email };
};
 