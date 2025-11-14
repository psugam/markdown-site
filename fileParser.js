console.time("Execution-Time");
import fs from "fs/promises";
import path from "path";

import markdownit from "markdown-it";
import markdownitFootnote from "markdown-it-footnote";

import MarkdownItTOC from 'markdown-it-table-of-contents';
import MarkdownItAnchor from 'markdown-it-anchor';
import markdownItAttrs from 'markdown-it-attrs';

import { readFile, writeFile } from "fs/promises";
import { mkdirSync, copyFileSync } from "fs";
import hljs from 'highlight.js'


// using markdown it and various plugins

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
}).use(markdownitFootnote);


md.use(markdownItAttrs, {
  // optional, these are default options
  leftDelimiter: '{',
  rightDelimiter: '}',
  allowedAttributes: []  // empty array = all attributes are allowed
});

md.use(MarkdownItAnchor.default); // Optional, but makes sense as you really want to link to something, see info about recommended plugins below
md.use(MarkdownItTOC,{
  "includeLevel":[1, 2, 3]}
);



// just copy from respecitive documentations 
// options in use should be in json





async function getFilesByType(dirPath, ext) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      // Recursively search subfolders
      const subFiles = await getFilesByType(fullPath, ext);
      files.push(...subFiles);
    } else if (entry.isFile() && path.extname(entry.name) === ext) {
      // Only add files with the given extension
      files.push({ name: entry.name, fullPath });
    }
  }

  return files;
}


// // Usage example
// (async () => {
//     console.log("===============================================================");
//   const mdFiles = await getFilesByType("./md-input", ".md");

//   for (const file of mdFiles) {
//     console.log("File:", file.name, "Path:", file.fullPath);
//   }

//   console.log("Total markdown files found:", mdFiles.length);
//   console.log("===============================================================");
// })();




// Add this function before renderMarkdownFile()
async function createCSSFile(outputBase, themeName) {
  const cssContent= await readFile(`template/css/${themeName}.css`, "utf-8");

  const styleDir = path.join(outputBase, "style");
  const cssPath = path.join(styleDir, "styles.css");
  
  await fs.mkdir(styleDir, { recursive: true });
  await writeFile(cssPath, cssContent, "utf-8");
  console.log(`CSS file created at: ${cssPath}`);
}


async function createHomePage(outputBase, htmlFiles){
  // Build the table of contents
  let tocHTML = '';
  
  // Group files by directory
  const filesByDir = {};
  htmlFiles.forEach(file => {
    const relativePath = path.relative(path.join(outputBase, 'html'), file.fullPath);
    const dir = path.dirname(relativePath);
    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push({
      name: file.name,
      path: relativePath.replace(/\\/g, '/')
    });
  });
  
  // Generate nested list
  Object.keys(filesByDir).sort().forEach(dir => {
    if (dir !== '.') {

      tocHTML += `<li class="home-toc-item"><strong style="padding: 18px 30px; display: block; color: #2d3748;">${dir.charAt(0).toUpperCase()+dir.slice(1)}</strong>`;
      tocHTML += '<ul class="home-toc-list home-toc-nested">';
    }
    
    filesByDir[dir].sort((a, b) => a.name.localeCompare(b.name)).forEach(file => {
      file.name=file.name.replace(".html", "");
      file.name=file.name.charAt(0).toUpperCase() + file.name.slice(1);
      tocHTML += `<li class="home-toc-item"><a href="html/${file.path}" class="home-toc-link">${file.name}</a></li>`;
    });
    
    if (dir !== '.') {
      tocHTML += '</ul></li>';
    }
  });

  const homePageContent = `<!DOCTYPE html>
 <html lang="en">
 <head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Markdown Site</title>
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
   <link rel="stylesheet" href="style/styles.css">
    <link rel="icon" type="image/x-icon" href="favicon/favicon.ico">
    <style>
    body{
    border:none;
    }
    h1, h2, h3, h4, h5, h6{
    text-decoration:none;
    }
    </style>
 </head>
 <body>
   <div class="home-container">
     <header class="home-header">
       <h1 class="home-title"> Documentation</h1>
       <p class="home-subtitle">Explore all available documents and guides</p>
     </header>
    
     <div class="home-toc">
       <div class="home-toc-header">
         <h2 class="home-toc-title">Table of Contents</h2>
       </div>
       <ul class="home-toc-list">
         ${tocHTML}
       </ul>
    </div>
    
     <footer class="home-footer">
       <p>Generated on ${new Date().toLocaleDateString()} • Total documents: ${htmlFiles.length}</p>
     </footer>
   </div>
 </body>
 </html>`;

  const homePagePath = path.join(outputBase, "index.html");
  await writeFile(homePagePath, homePageContent, "utf-8");
  console.log(`Homepage created at: ${homePagePath}`);
}

async function createIndividualPage(file, inputFolder, outputFilePath, markdownContent, allMdFiles) {
  // Render markdown to HTML
  const result = md.render(markdownContent);

  // Calculate relative path from HTML file to CSS file
  const relativePath = path.relative(inputFolder, file.fullPath);
  const depth = relativePath.split(path.sep).length;
  const cssRelativePath = '../'.repeat(depth) + 'style/styles.css';

  const faviconRelativePath = '../'.repeat(depth) + 'favicon/favicon.ico';
  const jsRelativePath = '../'.repeat(depth) + 'js/index.js';

  let pageName = file.name.slice(0, -3);
  pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1);
  
  // Generate table of contents for all pages
  let tocHTML = `<div class="table-of-pages-header">
    <h3 class="toggle-pages-btn" onclick="toggleTableOfPages()"> Pages</h3>
  </div>
  <div class="table-of-pages hidden">
    
    <!-- <h3>All Pages</h3>  -->
    <ul>`;
  
  // Group files by directory
  const filesByDir = {};
  allMdFiles.forEach(mdFile => {
    const relPath = path.relative(inputFolder, mdFile.fullPath);
    const dir = path.dirname(relPath);
    if (!filesByDir[dir]) {
      filesByDir[dir] = [];
    }
    filesByDir[dir].push({
      name: mdFile.name.slice(0, -3),
      path: relPath.slice(0, -3) + '.html'
    });
  });
  
  // Generate nested list
  Object.keys(filesByDir).sort().forEach(dir => {
    if (dir !== '.') {
      tocHTML += `<li><strong>${dir.charAt(0).toUpperCase() + dir.slice(1)}</strong><ul>`;
    }
    
    filesByDir[dir].sort((a, b) => a.name.localeCompare(b.name)).forEach(pageFile => {
      const currentPath = file.fullPath.slice(0, -3) + '.html';
      const targetPath = path.join(inputFolder, pageFile.path);
      const relativeLink = path.relative(path.dirname(currentPath), targetPath).replace(/\\/g, '/');
      
      const displayName = pageFile.name.charAt(0).toUpperCase() + pageFile.name.slice(1);
      const isCurrentPage = pageFile.path === path.relative(inputFolder, file.fullPath).slice(0, -3) + '.html';
      const activeClass = isCurrentPage ? ' class="active"' : '';
      
      tocHTML += `<li${activeClass}><a href="${relativeLink}"${activeClass}>${displayName}</a></li>`;
    });
    
    if (dir !== '.') {
      tocHTML += '</ul></li>';
    }
  });
  
  tocHTML += '</ul></div>';
  
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageName}</title>
  <!-- Highlight.js CSS theme -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
  <!-- Optional: Add some basic styling for the markdown content -->
  <link rel="stylesheet" href="${cssRelativePath}">
   <link rel="icon" type="image/x-icon" href="${faviconRelativePath}">
   </head>

<body>
<div class="body-main-container">
  <button class="toggle-btn" onclick="handleDarkModeToggle()">
    <span class="sun">☀️</span>
    <span class="moon">🌙</span>
  </button>
   <a href="/site-output/index.html">Home</a> 
  ${tocHTML}
  ${result}
 </div>
</body>
<script src="${jsRelativePath}"></script>
</html>`;

  const htmlFileName = file.name.slice(0, -3) + ".html";
  file.name = htmlFileName; // change extension to .html

  async function copyFilePreserveStructure(inputPath, inputBase, outputBase) {
    // 1️⃣ Get the relative path from the base input folder
    const relativePath = path.relative(inputBase, inputPath);
    // e.g. "subfolder/johnny.md"

    // 2️⃣ Compute the full output path
    const outputPath = path.join(outputBase, relativePath);
    const outputDir = path.dirname(outputPath);

    // 3️⃣ Ensure the output folder exists
    await fs.mkdir(outputDir, { recursive: true });

    // 4️⃣ For demonstration: you could copy, or write new content
    // Here we just copy the file
    // const content = await fs.readFile(inputPath, "utf-8");
    await fs.writeFile(outputPath, fullHTML, "utf-8");

    console.log(`File written to: ${outputPath}`);
    return outputPath;
  }

  const outputPath = await copyFilePreserveStructure(
    file.fullPath.slice(0, -3) + ".html",
    inputFolder,
    outputFilePath
  );

  return { name: htmlFileName, fullPath: outputPath };
}

async function createFaviconFile(outputBase){
  // Define source and destination paths
  const source = path.join("template", "favicon", "favicon.ico");
  const destination = path.join(outputBase, "favicon", "favicon.ico");

  // Ensure destination folder exists
  mkdirSync(path.dirname(destination), { recursive: true });

  // Copy file
  copyFileSync(source, destination);

  console.log("Favicon copied successfully!");
}


async function createJSFile(outputBase) {
   const source = path.join("template", "js", "index.js");
  const destination = path.join(outputBase, "js", "index.js");

  // if not subfolder exist 
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(source, destination);
  console.log("JS file copied successfully!");
}





export async function renderMarkdownFile( inputFolder="./md-input", inputFileType=".md", outputFolder="site-output", themeName="sunset" ) {
  try {
    // Read the markdown file
    const outputFilePath = `${outputFolder}/html/`;
    
    await createCSSFile(outputFolder, themeName);
    await createFaviconFile(outputFolder);
    await createJSFile(outputFolder);

    const mdFiles = await getFilesByType(inputFolder, inputFileType);
    const htmlFiles = [];
    
    for (const file of mdFiles) {
      console.log("File:", file.name, "Path:", file.fullPath);
      const markdownContent = await readFile(file.fullPath, "utf-8");
      
      const htmlFile = await createIndividualPage(file, inputFolder, outputFilePath, markdownContent, mdFiles);
      htmlFiles.push(htmlFile);
    }

    await createHomePage(outputFolder, htmlFiles);
  } catch (error) {
    console.error("Error reading file:", error);
  }
}




console.timeEnd('Execution-Time');