function formatDoc(docData) {
  return [{ type: 'text', text: 'title ' + docData.name }];
}

module.exports = {
  format: formatDoc
};
