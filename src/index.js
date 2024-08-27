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
import { namehash } from 'viem';

const bnbTestnetURL = 'https://bsc-testnet.infura.io/v3/1ddf63d5b50c465999dee923349bf352';

const bnbMainnetURL = 'https://bsc-mainnet.infura.io/v3/1ddf63d5b50c465999dee923349bf352';
const contractAddress = '0xE4429DEd21a6e7bf7d187CeD5b74c40Cd27f0190';

const web3 = new Web3(bnbMainnetURL);
const contract = new web3.eth.Contract(abi, contractAddress);

export default {
	async fetch(request, env, ctx) {
		const url = new URL(request.url);
		const hostname = url.hostname.split('.gnfd.xyz');

		const pathname = url.pathname === '/' ? 'index.html' : url.pathname;

		if (pathname.includes('/view')) {
			let response = await caches.default.match(request);
			if (!response) {
				response = await fetch(`https://gnfd-testnet-sp2.nodereal.io${pathname}`);
				ctx.waitUntil(caches.default.put(request, response.clone()));
			}
			return response;
		} else {
			// const originRequest = new Request(request)
			// originRequest.headers.delete("cookie")
			// return await fetch(`https://gnfd-testnet-sp2.nodereal.io/view/gnfd-press-helllo-world-test-xeo${pathname}`)

			let bnb_hostname = '';
			let bnb_host = '';
			if (hostname.length > 1) {
				bnb_hostname = hostname[0] + '.bnb';
				bnb_host = hostname[0];
			}

			// const hello = web3.utils.keccak256(bnb_host);
			// const baseNode = '0xdba5666821b22671387fe7ea11d7cc41ede85a5aa67c3e7b3d68ce6a661f389c';
			// const node = web3.utils.keccak256(web3.utils.encodePacked(baseNode, hello));
			const node = namehash(bnb_hostname)

			// get DNS records from web3
			let output = '0x';
			const nameHex = Buffer.from(bnb_hostname, 'utf-8').toString('hex');
			// output += toHex(recordHex.length / 2);
			output += web3.utils.padLeft(Number(nameHex.length / 2).toString(16), 2);
			output += nameHex;
			output += '00';
			const nameHash = web3.utils.keccak256(output);
			console.log(nameHash);
			const dnsRecord = await contract.methods.dnsRecord(node, nameHash, 16).call();
			console.log('DNS: ', dnsRecord);

			if (dnsRecord !== '0x') {
				// Decode TXT
				const payload = dnsRecord.slice(2);
				console.log(payload);

				const name_length = web3.utils.hexToNumber('0x' + payload.slice(0, 2));
				const name = Buffer.from(payload.slice(2, name_length * 2 + 3), 'hex').toString('utf-8');
				const dnsType = web3.utils.hexToNumber('0x' + payload.slice(name_length * 2 + 3, name_length * 2 + 8));
				const rrLengthIndex = name_length * 2 + 20;
				const rrLength = web3.utils.hexToNumber('0x' + payload.slice(rrLengthIndex, rrLengthIndex + 4));
				const rrDataIndex = rrLengthIndex + 4;
				const dnsTxt = Buffer.from(payload.slice(rrDataIndex, rrDataIndex + rrLength * 2 + 1), 'hex').toString('utf-8');
				const forwardURL = dnsTxt.split('=')[1];

				const finalURL = `${forwardURL}${pathname}`;
				const clean_url = finalURL.replace(/([^:]\/)\/+/g, '$1');
				console.log('forwardURL', `${clean_url}`);
				return await fetch(clean_url);
			}

			return new Response('Hello World!!!');
		}
	},
};
