const DOT_DECIMAL_PLACES = 1000000000000;

// Note addition of Keyring
const{ ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

(async () => {


    const provider = new WsProvider('ws://localhost:9944');

    const api = await ApiPromise.create({ provider })

    const keyring = new Keyring({ type: 'sr25519' });

    const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

    console.log(`${alice.meta.name}: has address ${alice.address} with publicKey [${alice.publicKey}]`);


    const unsub = await api.tx.system
	  .remark([0x13, 0x37, 0x12, 0x51, 0x25, 0xcc, 0xcc, 0xcc])
	  .signAndSend(alice, ({ events = [], status }) => {
	      console.log(`Current status is ${status.type}`);

	      if (status.isFinalized) {
		  console.log(`Transaction included at blockHash ${status.asFinalized}`);

		  events.forEach(({ phase, event: { data, method, section } }) => {
		      console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
		  });

		  unsub();
	      }
	  });

    
    
    // const unsub = await api.system
    // 	  .remark("1337150150cccccc")
    // 	  .signAndSend(user, ({ events = [], status }) => {
    // 	      console.log(`Current status is ${status.type}`);

    // 	      if (status.isFinalized) {
    // 		  console.log(`Extrinsic included at blockHash ${status.asFinalized}`);

    // 		  events.forEach(({ phase, event: { data, method, section } }) => {
    // 		      console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
    // 		  });

    // 		  unsub();
    // 	      }
    // 	  });

})()
