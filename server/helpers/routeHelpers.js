const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const jwtSecret = process.env.JWT_SECRET;

function isActiveRoute(route, currentRoute) {
  return route === currentRoute ? 'active' : '';
}

// Middleware to ensure the user is authenticated using session authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

// Middleware to ensure the user is authenticated using JWT token
const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

// Function to create a PDF from note content
function createPDF(noteContent, noteTitle, res) {
  const doc = new PDFDocument();
  const filePath = `${__dirname}/../notes/${noteTitle}.pdf`;

  // Ensure the directory exists
  fs.mkdirSync(`${__dirname}/../notes`, { recursive: true });

  // Pipe the PDF into a writable stream
  doc.pipe(fs.createWriteStream(filePath));
  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(25).text(noteTitle, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(noteContent, {
    width: 410,
    align: 'left'
  });

  // Finalize the PDF
  doc.end();
}

module.exports = { 
  isActiveRoute,
  ensureAuthenticated,
  authMiddleware,
  createPDF 
};
