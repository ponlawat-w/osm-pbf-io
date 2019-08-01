const protobuf = require('protobufjs');
const encodeRawBlob = require('./encoder/raw-blob');
const root = protobuf.loadSync(__dirname + '/protos/osm-format.proto');
const message = root.lookupType('HeaderBlock');

module.exports = (compress = true, dense = true) => {
  const rawBlob = message.encode({
    requiredFeatures: [
      'OsmSchema-V0.6',
      ...(dense ? ['DenseNodes'] : [])
    ]
  }).finish();

  return encodeRawBlob(rawBlob, compress);
};
