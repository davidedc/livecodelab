function element(tag, children) {
  return { type: 'element', tag: tag, children: children };
}

function codeblock(code) {
  return {
    type: 'codeblock',
    attributes: {
      code: { type: 'string', value: code },
      language: { type: 'string', value: 'lclang' }
    }
  };
}

function text(text) {
  return { type: 'text', text: text };
}

function attributesTable(attrs) {
  return element('table', [
    element('tr', [
      element('th', [text('inlinable')]),
      element('td', [text(attrs.inlinable.toString())])
    ]),
    element('tr', [
      element('th', [text('block scoping')]),
      element('td', [text(attrs.blockScope.toString())])
    ])
  ]);
}

function codeExamples(example) {
  return codeblock(example.code);
}

function formatDoc(docData) {
  var argList = element(
    'ol',
    docData.arguments.map(function(arg) {
      return element('li', [text(arg.name)]);
    })
  );
  return [
    text(docData.description),
    attributesTable({
      inlinable: docData.inlinable,
      blockScope: docData['block-scope']
    }),
    argList,
    codeblock(docData.examples.simple)
  ];
}

module.exports = {
  format: formatDoc
};
