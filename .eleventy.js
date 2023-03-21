const { DateTime } = require("luxon");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/css");
  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/admin");

  eleventyConfig.addFilter("postDate", (dateObj) => {
    return DateTime.fromJSDate(dateObj).toLocaleString(DateTime.DATE_MED);
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  function filterTagList(tags) {
    return (tags || []).filter(
      (tag) => ["all", "nav", "post", "posts"].indexOf(tag) === -1
    );
  }

  eleventyConfig.addFilter("filterTagList", filterTagList);

  // Create an array of all tags
  eleventyConfig.addCollection("tagList", function (collection) {
    let tagSet = new Set();
    collection.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    });

    return filterTagList([...tagSet]);
  });

  eleventyConfig.addCollection("authorPosts", function (collectionApi) {
    const posts = collectionApi.getFilteredByTag("posts");

    // Group posts by author
    const postsByAuthor = {};
    posts.forEach((post) => {
      const authorSlug = post.data.author.slug;
      if (postsByAuthor[authorSlug]) {
        postsByAuthor[authorSlug].push(post);
      } else {
        postsByAuthor[authorSlug] = [post];
      }
    });

    // Return posts for the current author
    return (authorSlug) => {
      return postsByAuthor[authorSlug] || [];
    };
  });

  return {
    markdownTemplateEngine: "md",

    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "public",
    },
  };
};
