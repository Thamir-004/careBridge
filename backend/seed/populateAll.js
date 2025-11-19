require('dotenv').config();
const { spawn } = require('child_process');

console.log('Starting CareBridge Database Population...');
console.log('==========================================\n');

// Scripts to run in order
const scripts = [
  { name: 'Hospital A Data', file: 'backend/seed/populateHospitalA.js' },
  { name: 'Hospital B Data', file: 'backend/seed/populateHospitalB.js' },
  { name: 'Patient Transfers', file: 'backend/seed/populateTransfers.js' }
];

function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    console.log(`Running ${scriptPath}...`);

    const child = spawn('node', [scriptPath], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✓ ${scriptPath} completed successfully\n`);
        resolve();
      } else {
        console.error(`✗ ${scriptPath} failed with exit code ${code}`);
        reject(new Error(`Script ${scriptPath} failed`));
      }
    });

    child.on('error', (error) => {
      console.error(`Error running ${scriptPath}:`, error);
      reject(error);
    });
  });
}

async function runAllScripts() {
  try {
    for (const script of scripts) {
      console.log(`📊 Populating ${script.name}...`);
      await runScript(script.file);
    }

    console.log('🎉 All database population scripts completed successfully!');
    console.log('\n📈 Analytics Data Summary:');
    console.log('   • Hospital A: 200 patients, 15 doctors, 10 nurses, 600 encounters, 400 medications');
    console.log('   • Hospital B: 180 patients, 12 doctors, 8 nurses, 500 encounters, 350 medications');
    console.log('   • Transfers: 45 total transfers between hospitals with follow-up encounters');
    console.log('   • Time span: 6 months of historical data for meaningful analytics');
    console.log('\n✅ Ready for analytics and reporting!');

  } catch (error) {
    console.error('❌ Database population failed:', error.message);
    process.exit(1);
  }
}

// Run all scripts
runAllScripts();