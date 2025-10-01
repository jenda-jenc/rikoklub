/**
 * @param {import('@11ty/eleventy/src/UserConfig')} eleventyConfig
 */
const eventDateFormatter = new Intl.DateTimeFormat('cs-CZ', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'Europe/Prague',
});

module.exports = function (eleventyConfig) {
  eleventyConfig.addWatchTarget('./content');
  eleventyConfig.addPassthroughCopy({ public: '/' });

  eleventyConfig.addFilter('formatDate', (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) {
      return date;
    }
    return eventDateFormatter
      .formatToParts(d)
      .map((part) => {
        if (part.type === 'literal' && part.value.trim() === 'v') {
          return ' ';
        }
        return part.value;
      })
      .join('');
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
