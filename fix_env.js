/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require("node:child_process");

const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const envs = ['production', 'preview', 'development'];

if (!key) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set.");
}

for (const env of envs) {
  console.log(`Adding to ${env}...`);
  try {
    const result = execSync(`npx vercel env add SUPABASE_SERVICE_ROLE_KEY ${env}`, {
      input: key,
      stdio: "pipe"
    });
    console.log(result.toString());
  } catch (err) {
    console.error(err.stderr ? err.stderr.toString() : err.message);
  }
}
