const fs = require("fs");
const { exit } = require("process");
const { blake2AsU8a } = require("@polkadot/util-crypto");
const multihash = require("multihashes");
const CID = require("cids");

/**
 * Calculate the IPFS CID for data that will be stored
 * in the transaction-storage pallet.
 * 
 * The CID is calculated using:
 * 1. Blake2-256 hash of the data
 * 2. Multihash encoding with 'blake2b-256' codec
 * 3. CIDv1 creation
 * 
 * @param {string} inputFile - Path to the file to calculate CID for
 * @param {string} outputFile - Optional path to write the CID and hash info
 */
function calculateCID(inputFile, outputFile = null) {
	try {
		const data = fs.readFileSync(inputFile);
		
		// 1. Calculate Blake2-256 hash
		const hash = blake2AsU8a(data);
		
		// 2. Encode as multihash with blake2b-256 codec
		const encoded_hash = multihash.encode(hash, "blake2b-256");
		
		// 3. Create CIDv1
		const cid = new CID(1, "blake2b-256", encoded_hash);
		const cidString = cid.toString();
		
		const output = {
			file: inputFile,
			size: data.length,
			blake2_256_hash: `0x${Buffer.from(hash).toString("hex")}`,
			multihash: `0x${Buffer.from(encoded_hash).toString("hex")}`,
			cid: cidString,
			data_hex: `0x${data.toString("hex")}`,
		};
		
		if (outputFile) {
			fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
		}
		
		console.log(cidString);
		exit(0);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		exit(1);
	}
}

/**
 * Calculate CID from raw hex data instead of a file
 * 
 * @param {string} hexData - Hex-encoded data (with or without 0x prefix)
 * @param {string} outputFile - Optional path to write the CID and hash info
 */
function calculateCIDFromHex(hexData, outputFile = null) {
	try {
		const cleanHex = hexData.startsWith("0x") ? hexData.slice(2) : hexData;
		const data = Buffer.from(cleanHex, "hex");
		
		const hash = blake2AsU8a(data);
		
		const encoded_hash = multihash.encode(hash, "blake2b-256");
		
		const cid = new CID(1, "blake2b-256", encoded_hash);
		const cidString = cid.toString();
		
		const output = {
			size: data.length,
			blake2_256_hash: `0x${Buffer.from(hash).toString("hex")}`,
			multihash: `0x${Buffer.from(encoded_hash).toString("hex")}`,
			cid: cidString,
			data_hex: `0x${data.toString("hex")}`,
		};

		if (outputFile) {
			fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
		}
		
		console.log(cidString);
		exit(0);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		exit(1);
	}
}

if (!process.argv[2]) {
	console.log("Usage: node index.js <type> [input] [output]");
	console.log("");
	console.log("Types:");
	console.log("  file <input-file> [output-json]    - Calculate CID from a file");
	console.log("  hex <hex-data> [output-json]       - Calculate CID from hex data");
	console.log("");
	console.log("Examples:");
	console.log("  node index.js file data.txt");
	console.log("  node index.js file data.txt output.json");
	console.log("  node index.js hex 0x48656c6c6f");
	console.log("  node index.js hex 0x48656c6c6f output.json");
	exit(1);
}

const type = process.argv[2];
const input = process.argv[3];
const output = process.argv[4];

switch (type) {
	case "file":
		if (!input) {
			console.error("Error: input file required");
			exit(1);
		}
		calculateCID(input, output);
		break;
	case "hex":
		if (!input) {
			console.error("Error: hex data required");
			exit(1);
		}
		calculateCIDFromHex(input, output);
		break;
	default:
		console.error(`Unknown type: ${type}`);
		console.log("Use 'file' or 'hex'");
		exit(1);
}

