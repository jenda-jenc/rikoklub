/**
 * @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig
 */
module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./content');
  eleventyConfig.addPassthroughCopy({ public: '/' });

  eleventyConfig.addFilter('formatDate', (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return date;
    }
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  });

  eleventyConfig.addShortcode('currentYear', () => new Date().getFullYear());

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '../content',
      output: 'dist',
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
