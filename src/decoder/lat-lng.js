module.exports = (valueOffset, settingsOffset, granularity) =>
  (1e-9 * (settingsOffset + (granularity * valueOffset)));
