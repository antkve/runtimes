async function run(nodeName, networkInfo, args) {
    const {wsUri, userDefinedTypes} = networkInfo.nodesByName[nodeName];
    const api = await zombie.connect(wsUri, userDefinedTypes);

    const expectedCodeHash = args.codeHash;
    
    while (true) {
        console.log(" Checking for authorized upgrade... expectedCodeHash: " + expectedCodeHash);
        const authorizedUpgrade = await api.query.system.authorizedUpgrade();

        if (expectedCodeHash && authorizedUpgrade.isSome) {
            const authorization = authorizedUpgrade.unwrap();
            console.log(" Found authorization with codeHash: " + authorization);

            if (expectedCodeHash === authorization.codeHash) {
                console.log(" Ok - Expected code hash matched: " + expectedCodeHash);
                return true;
            }
        }

        if (!expectedCodeHash && authorizedUpgrade.isNone) {
            console.log(" No authorized upgrade found");
            return true;
        }

        // else sleep and retry
        await new Promise((resolve) => setTimeout(resolve, 6000));
    }
}

module.exports = { run }
