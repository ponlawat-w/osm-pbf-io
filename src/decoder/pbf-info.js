const decodeTimestamp = require('./timestamp');

module.exports = (pbfInfoObj, settings) => {
  if (pbfInfoObj) {
    return {
      version: pbfInfoObj.version,
      timestamp: decodeTimestamp(pbfInfoObj.timestamp, settings.dateGranularity),
      changeSet: pbfInfoObj.changeset,
      uid: pbfInfoObj.uid,
      username: settings.stringTable.s[pbfInfoObj.userSid]
    };
  }

  return {};
};
