module.exports = (tags, stringTable) => {
  if (!tags) {
    return {
      keys: [],
      vals: []
    };
  }

  const tagKeys = Object.keys(tags);
  const keys = [];
  const vals = [];
  for (let i = 0; i < tagKeys.length; i++) {
    const keyString = tagKeys[i];
    const valueString = tags[keyString];

    keys[i] = stringTable.add(keyString);
    vals[i] = stringTable.add(valueString);
  }

  return {
    keys: keys,
    vals: vals
  };
};
