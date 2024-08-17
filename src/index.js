/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import Web3, { Contract } from 'web3';
import { abi } from './abi';
import { Buffer } from 'buffer';

const bnbTestnetURL = 'https://bsc-testnet.infura.io/v3/1ddf63d5b50c465999dee923349bf352';

const bnbMainnetURL = 'https://bsc-mainnet.infura.io/v3/1ddf63d5b50c465999dee923349bf352';
const contractAddress = '0xE4429DEd21a6e7bf7d187CeD5b74c40Cd27f0190';

const web3 = new Web3(bnbMainnetURL);
const contract = new web3.eth.Contract(abi, contractAddress);

export default {
	async fetch(request, env, ctx) {
		console.log('keccak: ', web3.utils.keccak256('dealwithme'));
		console.log('sid: ', web3.utils.keccak256('.bnb'));
		const hello = web3.utils.keccak256('xenosgeck');
		const baseNode = '0xdba5666821b22671387fe7ea11d7cc41ede85a5aa67c3e7b3d68ce6a661f389c';
		console.log('spaceid: ', web3.utils.keccak256(web3.utils.encodePacked(baseNode, hello)));

		const node = web3.utils.keccak256(web3.utils.encodePacked(baseNode, hello));

		// get DNS records from web3
		let output = '0x';
		const nameHex = Buffer.from('xenosgeck.bnb', 'utf-8').toString('hex');
		// output += toHex(recordHex.length / 2);
		output += web3.utils.padLeft(Number(nameHex.length / 2).toString(16), 2);
		output += nameHex;
		output += '00';
		const nameHash = web3.utils.keccak256(output);
		console.log(nameHash);
		const dnsRecord = await contract.methods.dnsRecord(node, nameHash, 16).call();
		console.log(dnsRecord);

		return new Response('Hello World!!!');
	},
};
