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
    argList,
    codeblock(docData.examples.simple)
  ];
}

module.exports = {
  format: formatDoc
};
