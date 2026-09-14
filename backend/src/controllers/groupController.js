import * as groupService from '../services/groupService.js';
 
// Returns the parsed id as a positive integer, or null if req.params.id isn't
// one. Guards against passing non-numeric ids down to the DB layer, where an
// invalid type cast would otherwise surface as a raw Postgres error.
const parseGroupId = (rawId) => {
  if (!/^\d+$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
};
 
export const create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
 
    const group = await groupService.createGroup({ name, userId: req.user.id });
    res.status(201).json(group);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
 
export const list = async (req, res) => {
  try {
    const groups = await groupService.listGroupsForUser(req.user.id);
    res.json(groups);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
 
export const getDetails = async (req, res) => {
  const groupId = parseGroupId(req.params.id);
  if (groupId === null) {
    return res.status(400).json({ error: 'Invalid group id — must be a positive integer' });
  }
 
  try {
    const group = await groupService.getGroupDetails({
      groupId,
      userId: req.user.id,
    });
    res.json(group);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
 
export const addMember = async (req, res) => {
  const groupId = parseGroupId(req.params.id);
  if (groupId === null) {
    return res.status(400).json({ error: 'Invalid group id — must be a positive integer' });
  }
 
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'email is required' });
 
    const member = await groupService.addMemberByEmail({
      groupId,
      requestingUserId: req.user.id,
      email,
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};
 



