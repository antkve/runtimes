async function run(nodeName, networkInfo, args) {
    const {wsUri, userDefinedTypes} = networkInfo.nodesByName[nodeName];
    const api = await zombie.connect(wsUri, userDefinedTypes);

    const validatorAddress = args.validatorAddress;
    while (true) {
        console.log(new Date() + " Waiting for ValidatorSet containing: " + validatorAddress);
        const validator = await api.query.validatorSet.validators(validatorAddress);
        if (validator.isSome) {
            console.log(new Date() + " Found validator: " + validatorAddress);
            return
        }

        // else sleep and retry
        await new Promise((resolve) => setTimeout(resolve, 6000));
    }
}

module.exports = { run }
