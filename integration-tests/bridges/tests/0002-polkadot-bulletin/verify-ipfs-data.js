const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run(nodeName, networkInfo, args) {
    const inputData = args.data;
    
    // Convert string to hex if it's not already hex
    let storedData;
    if (inputData.startsWith('0x')) {
        storedData = inputData;
    } else {
        storedData = '0x' + Buffer.from(inputData, 'utf8').toString('hex');
        console.log(`Converting string "${inputData}" to hex: ${storedData}`);
    }
    
    console.log(`Verifying IPFS storage for data: ${storedData}`);

    const calculateCidPath = path.join(__dirname, '../../environments/polkadot-people-bulletin/calculate_cid');
    
    try {
        // Step 1: Calculate the expected CID for the stored data
        const cidResult = await new Promise((resolve, reject) => {
            exec(`cd ${calculateCidPath} && node index.js hex ${storedData}`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error calculating CID: ${error}`);
                    reject(error);
                    return;
                }
                if (stderr) {
                    console.error(`CID calculation stderr: ${stderr}`);
                }
                const cid = stdout.trim();
                console.log(`Calculated CID: ${cid}`);
                resolve(cid);
            });
        });

        // Step 2: Try to retrieve the data from IPFS using the CID with retry logic
        console.log(`Attempting to retrieve data from IPFS with CID: ${cidResult}`);
        
        const maxRetries = 5;
        const retryDelay = 2000; // 2 secs
        
        const retrievedData = await new Promise(async (resolve, reject) => {
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    console.log(`Attempt ${attempt}/${maxRetries} to retrieve data from IPFS...`);
                    
                    const result = await new Promise((resolveAttempt, rejectAttempt) => {
                        exec(`ipfs block get ${cidResult}`, (error, stdout, stderr) => {
                            if (error) {
                                rejectAttempt(error);
                                return;
                            }
                            if (stderr) {
                                console.warn(`IPFS retrieval stderr: ${stderr}`);
                            }
                            
                            // Convert the retrieved data to hex for comparison
                            const retrievedHex = `0x${Buffer.from(stdout, 'binary').toString('hex')}`;
                            resolveAttempt(retrievedHex);
                        });
                    });
                    
                    console.log(`Retrieved data from IPFS: ${result}`);
                    resolve(result);
                    return;
                    
                } catch (error) {
                    console.warn(`Attempt ${attempt} failed: ${error.message}`);
                    
                    if (attempt === maxRetries) {
                        reject(new Error(`Failed to retrieve data from IPFS after ${maxRetries} attempts. Last error: ${error.message}`));
                        return;
                    }
                    
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, retryDelay));
                }
            }
        });

        // Step 3: Verify that the retrieved data matches what was stored
        if (retrievedData.toLowerCase() === storedData.toLowerCase()) {
            console.log('✓ SUCCESS: Data retrieved from IPFS matches the stored data!');
            console.log(`  Original input: "${inputData}"`);
            console.log(`  Stored as hex: ${storedData}`);
            console.log(`  Retrieved: ${retrievedData}`);
            console.log(`  CID: ${cidResult}`);
        } else {
            throw new Error(`Data mismatch! Stored: ${storedData}, Retrieved: ${retrievedData}`);
        }

    } catch (error) {
        console.error(`IPFS verification failed: ${error.message}`);
        throw error;
    }

    return 0;
}

module.exports = { run };
