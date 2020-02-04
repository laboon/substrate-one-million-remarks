const{ ApiPromise, WsProvider, Keyring } = require('@polkadot/api');

// Swap out to use real Kusama network
const provider = new WsProvider('ws://localhost:9944');
// const provider = new WsProvider('wss://kusama-rpc.polkadot.io/');


// Asynchronous function, connect to provider (specified above)
async function connect() {
    const api = await ApiPromise.create({ provider })

    const keyring = new Keyring({ type: 'sr25519' });

    const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

    return [api, keyring, alice];

}

// Given a hex color (e.g. 0x00ff00), split into its
// constituent bytes (e.g. 0x00, 0xff, 0x00) in
// order to send the bytes over the network

function splitColor(col) {
    str = ("000000" + col.toString(16)).substr(-6);
    console.log('Color str: ', str);
    return [parseInt(str.substring(0,2), 16),
	    parseInt(str.substring(2,4), 16),
   	    parseInt(str.substring(4,6), 16)];
}

// Given x, y coordinates, translate into the three
// byte format expected by remarkable.

// The remarkable drawing program expects to see
// bytes whose hex equivalents are read as decimal.
// This is a bit odd, but will make sense if you see
// some examples.
// Let's say you want to draw at point 10, 10.  Think
// of a six-character string storing this - "010010".
// Split into two-character groupings - "01", "00", "10".
// Now assume those are hexits - 0x01, 0x00, 0x10.  This
// is the equivalent of 1, 0, 16.  Kind of weird, but
// this function takes care of it for you.
// 100, 100 -> [16, 1, 0]
// 87, 400 -> [8, 116, 0]
// 131, 131 -> [19, 17, 49]

function splitCoord(x, y) {
    strX = ("000" + x.toString(10)).substr(-3);
    strY = ("000" + y.toString(10)).substr(-3);
    str = strX + strY; // concatenate
    console.log('Coord str: ', str);
    return [parseInt(str.substring(0,2), 16),
	    parseInt(str.substring(2,4), 16),
   	    parseInt(str.substring(4,6), 16)];
}

// Helper function - given an array of integers, print out each
// element in the array as a two-digit hex string
function printHex(arr) {
    return arr.map(x => ("00" + x.toString(16)).substr(-2));
}

// Given a link to the API, the keyring, the user you
// want to call the network as, coordinates, and color,
// broadcast a message to the network which can be
// captured by the remarkable app.
async function draw(api, keyring, user, x, y, col) {

    var color = splitColor(col);
    var coord = splitCoord(x, y);

    console.log('Color: ', printHex(color));
    console.log('Coord: ', printHex(coord));
    
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

		  unsub();
	      }
	  });
    return 1;

}

// Start program
(async () => {

    // Connect to the network
    var results = await connect();

    const api = results[0];
    const keyring = results[1];
    const alice = results[2];

    const max = 20;
    var j = 0;
    // draw white diagonal line (upper left -> bottom right)
    for (j = 0; j < max; j++) {
	console.log("j: ", j);
	results = draw(api, keyring, alice, j, j, 0xffffff);

	results = await new Promise(r => setTimeout(r, 7000));
    }
    // draw red diagonal line (bottom left -> upper right)
    for (j = 0; j < max; j++) {
	console.log("j: ", j);
	results = draw(api, keyring, alice, max - j, j, 0xff0000);

	results = await new Promise(r => setTimeout(r, 7000));
    }

    process.exit();
})()

