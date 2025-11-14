import { renderMarkdownFile } from "./fileParser.js";
const inputFolder="./md-input";
const inputFileType=".md"; 
const outputFolder="site-output";
const themeName="style";
renderMarkdownFile(
    inputFolder, 
    inputFileType, 
    outputFolder, 
    themeName
);