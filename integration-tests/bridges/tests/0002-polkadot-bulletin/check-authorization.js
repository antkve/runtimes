async function run(nodeName, networkInfo, args) {
    const {wsUri, userDefinedTypes} = networkInfo.nodesByName[nodeName];
    const api = await zombie.connect(wsUri, userDefinedTypes);

    const isPresent = args.isPresent;
    const validatorAddress = args.validatorAddress;
    while (true) {
        console.log(new Date() + " Checking for ValidatorSet containing(isPresent=" + isPresent + "): " + validatorAddress);
        const validator = await api.query.validatorSet.validators(validatorAddress);
        if (isPresent && validator.isSome) {
            console.log(new Date() + " Ok - Found validator: " + validatorAddress);
            return
        }
        if (!isPresent && validator.isNone) {
            console.log(new Date() + " Ok - Validator not found: " + validatorAddress);
            return
        }

        // else sleep and retry
        await new Promise((resolve) => setTimeout(resolve, 6000));
    }
}

module.exports = { run }
