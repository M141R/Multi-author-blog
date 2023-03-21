const axios = require("axios");
const fs = require("fs");

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  const authors = body.objects;
  const existingAuthors = JSON.parse(fs.readFileSync("./_data/authors.json"));

  const updatedAuthors = existingAuthors.concat(authors);

  fs.writeFileSync(
    ".src/_data/authors.json",
    JSON.stringify(updatedAuthors, null, 2)
  );

  const commitMessage = `Add new authors: ${authors
    .map((a) => a.name)
    .join(", ")}`;
  const commitAuthor = { name: "Netlify CMS", email: "cms@netlify.com" };

  const response = await axios.post(
    `https://api.github.com/repos/${process.env.REPO}/git/commits`,
    {
      message: commitMessage,
      content: Buffer.from(JSON.stringify(updatedAuthors, null, 2)).toString(
        "base64"
      ),
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
