/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { CodeBlock, StaticOutput, SystemReply } from '../../code/react/code';
import { injectElement, injectTool } from '../../code/react/injection';
import { StaticPrompt } from '../../code/react/prompt';
import { Text } from '../../code/react/text';

import { toolLookupDnsRecords } from '../../code/tools/lookup/dns-records';
import { toolLookupIpAddress } from '../../code/tools/lookup/ip-address';
import { toolLookupZoneDomains } from '../../code/tools/lookup/zone-domains';
import { toolProtocolHttp } from '../../code/tools/protocol/http';

injectTool('tool-lookup-ip-address', toolLookupIpAddress);
injectTool('tool-protocol-http', toolProtocolHttp);
injectTool('tool-lookup-dns-records', toolLookupDnsRecords);
injectTool('tool-lookup-zone-domains', toolLookupZoneDomains);

injectElement('code-ping-example', <CodeBlock>
    <StaticPrompt>
        <StaticOutput title="The name of the command to be run.">ping</StaticOutput>{' '}
        <StaticOutput title="This option specifies the number of packets to send. If this option is not specified, ping will operate until interrupted by Ctrl+C.">-c 5</StaticOutput>{' '}
        <StaticOutput title="The target host to ping.">example.com</StaticOutput>
    </StaticPrompt>
    <SystemReply>PING example.com (93.184.216.34): 56 data bytes</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=0 ttl=50 time=87.363 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=1 ttl=50 time=88.107 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=2 ttl=50 time=87.196 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=3 ttl=50 time=88.546 ms</SystemReply>
    <SystemReply>64 bytes from 93.184.216.34: icmp_seq=4 ttl=50 time=87.811 ms</SystemReply><br/>
    <SystemReply>--- example.com ping statistics ---</SystemReply>
    <SystemReply>5 packets transmitted, 5 packets received, 0.0% packet loss</SystemReply>
    <SystemReply>round-trip min/avg/max/stddev = 87.196/87.805/88.546/0.491 ms</SystemReply>
</CodeBlock>);

injectElement('code-digest-computation', <CodeBlock>
    <StaticPrompt>
        {'{ printf \'\\x00\'; printf \'\\x01\\x01\'; printf \'\\x03\'; printf \'\\x08\'; printf \'%s\\n\' \'AwEAAa96jeuknZlaeSrvyAJj6ZHv28hhOKkx3rLGXVaC6rXTsDc449/cidltpkyGwCJNnOAlFNKF2jBosZBU5eeHspaQWOmOElZsjICMQMC3aeHbGiShvZsx4wMYSjH8e7Vrhbu6irwCzVBApESjbUdpWWmEnhathWu1jo+siFUiRAAxm9qyJNg/wOZqqzL/dL/q8PkcRU5oUKEpUge71M3ej2/7CPqpdVwuMoTvoB+ZOT4YeGyxMvHmbrxlFzGOHOijtzN+u1TQNatX2XBuzZNQ1K+s2CXkPIZo7s6JgZyvaBevYtxPvYLw4z9mR7K2vaF18UYH9Z9GNUUeayffKC73PYc=\' | openssl base64 -d; } | openssl sha256 -r | awk \'{print toupper($1)}\''}
    </StaticPrompt>
    <SystemReply>683D2D0ACB8C9B712A1948B27F741219298D0A450D612C483AF444A4C0FB2B16</SystemReply>
</CodeBlock>);

injectElement('code-dig-without-dnssec-validation', <CodeBlock>
    <StaticPrompt>
        <StaticOutput title="The name of the command to be run.">dig</StaticOutput>{' '}
        <StaticOutput title="The domain name whose DNS records are being queried.">dnssec-failed.org</StaticOutput>
    </StaticPrompt><br/>
    <SystemReply>; &lt;&lt;&gt;&gt; DiG 9.10.6 &lt;&lt;&gt;&gt; dnssec-failed.org</SystemReply>
    <SystemReply>;; global options: +cmd</SystemReply>
    <SystemReply>;; Got answer:</SystemReply>
    <SystemReply>;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, <Text.red>status: NOERROR</Text.red>, id: 34253</SystemReply>
    <SystemReply>;; flags:{' '}
        <StaticOutput title="Query/Response: This message is a response and not a query.">qr</StaticOutput>{' '}
        <StaticOutput title="Recursion Desired: The client asked the server to perform recursion.">rd</StaticOutput>{' '}
        <StaticOutput title="Recursion Available: The server supports recursion and is willing to do it.">ra</StaticOutput>;{' '}
        QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1</SystemReply><br/>
    <SystemReply>;; OPT PSEUDOSECTION:</SystemReply>
    <SystemReply>; <StaticOutput title="Extension Mechanisms for DNS">EDNS</StaticOutput>: version: 0, flags:; <StaticOutput title="The maximum UDP payload size that the server is willing to receive.">udp: 1232</StaticOutput></SystemReply>
    <SystemReply>;; QUESTION SECTION:</SystemReply>
    <SystemReply>;dnssec-failed.org.		<StaticOutput title="The class code. Each class is an independent name space. IN stands for Internet. It's the only class in widespread use today.">IN</StaticOutput>	A</SystemReply><br/>
    <SystemReply>;; ANSWER SECTION:</SystemReply>
    <SystemReply><Text.orange>dnssec-failed.org.	<StaticOutput title="The time to live (TTL) for the DNS record in seconds.">45</StaticOutput>	<StaticOutput title="The class code. Each class is an independent name space. IN stands for Internet. It's the only class in widespread use today.">IN</StaticOutput>	A	96.99.227.255</Text.orange></SystemReply><br/>
    <SystemReply>;; Query time: 367 msec</SystemReply>
    <SystemReply>
        ;; SERVER: <StaticOutput title="The identifier of the server, which provided the response. Newer versions of dig no longer show the server's name; they simply print the IP address twice.">192.168.178.1</StaticOutput>
        #<StaticOutput title="The port number the reply came from.">53</StaticOutput>
        (<StaticOutput title="The IP address of the server, which provided the response. In this case, it's the IP address of my router.">192.168.178.1</StaticOutput>)
    </SystemReply>
    <SystemReply>;; WHEN: Thu Nov 06 16:05:55 CET 2025</SystemReply>
    <SystemReply>;; <StaticOutput title="The size of the received DNS message in bytes.">MSG SIZE  rcvd: 62</StaticOutput></SystemReply>
</CodeBlock>);

injectElement('code-dig-with-dnssec-validation', <CodeBlock>
    <StaticPrompt>
        <StaticOutput title="The name of the command to be run.">dig</StaticOutput>{' '}
        <StaticOutput title="This option tells dig to query Google's public DNS resolver.">@8.8.8.8</StaticOutput>{' '}
        <StaticOutput title="The domain name whose DNS records are being queried.">dnssec-failed.org</StaticOutput>
    </StaticPrompt><br/>
    <SystemReply>; &lt;&lt;&gt;&gt; DiG 9.10.6 &lt;&lt;&gt;&gt; @8.8.8.8 dnssec-failed.org</SystemReply>
    <SystemReply>; (1 server found)</SystemReply>
    <SystemReply>;; global options: +cmd</SystemReply>
    <SystemReply>;; Got answer:</SystemReply>
    <SystemReply>;; -&gt;&gt;HEADER&lt;&lt;- opcode: QUERY, <Text.green>status: SERVFAIL</Text.green>, id: 46657</SystemReply>
    <SystemReply>;; flags:{' '}
        <StaticOutput title="Query/Response: This message is a response and not a query.">qr</StaticOutput>{' '}
        <StaticOutput title="Recursion Desired: The client asked the server to perform recursion.">rd</StaticOutput>{' '}
        <StaticOutput title="Recursion Available: The server supports recursion and is willing to do it.">ra</StaticOutput>;{' '}
        QUERY: 1, ANSWER: 0, AUTHORITY: 0, ADDITIONAL: 1</SystemReply><br/>
    <SystemReply>;; OPT PSEUDOSECTION:</SystemReply>
    <SystemReply>; <StaticOutput title="Extension Mechanisms for DNS">EDNS</StaticOutput>: version: 0, flags:; <StaticOutput title="The maximum UDP payload size that the server is willing to receive.">udp: 512</StaticOutput></SystemReply>
    <SystemReply>
        <Text.blue>
            ; <StaticOutput title="The option code 15 stands for Extended DNS Errors (EDE).">OPT=15</StaticOutput>: <StaticOutput title="The error code of Extended DNS Errors (EDE)." className="text-underline">00 09</StaticOutput>{' '}
            <StaticOutput title="A human-readable explanation of the error encoded in UTF-8 and printed in hexadecimal.">
                4e 6f 20 44 4e 53 4b 45 59 20 6d 61 74 63 68 65 73 20 44 53<br/>
                20 52 52 73 20 6f 66 20 64 6e 73 73 65 63 2d 66 61 69 6c 65 64 2e 6f 72 67<br/>
            </StaticOutput>
            (<StaticOutput title="The text encoded by the previous bytes.">"..No DNSKEY matches DS RRs of dnssec-failed.org"</StaticOutput>)
        </Text.blue>
    </SystemReply>
    <SystemReply>;; QUESTION SECTION:</SystemReply>
    <SystemReply>;dnssec-failed.org.		<StaticOutput title="The class code. Each class is an independent name space. IN stands for Internet. It's the only class in widespread use today.">IN</StaticOutput>	A</SystemReply><br/>
    <SystemReply>;; Query time: 256 msec</SystemReply>
    <SystemReply>
        ;; SERVER: <StaticOutput title="The identifier of the server, which provided the response. Newer versions of dig no longer show the server's name; they simply print the IP address twice.">8.8.8.8</StaticOutput>
        #<StaticOutput title="The port number the reply came from.">53</StaticOutput>
        (<StaticOutput title="The IP address of the server, which provided the response. In this case, it's the IP address of Google's public DNS server.">8.8.8.8</StaticOutput>)
    </SystemReply>
    <SystemReply>;; WHEN: Thu Nov 06 17:23:46 CET 2025</SystemReply>
    <SystemReply>;; <StaticOutput title="The size of the received DNS message in bytes.">MSG SIZE  rcvd: 97</StaticOutput></SystemReply>
</CodeBlock>);
