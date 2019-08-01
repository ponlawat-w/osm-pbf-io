module.exports = (pbfObj, settings) => {
  const tags = {};
  for (let i = 0; i < pbfObj.keys.length; i++) {
    tags[settings.stringTable.s[pbfObj.keys[i]]] =
      settings.stringTable.s[pbfObj.vals[i]];
  }

  return tags;
}
