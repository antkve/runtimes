async function run(nodeName, networkInfo, args) {
    const {wsUri, userDefinedTypes} = networkInfo.nodesByName[nodeName];
    const api = await zombie.connect(wsUri, userDefinedTypes);

    const expectedCodeHash = args.codeHash;
    
    console.log(" Checking for authorized upgrade...");
    const authorizedUpgrade = await api.query.system.authorizedUpgrade();

    if (authorizedUpgrade.isSome) {
        const authorizedCodeHash = authorizedUpgrade.unwrap();
        console.log(" Found authorized upgrade with codeHash: " + authorizedCodeHash);
        
        if (expectedCodeHash && expectedCodeHash === authorizedCodeHash.toString()) {
            console.log(" Ok - Expected code hash matched: " + expectedCodeHash);
            return true;
        } else if (expectedCodeHash && expectedCodeHash !== authorizedCodeHash.toString()) {
            throw new Error("Wrong authorized code hash! Expected: " + expectedCodeHash + " actual: " + authorizedCodeHash.toString());
        } else {
            // if no expected hash provided, return true
            console.log(" Current authorized code hash: " + authorizedCodeHash.toString());
            return true;
        }
    } else {
        console.log(" No authorized upgrade found");
        if (expectedCodeHash) {
            throw new Error("Expected authorized upgrade with hash: " + expectedCodeHash + " but none found");
        }
        return true;
    }
}

module.exports = { run }
