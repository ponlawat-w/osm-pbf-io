const encodeTags = require('./pbf-tags');
const encodeInfo = require('./pbf-info');

module.exports = (relations, settings, stringTable) => relations.map(relation => {
  const encodedTags = encodeTags(relation.tags, stringTable);

  const rolesSids = [];
  const memids = [];
  const types = [];

  let prevMemId = 0;

  for (let m = 0; m < relation.members.length; m++) {
    const member = relation.members[m];

    rolesSid = stringTable.add(member.role);
    memid = member.id - prevMemId;
    type = member.type;

    rolesSids.push(rolesSid);
    memids.push(memid);
    types.push(type);

    prevMemId = member.id;
  }

  return {
    id: relation.id,
    keys: encodedTags.keys,
    vals: encodedTags.vals,
    info: encodeInfo(relation, settings, stringTable),
    rolesSid: rolesSids,
    memids: memids,
    types: types
  };
});
