import markdownit from "markdown-it";
import { readFile, writeFile } from "fs/promises";
import hljs from 'highlight.js'

// const md = markdownit();
const md = markdownit({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value
      } catch (__) {}
    }
    return '' // use external default escaping
  }
})

async function renderMarkdownFile() {
  try {
    // Read the markdown file
    const inputFilePath=""
    const inputFileName="docker-learn"
    const outputFilePath="site-output/"
    const markdownContent = await readFile(`${inputFilePath}${inputFileName}.md`, "utf-8");

    // Render it
    const result = md.render(markdownContent);
    console.log("The result is coming");



const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${inputFileName}</title>
  <!-- Highlight.js CSS theme -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <!-- Optional: Add some basic styling for the markdown content -->
  <style>
    body {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    code {
      background-color: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      border-radius: 5px;
      padding: 15px;
    }
    pre code {
      background: none;
      padding: 0;
    }
  </style>
</head>
<body>
  ${result}
</body>
</html>`



    writeFile("site-output/output.html", fullHTML, "utf-8");
  } catch (error) {
    console.error("Error reading file:", error);
  }
}

renderMarkdownFile();
