const type = require('./../osm-object-type').relation;

module.exports = (id, members, data = {}) => ({
  id: parseInt(id),
  members: members.map(member => ({...member, id: parseInt(member.id), type: parseInt(member.type)})),
  type: parseInt(type),
  ...data
});
