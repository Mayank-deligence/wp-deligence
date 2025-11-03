const path = require(`path`);

exports.createPages = async ({ graphql, actions, reporter }) => {
  const { createPage } = actions;

  // ===============================
  // 📰 CREATE BLOG POSTS
  // ===============================
  const blogPostTemplate = path.resolve(`./src/templates/blog-post.js`);
  const blogPostArchiveTemplate = path.resolve(`./src/templates/blog-post-archive.js`);
  const postsPerPage = 10;

  const result = await graphql(`
    {
      allWpPost(sort: { fields: [date], order: DESC }) {
        nodes {
          id
          uri
        }
      }
    }
  `);

  if (result.errors) {
    reporter.panicOnBuild(`Error loading WordPress posts`, result.errors);
    return;
  }

  const posts = result.data.allWpPost.nodes;

  // Create individual blog posts
  posts.forEach((post, index) => {
    const previousPostId = index === 0 ? null : posts[index - 1].id;
    const nextPostId = index === posts.length - 1 ? null : posts[index + 1].id;

    const cleanPath = post.uri.replace("/index.php", "");
    createPage({
      path: cleanPath,
      component: blogPostTemplate,
      context: {
        id: post.id,
        previousPostId,
        nextPostId,
      },
    });
  });

  // ===============================
  // 🗂 PAGINATION (ARCHIVE PAGES)
  // ===============================
  const numPages = Math.ceil(posts.length / postsPerPage);

  Array.from({ length: numPages }).forEach((_, i) => {
    const pagePath = i === 0 ? `/` : `/page/${i + 1}`;
    const offset = i * postsPerPage;

    createPage({
      path: pagePath,
      component: blogPostArchiveTemplate,
      context: {
        offset, // ✅ provide even for first page
        postsPerPage, // ✅ provide even for first page
        currentPage: i + 1,
        numPages,
        nextPagePath: i + 1 < numPages ? `/page/${i + 2}` : null,
        previousPagePath: i > 0 ? (i === 1 ? `/` : `/page/${i}`) : null,
      },
    });
  });

  // ===============================
  // 📄 CREATE STATIC PAGES
  // ===============================
  const pageTemplate = path.resolve(`./src/templates/page.js`);

  const pageResult = await graphql(`
    {
      allWpPage {
        nodes {
          id
          uri
        }
      }
    }
  `);

  if (pageResult.errors) {
    reporter.panicOnBuild(`Error loading WordPress pages`, pageResult.errors);
    return;
  }

  const pages = pageResult.data.allWpPage.nodes;

  pages.forEach((page) => {
    const cleanPath = page.uri.replace("/index.php", "");
    console.log(`✅ Creating page: ${cleanPath}`);
    createPage({
      path: cleanPath,
      component: pageTemplate,
      context: { id: page.id },
    });
  });
};
