# UDP Multicast Example Code

This repository is dedicated to my working examples of how to do multicast messaging in Node.js using the `dgram` module. I found limited documentation on how exactly each part of this works, so this is my reference, both for myself and anyone else who needs it, on how to write multicast code.

So far I have only had consistent success with IPv4 multicasting. I fully plan to keep trying to get an IPv6 version of this code working, but so far my results have been extremely mixed. I can't tell whether it's the Raspbian network stack, my router, something I'm doing wrong in my code (that's most likely at least one of the issues), or just Ether gremlins playing games. I also suspect that IPv6 support in Node is not quite as complete as it could be yet.

## How to Use

Just run `node multicast-ipv4.js` on one or more machines on your network and each instance will try to talk to the others. I usually test it between my main Windows 10 development computer and at least one Raspberry Pi. If they are able to see the messages from each other, you will see each machine print out the hostnames and addresses of its peers that it receives messages from.

Feel free to modify and adapt this code for your own projects; this is not a complete software product in itself, but rather a reference design that documents how to do this particular task. I sincerely hope it's useful!
