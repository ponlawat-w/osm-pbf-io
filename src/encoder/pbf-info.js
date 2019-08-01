const encodeTimestamp = require('./timestamp');

module.exports = (geo, settings, stringTable) => {
  const pbfInfoObj = {};

  if (geo.version) {
    pbfInfoObj.version = geo.version;
  }
  if (geo.timestamp) {
    pbfInfoObj.timestamp = encodeTimestamp(geo.timestamp, settings.dateGranularity);
  }
  if (geo.changeSet) {
    pbfInfoObj.changeset = geo.changeSet;
  }
  if (geo.uid) {
    pbfInfoObj.uid = geo.uid;
  }
  if (geo.username) {
    pbfInfoObj.userSid = stringTable.add(geo.username);
  }

  return pbfInfoObj;
};
