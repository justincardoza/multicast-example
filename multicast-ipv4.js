/*
UDP Multicast Example Code

Just a quick example of all the little intricacies of how to do multicast
messaging, both sending and receiving, in Node.js. This file is specifically
for IPv4; IPv6 multicast is a whole 'nother beast which I will tackle
separately.

Copyright (C) 2020 Justin Cardoza
Full license is in gpl-2.0.txt
Software originally from https://justincardoza.com/

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/
const os = require('os');
const udp = require('dgram');

//https://en.wikipedia.org/wiki/Multicast_address
const multicastAddress = '239.42.42.42';
const multicastPort = 9001;
const socket = udp.createSocket({ type: 'udp4', reuseAddr: true });

socket.on('error', error => console.log(`Socket error: ${error}`));
socket.on('listening', setupSocket);
socket.on('message', handleMessage);

//If the address isn't specified, the OS will attempt to listen on all
//interfaces according to the Node.js docs.
socket.bind(multicastPort);

//Handles incoming messages, in this case by just printing them to the console.
function handleMessage(message, rInfo)
{
	console.log(`Received ${message} from ${JSON.stringify(rInfo)}`);
}

//Sends out a heartbeat message with the name of the originating computer.
function sendMessage()
{
	let message = JSON.stringify({ name: os.hostname() });
	let data = Buffer.from(message);
	socket.send(data, 0, data.length, multicastPort, multicastAddress, () => console.log(`Message sent.`));
}

//Performs initial socket setup. The socket functions called in this function
//need to be called AFTER the socket is bound, so I recommend doing this setup
//when the 'listening' event fires.
function setupSocket()
{
	let interfaces = os.networkInterfaces();
	
	console.log(`Listening on ${JSON.stringify(socket.address())}`);
	
	//If this is set to true, the sending computer will also receive a copy of
	//every packet it broadcasts. Comment out or change to true to see messages
	//echoed back to the same instance.
	socket.setMulticastLoopback(false);
	
	//Loop through all network interfaces.
	for(let interfaceName in interfaces)
	{
		console.log(`Adding memberships for interface ${interfaceName}`);
		
		//Loop through all addresses for each network interface.
		for(let interfaceAddress of interfaces[interfaceName])
		{
			//Some network adapters (for example, that VirtualBox creates)
			//cause EINVAL errors when adding multicast membership. I've
			//specifically noticed that with IPv6 sockets (which don't always
			//work at the best of times anyway), but this is a good thing to
			//have for graceful error handling in any case.
			try
			{
				//If an address is IPv4 and not an internal address (i.e. loopback)
				//then add a multicast membership to receive packets.
				if(interfaceAddress.family == 'IPv4' && !interfaceAddress.internal)
				{
					socket.addMembership(multicastAddress, interfaceAddress.address);
				}
			}
			catch(error)
			{
				console.log(`Error adding socket membership: ${JSON.stringify(error)}`);
			}
		}
	}
	
	//Send out a heartbeat message every 2 seconds.
	setInterval(sendMessage, 2000);
}
