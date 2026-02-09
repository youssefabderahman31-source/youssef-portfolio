const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function hasUploads() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const docsDir = path.join(process.cwd(), 'public', 'documents');
  const u = fs.existsSync(uploadsDir) && fs.readdirSync(uploadsDir).length > 0;
  const d = fs.existsSync(docsDir) && fs.readdirSync(docsDir).length > 0;
  return u || d;
}

try {
  if (!hasUploads()) {
    console.log('No files in public/uploads or public/documents to publish.');
    process.exit(0);
  }

  console.log('Staging uploaded files...');
  execSync('git add public/uploads public/documents', { stdio: 'inherit' });

  const msg = 'chore: publish uploaded files';
  try {
    execSync(`git commit -m "${msg}"`, { stdio: 'inherit' });
  } catch (e) {
    console.log('No changes to commit.');
  }

  console.log('Pushing to origin main...');
  execSync('git push origin main', { stdio: 'inherit' });

  console.log('Done. The repository was updated — CI should deploy automatically.');
} catch (error) {
  console.error('Error while publishing uploads:', error.message || error);
  process.exit(1);
}
