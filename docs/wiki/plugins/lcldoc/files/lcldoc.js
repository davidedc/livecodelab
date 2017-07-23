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

function attributesTable(docData) {
  return [
    element('h2', [text('Attributes')]),
    element('table', [
      element('tr', [
        element('th', [text('type')]),
        element('td', [text(docData.type || 'unknown')])
      ]),
      element('tr', [
        element('th', [text('inlinable')]),
        element('td', [text(docData.inlinable.toString())])
      ]),
      element('tr', [
        element('th', [text('block scoping')]),
        element('td', [text(docData['block-scope'].toString())])
      ])
    ])
  ];
}

function argumentsTable(docData) {
  var rows = [
    element('tr', [
      element('th', [text('Name')]),
      element('th', [text('Type')]),
      element('th', [text('Optional')]),
      element('th', [text('Defaults')])
    ])
  ].concat(
    docData.arguments.map(function(arg) {
      console.log(arg);
      return element('tr', [
        element('td', [text(arg.name)]),
        element('td', [text(arg.type)]),
        element('td', [text(arg.optional.toString())]),
        element('td', [text(arg.optional ? arg.defaults.join(', ') : '')])
      ]);
    })
  );

  return [element('h2', [text('Arguments')]), element('table', rows)];
}

function codeExample(examples, name) {
  return [element('h2', [text('Examples')]), codeblock(examples[name])];
}

function formatDoc(docData) {
  var tree = [];
  return []
    .concat([text(docData.description)])
    .concat(attributesTable(docData))
    .concat(argumentsTable(docData))
    .concat(codeExample(docData.examples, 'simple'));
}

module.exports = {
  format: formatDoc
};
