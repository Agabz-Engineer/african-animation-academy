const { execSync } = require('child_process');

const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZWhoZnBhbnN0dGljbnNhc212Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTc4MTU1NSwiZXhwIjoyMDg3MzU3NTU1fQ.anA8mPkZF73O_rxqh65tjewfoEq2sHzWiNpDoGuu-NU";

const envs = ['production', 'preview', 'development'];

for (const env of envs) {
  console.log(`Adding to ${env}...`);
  try {
    const result = execSync(`npx vercel env add SUPABASE_SERVICE_ROLE_KEY ${env}`, {
      input: key,
      stdio: 'pipe'
    });
    console.log(result.toString());
  } catch (err) {
    console.error(err.stderr ? err.stderr.toString() : err.message);
  }
}
