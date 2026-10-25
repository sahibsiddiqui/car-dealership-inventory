const { execSync } = require('child_process');

module.exports = async () => {
  execSync('npx prisma db push --force-reset --accept-data-loss --skip-generate', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
  });
};