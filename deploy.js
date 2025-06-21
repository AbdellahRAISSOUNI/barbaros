// Simple deployment script for Vercel
const { execSync } = require('child_process');

console.log('🚀 Starting deployment to Vercel...');

// Deploy to Vercel
console.log('🚀 Deploying to Vercel...');
try {
  execSync('vercel --prod', { stdio: 'inherit' });
  console.log('✅ Deployment complete!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('Please check the Vercel dashboard for more details.');
} 