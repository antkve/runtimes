# CID Calculator for Transaction Storage Pallet

This utility calculates the IPFS CID (Content Identifier) for data that will be stored in the transaction-storage pallet. The CID is needed to retrieve the data from IPFS after it has been stored on the Bulletin chain.

## How it Works

The CID is calculated using the same method as described in the transaction-storage pallet README:

1. Calculate the Blake2-256 hash of the data
2. Encode the hash using multihash with the `blake2b-256` codec
3. Create a CIDv1 from the encoded hash

This matches exactly what the pallet does internally when storing data.

## Installation

```bash
cd calculate_cid
npm install
```

## Usage

### Calculate CID from a file:

```bash
node index.js file <input-file> [output-json]
```

Example:
```bash
node index.js file my_data.txt
node index.js file my_data.txt output.json
```

### Calculate CID from hex data:

```bash
node index.js hex <hex-data> [output-json]
```

Example:
```bash
node index.js hex 0x48656c6c6f
node index.js hex 0x48656c6c6f output.json
```

## Output

The script outputs:
- File size
- Blake2-256 hash (hex)
- Multihash encoding (hex)
- **CID** (the identifier you'll use to retrieve the data)
- Instructions for retrieving from IPFS
- Hex-encoded data (for use with `transactionStorage.store`)

If an output file is specified, all this information is saved as JSON.

## Example Workflow

1. **Calculate the CID before storing:**
   ```bash
   node index.js file my_data.txt cid_info.json
   ```

2. **Store the data on-chain** using the hex-encoded data from the output:
   ```javascript
   const cidInfo = require('./cid_info.json');
   await api.tx.transactionStorage.store(cidInfo.data_hex).signAndSend(alice);
   ```

3. **Retrieve from IPFS** using the CID:
   ```bash
   ipfs swarm connect <substrate-node-multiaddr>
   ipfs block get /ipfs/<CID> > retrieved_data.txt
   ```

## Integration with Transaction Storage

This tool is designed to work with the `pallet-transaction-storage`. Before storing data:

1. Ensure you have authorization (via `authorizeAccount` or `authorizePreimage`)
2. Calculate the CID using this tool
3. Store the data using `transactionStorage.store` with the hex-encoded data
4. Use the CID to retrieve the data from any IPFS node connected to the Bulletin chain

## Notes

- The node must be running with `--ipfs-server` flag to serve content over IPFS
- Data is retained for the `StoragePeriod` (typically 2 weeks) unless renewed
- The CID is deterministic - the same data always produces the same CID

