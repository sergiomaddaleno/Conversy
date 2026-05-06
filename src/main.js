import { loadImageToPdfTool } from './modules/image_to_pdf.js';

const app = document.getElementById('app');

const tools = [
  loadImageToPdfTool
];

tools.forEach(tool => tool(app));
