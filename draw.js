const DOT_DECIMAL_PLACES = 1000000000000;

// Note addition of Keyring
const{ ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

const provider = new WsProvider('ws://localhost:9944');
// const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');

// async function createConnection

var j = 1;
console.log(j);


async function connect() {
    const api = await ApiPromise.create({ provider })

    const keyring = new Keyring({ type: 'sr25519' });

    const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

    return [api, keyring, alice];

}


function splitColor(col) {
    str = ("000000" + num).slice(-4) 
    return [1,2,3];
}

function splitCoord(x, y) {
    return [1,1,1];
}


async function draw(api, keyring, user, x, y, col) {

    var color = splitColor(col);
    var coord = splitCoord(x, y);
    
    const unsub = await api.tx.system
	  .remark([0x13, 0x37,
		   coord[0],
		   coord[1],
		   coord[2],
		   color[0],
		   color[1],
		   color[2]])
	  .signAndSend(user, ({ events = [], status }) => {
	      console.log(`Current status is ${status.type}`);

	      if (status.isFinalized) {
		  console.log(`Transaction included at blockHash ${status.asFinalized}`);

		  events.forEach(({ phase, event: { data, method, section } }) => {
		      console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
		  });

		  // unsub();
	      }
	  });
    return 1;

}

async function asyncConnect() {
    var r = await connect();
    return r;
}

async function asyncDraw(api, keyring, user, x, y, color) {
    var r = await draw(api, keyring, user, x, y, color);
    return r;
}

(async () => {

    var results = await connect();

    const api = results[0];
    const keyring = results[1];
    const alice = results[2];

    var j = 0;
    for (j = 0; j < 10; j++) {
	results = await draw(api, keyring, alice, 1, 1, 0xffffff);

	results = await new Promise(r => setTimeout(r, 7000));
    }
    process.exit();
})()
// 
