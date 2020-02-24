module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy('site/images');
  eleventyConfig.addPassthroughCopy('site/fonts');

  return {
    templateFormats: ['md', 'njk', 'css', 'html'],
    dir: {
      input: './site',
      output: './dist',
    },
  };
};
