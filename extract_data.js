const fs = require('fs');
const path = require('path');

const pageFile = path.join(__dirname, 'src', 'app', 'page.tsx');
const libDir = path.join(__dirname, 'src', 'lib');
const dataFile = path.join(libDir, 'data.ts');

if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

let pageContent = fs.readFileSync(pageFile, 'utf8');

const regex = /const mockListings = (\[[\s\S]*?\]);/;
const match = pageContent.match(regex);

if (match) {
  const arrayContent = match[0];
  const exported = arrayContent.replace('const mockListings', 'export const mockListings');
  
  fs.writeFileSync(dataFile, exported, 'utf8');
  console.log('Created src/lib/data.ts');
  
  let newPageContent = pageContent.replace(arrayContent, 'import { mockListings } from "@/lib/data";\nimport Link from "next/link";');
  fs.writeFileSync(pageFile, newPageContent, 'utf8');
  console.log('Updated src/app/page.tsx');
} else {
  console.log('mockListings not found in page.tsx');
}
