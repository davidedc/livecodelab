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

function boolToStr(value, defaultValue) {
  if (value === undefined || value === null) {
    return text('unknown');
  }
  return text(value.toString());
}

function text(text) {
  return { type: 'text', text: text };
}

function attributesTable(attributes) {
  return [
    element('h2', [text('Attributes')]),
    element('table', [
      element('tr', [
        element('th', [text('type')]),
        element('td', [text(attributes.type || 'unknown')])
      ]),
      element('tr', [
        element('th', [text('inlinable')]),
        element('td', [boolToStr(attributes.inlinable)])
      ]),
      element('tr', [
        element('th', [text('block scoping')]),
        element('td', [boolToStr(attributes['block-scope'])])
      ])
    ])
  ];
}

function argumentsTable(docData) {
  var rows = [
    element('tr', [
      element('th', [text('Name')]),
      element('th', [text('Type')]),
      element('th', [text('Range')]),
      element('th', [text('Optional')]),
      element('th', [text('Defaults')])
    ])
  ].concat(
    docData.arguments.map(function(arg) {
      console.log(arg);
      return element('tr', [
        element('td', [text(arg.name)]),
        element('td', [text(arg.type)]),
        element('td', [text(arg.range || 'any')]),
        element('td', [text(arg.optional.toString())]),
        element('td', [text(arg.optional ? arg.defaults.join(', ') : '')])
      ]);
    })
  );

  return [element('h2', [text('Arguments')]), element('table', rows)];
}

function codeExamples(examples) {
  return [element('h2', [text('Examples')])].concat(
    examples.map(function(example) {
      return codeblock(example.code);
    })
  );
}

function formatDoc(docData) {
  var tree = [];
  return []
    .concat([text(docData.description)])
    .concat(attributesTable(docData.attributes))
    .concat(argumentsTable(docData))
    .concat(codeExamples(docData.examples));
}

module.exports = {
  format: formatDoc
};
