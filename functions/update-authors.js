const axios = require("axios");
const fs = require("fs");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const author = body.object;
  const authors = JSON.parse(fs.readFileSync("./_data/authors.json"));

  authors.push(author);

  fs.writeFileSync("./_data/authors.json", JSON.stringify(authors, null, 2));

  const commitMessage = `Add new author: ${author.name}`;
  const commitAuthor = { name: "Netlify CMS", email: "cms@netlify.com" };

  const response = await axios.post(
    `https://api.github.com/repos/${process.env.REPO}/git/commits`,
    {
      message: commitMessage,
      content: Buffer.from(JSON.stringify(authors, null, 2)).toString("base64"),
      author: commitAuthor,
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      },
    }
  );

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
};
