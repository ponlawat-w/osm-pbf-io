module.exports = (value, settingsOffset, granularity) => 
  ((value / 1e-9) - settingsOffset) / granularity;
