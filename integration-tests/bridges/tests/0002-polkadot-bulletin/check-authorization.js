async function run(nodeName, networkInfo, args) {
    const {wsUri, userDefinedTypes} = networkInfo.nodesByName[nodeName];
    const api = await zombie.connect(wsUri, userDefinedTypes);

    const isAuthorized = args.isAuthorized;
    const account = args.account;
    const authorization_key = { Account: account };
    while (true) {
        console.log(" Checking for authorization for a key: " + authorization_key + " isAuthorized: " + isAuthorized);
        const authorization = await api.query.transactionStorage.authorizations(authorization_key);
        if (isAuthorized && authorization.isSome) {
            console.log(" Ok - Found authorization for a key: " + authorization_key + " : " + authorization);
            return
        }
        if (!isAuthorized && authorization.isNone) {
            console.log(" Ok - Authorization not found for a key: " + authorization_key);
            return
        }

        // else sleep and retry
        await new Promise((resolve) => setTimeout(resolve, 6000));
    }
}

module.exports = { run }
