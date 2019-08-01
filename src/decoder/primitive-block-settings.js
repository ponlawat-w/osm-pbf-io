module.exports = (primitiveBlock, withInfos = true) => ({
  granularity: primitiveBlock.granularity,
  latOffset: primitiveBlock.latOffset,
  lngOffset: primitiveBlock.lonOffset,
  dateGranularity: primitiveBlock.dateGranularity,
  stringTable: {s: primitiveBlock.stringtable.s.map(bytes => bytes.toString())},
  withInfos: withInfos
});
