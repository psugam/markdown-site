import fs from "fs/promises";
import path from "path";

import markdownit from "markdown-it";
import markdownitFootnote from "markdown-it-footnote";
import { readFile, writeFile } from "fs/promises";
import { mkdirSync, copyFileSync } from "fs";
import hljs from 'highlight.js'




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







/**
 * Recursively get all files of a specific extension
 * @param {string} dirPath - folder to search
 * @param {string} ext - file extension, e.g. '.md'
 * @returns {Promise<{name: string, fullPath: string}[]>}
 */
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
//   const cssContent = `body {
//   max-width: 800px;
//   margin: 40px auto;
//   padding: 0 20px;
//   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
//   line-height: 1.6;
//   color: #333;
// }
// code {
//   background-color: #f4f4f4;
//   padding: 2px 6px;
//   border-radius: 3px;
//   font-family: 'Courier New', monospace;
// }
// pre {
//   border-radius: 5px;
//   padding: 15px;
// }
// pre code {
//   background: none;
//   padding: 0;
// }

// /* Homepage styles */
// .home-container {
//   max-width: 1000px;
//   margin: 0 auto;
//   padding: 40px 20px;
// }

// .home-header {
//   text-align: center;
//   margin-bottom: 60px;
//   padding: 40px 20px;
//   background: linear-gradient(135deg, #29292aff 0%, #d6d3d9ff 100%);
//   color: white;
//   border-radius: 12px;
//   box-shadow: 0 10px 30px rgba(0,0,0,0.1);
// }

// .home-title {
//   font-size: 3em;
//   margin: 0 0 10px 0;
//   font-weight: 700;
// }

// .home-subtitle {
//   font-size: 1.2em;
//   opacity: 0.95;
//   margin: 0;
// }

// .home-toc {
//   background: white;
//   border-radius: 12px;
//   box-shadow: 0 4px 20px rgba(0,0,0,0.08);
//   overflow: hidden;
// }

// .home-toc-header {
//   background: #f8f9fa;
//   padding: 20px 30px;
//   border-bottom: 2px solid #e9ecef;
// }

// .home-toc-title {
//   margin: 0;
//   font-size: 1.8em;
//   color: #2d3748;
// }

// .home-toc-list {
//   list-style: none;
//   padding: 0;
//   margin: 0;
// }

// .home-toc-item {
//   border-bottom: 1px solid #e9ecef;
//   transition: background-color 0.2s ease;
// }

// .home-toc-item:last-child {
//   border-bottom: none;
// }

// .home-toc-item:hover {
//   background-color: #f8f9fa;
// }

// .home-toc-link {
//   display: block;
//   padding: 18px 30px;
//   color: #4a5568;
//   text-decoration: none;
//   font-size: 1.1em;
//   transition: all 0.2s ease;
//   position: relative;
//   padding-left: 50px;
// }

// .home-toc-link:before {
//   content: "📄";
//   position: absolute;
//   left: 20px;
//   font-size: 1.2em;
// }

// .home-toc-link:hover {
//   color: #667eea;
//   padding-left: 55px;
// }

// .home-toc-nested {
//   padding-left: 20px;
//   background-color: #f8f9fa;
// }

// .home-toc-nested .home-toc-link {
//   padding-left: 60px;
//   font-size: 1em;
// }

// .home-toc-nested .home-toc-link:before {
//   content: "📝";
//   left: 30px;
// }

// .home-footer {
//   text-align: center;
//   margin-top: 60px;
//   padding: 20px;
//   color: #718096;
//   font-size: 0.9em;
// }`;


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
      tocHTML += `<li class="home-toc-item"><strong style="padding: 18px 30px; display: block; color: #2d3748;"> ${dir}</strong>`;
      tocHTML += '<ul class="home-toc-list home-toc-nested">';
    }
    
    filesByDir[dir].sort((a, b) => a.name.localeCompare(b.name)).forEach(file => {
      tocHTML += `<li class="home-toc-item"><a href="html/${file.path}" class="home-toc-link">${file.name.replace('.html', '')}</a></li>`;
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


async function createJSFile(outputBase){
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
    // const outputFilePath="site-output/html/";
    const outputFilePath=`${outputFolder}/html/`;
await createCSSFile(outputFolder, themeName);
await createFaviconFile(outputFolder);
await createJSFile(outputFolder);

const mdFiles = await getFilesByType(inputFolder, inputFileType);
  const htmlFiles = [];
  for (const file of mdFiles) {
    console.log("File:", file.name, "Path:", file.fullPath);
    const markdownContent = await readFile(file.fullPath, "utf-8");
        // Render it
    const result = md.render(markdownContent);
    // const relativePath=file.fullPath.replace(inputFolder.slice(2),"").slice(1).replace(file.name, "")//normalize to forward slashes
    // console.log(`The realtive path after removing ${inputFolder.slice(2)} is:`, relativePath)
    // console.log("The result is coming for file: ", file.name);


// Calculate relative path from HTML file to CSS file
const relativePath = path.relative(inputFolder, file.fullPath);
const depth = relativePath.split(path.sep).length;
const cssRelativePath = '../'.repeat(depth) + 'style/styles.css';

const faviconRelativePath = '../'.repeat(depth) + 'favicon/favicon.ico';
const jsRelativePath = '../'.repeat(depth) + 'js/index.js';

let pageName=file.name.slice(0, -3);
pageName=pageName.charAt(0).toUpperCase() + pageName.slice(1);
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
  <button class="toggle-btn" onclick="handleDarkModeToggle()">
    <span class="sun">☀️</span>
    <span class="moon">🌙</span>
  </button>
   <a href="/site-output/index.html">Home</a> 
</div>
  ${result}
 
</body>
<script src="${jsRelativePath}"></script>
</html>`
const htmlFileName = file.name.slice(0, -3)+".html";
file.name = htmlFileName; //change extension to .html
    // writeFile(`${outputFilePath}${file.name}`, fullHTML, "utf-8");

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

const outputPath = await copyFilePreserveStructure(file.fullPath.slice(0, -3)+".html", inputFolder, outputFilePath);
htmlFiles.push({ name: htmlFileName, fullPath: outputPath });






  }

    await createHomePage(outputFolder, htmlFiles);
  } catch (error) {
    console.error("Error reading file:", error);
  }
}


