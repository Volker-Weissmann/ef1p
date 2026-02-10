---
title: The Internet
category: Technologies
author: Kaspar Etter
license: CC BY 4.0
published: 2020-08-05
modified: 2026-02-10
teaser: Learn more about this critical infrastructure, which you likely use for hours every day.
reddit: https://www.reddit.com/r/ef1p/comments/n161nn/the_internet_explained_from_first_principles/
icon: network-wired
tools: true
math: false
---

<details markdown="block" open>
<summary markdown="span" id="preface">
Preface
</summary>

I wrote this article to introduce the Internet to a non-technical audience.
In order to get everyone on board,
I first explain basic concepts, such as
[communication protocols](#communication-protocol),
[network topologies](#network-topologies),
and [signal routing](#signal-routing).
The section about [Internet layers](#internet-layers) becomes increasingly technical
and peaks with a deep dive into [DNSSEC](#domain-name-system-security-extensions).
If the beginning is too elementary for you,
then just skip ahead to more interesting sections.

Due to the nature of the topic,
this article contains a lot of acronyms.
Many of them are [three-letter acronyms (TLA)](https://en.wikipedia.org/wiki/Three-letter_acronym),
but some are longer,
which makes them extended three-letter acronyms (ETLA).
While I introduce all acronyms before using them,
you can simply hover over a TLA or an ETLA with your mouse
if you forgot what they stand for.
If you are reading this on a touch device,
you have to touch the acronym instead.

Let's get right into it:
What is a protocol?

</details>

<details markdown="block">
<summary markdown="span" id="update">
Update
</summary>

In February 2026, I made the [IP geolocation tool](#ip-geolocation) more robust,
supported [IPv6 addresses](#internet-protocol-version-6),
and added or significantly modified the following [information boxes](/#information-boxes):
[Internet Protocol version 6 (IPv6)](#internet-protocol-version-6),
[QUIC](#quic),
[public-key encryption](#public-key-encryption),
[Wi-Fi Protected Access (WPA)](#wi-fi-protected-access),
[capturing network traffic](#capturing-network-traffic),
[Domain Name System Security Extensions (DNSSEC)](#domain-name-system-security-extensions)
(including an improved [zone walking tool](#zone-walking)
and how to [compute digests](#digest-computation)),
[DNS stub resolvers](#dns-stub-resolvers),
[secure DNS connections](#secure-dns-connections),
and [DNS configuration recommendations](#dns-configuration-recommendations).

</details>


## Communication protocol


### Communication diagram

A [communication protocol](https://en.wikipedia.org/wiki/Communication_protocol)
specifies how two parties can exchange information for a specific purpose.
In particular, it determines which messages are to be transmitted in what order.
If the two parties are computers,
a formal, well-defined protocol is easiest to implement.
In order to illustrate what is going on, however,
let's first look at an informal protocol,
also known as [etiquette](https://en.wikipedia.org/wiki/Etiquette),
which we're all too familiar with:

<figure markdown="block">
{% include_relative generated/greeting-protocol-default.embedded.svg %}
<figcaption markdown="span">
[Alice and Bob](https://en.wikipedia.org/wiki/Alice_and_Bob) engage in the human greeting protocol.
</figcaption>
</figure>

This is a [sequence diagram](https://en.wikipedia.org/wiki/Sequence_diagram).
It highlights the temporal dimension of a protocol
in which messages are exchanged sequentially.


### Communication parties

It also illustrates that communication is commonly initiated by one party,
whereby the recipient responds to the requests of the initiator.
Please note that this is only the case for one-to-one protocols,
in which each message is intended for a single recipient.

<details markdown="block">
<summary markdown="span" id="broadcasting-and-information-security">
Broadcasting and information security
</summary>

There are also one-to-many protocols for [broadcasting](https://en.wikipedia.org/wiki/Broadcasting).
These are typically one-way protocols,
in which the recipients do not acknowledge the receipt of the transferred data.
Examples for such protocols are analog radio
or churches ringing their bells to indicate the time of day.
Both in the case of a single recipient and in the case of a broad target audience,
anyone with access to the physical medium and the right sensors receives the signal.
The difference is simply that,
in the former case,
entities ignore the messages
which are not addressed to them.
If the messages are not encrypted,
others can still read them, though.
And if the messages are not authenticated,
a malicious party might be able to alter them in transit.
Even when messages are encrypted and authenticated,
their exchange can still be interrupted,
by not relaying some messages
or by [jamming](https://en.wikipedia.org/wiki/Radio_jamming) the signal.
The properties Confidentiality, Integrity, and Availability
form the so-called CIA triad of [information security](https://en.wikipedia.org/wiki/Information_security).

</details>


### Communication channel

The above greeting protocol is used among humans
to establish a [communication channel](https://en.wikipedia.org/wiki/Communication_channel) for a longer exchange.
In technical jargon,
such an exchange in preparation for the actual communication is called a [handshake](https://en.wikipedia.org/wiki/Handshaking).
The greeting protocol checks the recipient's availability and willingness to engage in a conversation.
When talking to someone you have never spoken before,
it also ensures that the recipient understands your language.
I've chosen these two examples for their figurative value.
Why we actually [greet](https://en.wikipedia.org/wiki/Greeting) each other
is mainly for different reasons:
To show our good intentions by making our presence known to each other,
to signal sympathy and courtesy by asking the superficial question,
and to indicate our relative social status to each other and to bystanders.
Another benefit of asking such a question is that,
even though it's very shallow,
it makes the responder more likely to do you a favor
due to the psychological effect of
[commitment and consistency](https://www.influenceatwork.com/principles-of-persuasion/#consistency).


## Handling of anomalies


### Protocol deviation

Since your communication partner can be erratic,
a protocol needs to be able to handle deviations:

<figure markdown="block">
{% include_relative generated/greeting-protocol-deviation.embedded.svg %}
<figcaption markdown="span">
Bob gives an unexpected response (in red), from which Alice has to recover (in green).
</figcaption>
</figure>


### Data corruption

Sometimes, data becomes unintelligible in transit,
for example due to a lot of [background noise](https://en.wikipedia.org/wiki/Background_noise):

<figure markdown="block">
{% include_relative generated/greeting-protocol-repetition.embedded.svg %}
<figcaption markdown="span">
Bob asks Alice (in green) to repeat what he couldn't understand (in red).
</figcaption>
</figure>

In order to detect transmission errors,
computers typically append a [checksum](https://en.wikipedia.org/wiki/Checksum) to each message,
which the recipient then verifies.
The need to [retransmit](https://en.wikipedia.org/wiki/Retransmission_(data_networks)) messages
can be reduced by adding redundancy to messages
so that the recipient can [detect and correct small errors](https://en.wikipedia.org/wiki/Error_detection_and_correction) on their own.
A simple and very inefficient way of doing this is to repeat the content within each message several times.


### Connection loss

It can also happen that a party loses their connection permanently,
for example by moving too far away for the signal to reach the recipient.
Since a conversation requires some attention from the communication partner,
abandoning a conversation unilaterally without notifying the other party
can be misused to block them from talking to someone else for some time.
In order to avoid binding resources for a prolonged period of time
and thereby potentially falling victim to a so-called
[denial-of-service attack](https://en.wikipedia.org/wiki/Denial-of-service_attack),
computers drop connections after a configurable duration of inactivity:

<figure markdown="block">
{% include_relative generated/greeting-protocol-timeout.embedded.svg %}
<figcaption markdown="span">
Bob terminates the connection after his [timeout period](https://en.wikipedia.org/wiki/Timeout_(computing)).
</figcaption>
</figure>


### Network latency

Other times, your communication partner is simply slow, which needs to be accommodated to some degree:

<figure markdown="block">
{% include_relative generated/greeting-protocol-latency.embedded.svg %}
<figcaption markdown="span">
Bob has a high [network latency](https://en.wikipedia.org/wiki/Latency_(engineering)#Packet-switched_networks)
for his [upstream](https://en.wikipedia.org/wiki/Upstream_(networking)) messages (in blue).
</figcaption>
</figure>


### Out-of-order delivery

The following rarely occurs between humans
but as soon as messages are passed over various hops,
such as forwarding notes among pupils in a classroom,
they can arrive [out of order](https://en.wikipedia.org/wiki/Out-of-order_delivery):

<figure markdown="block">
{% include_relative generated/greeting-protocol-delay.embedded.svg %}
<figcaption markdown="span">
Bob's second message (in blue) arrives after his third message (in green).
</figcaption>
</figure>

The solution for this is to enumerate all messages,
to reorder them on arrival,
and to ask the other party to retransmit any missing messages,
as we saw [above](#data-corruption).


### Lack of interoperability

Besides defining the [syntax](https://en.wikipedia.org/wiki/Syntax) (the format),
the [semantics](https://en.wikipedia.org/wiki/Semantics) (the meaning),
and the order of the messages,
a protocol should also specify how to handle anomalies like the above.
Ambiguity in a standard
and willful deviation therefrom
result in incompatibilities between different implementations.
In combination with a lack of established standards in many areas,
which often leads to uncoordinated efforts by various parties,
incompatibilities are quite common in computer systems,
unfortunately.
This causes a lot of frustration for users and programmers,
who have to find workarounds for the encountered limitations,
but this cannot be avoided in a free market of ideas and products.


## Network topologies


### Communication network

In practice, there are almost always more than two parties
who want to communicate with each other.
Together with the connections between them,
they form a [communication network](https://en.wikipedia.org/wiki/Telecommunications_network).
For the scope of this article,
we're only interested in symmetric networks,
where everyone who can receive can also send.
This is not the case for analog radio and television networks,
where signals are broadcasted unidirectionally from the sender to the receivers.
In the case of our symmetric networks,
two entities are part of the same network
if they can communicate with each other.
If they cannot reach each other,
they belong to separate networks.


### Nodes and links

[Nodes](https://en.wikipedia.org/wiki/Node_(networking)) are the entities
that communicate with each other over communication [links](https://en.wikipedia.org/wiki/Data_link).
We can visualize this as follows:

<figure markdown="block">
{% include_relative generated/network-topology-nodes.embedded.svg %}
<figcaption markdown="span">
Two nodes (in green) are connected by a link (in yellow).
</figcaption>
</figure>

The terminology is borrowed from [graph theory](https://en.wikipedia.org/wiki/Graph_theory),
where nodes are also called vertices
and links are also called edges.
The technical term for the structure of a network is [topology](https://en.wikipedia.org/wiki/Network_topology).
Different arrangements of nodes and links lead to different characteristics of the resulting network.


### Fully connected network

A network is said to be fully connected
if every node has a direct link to every other node:

<figure markdown="block">
{% include_relative generated/network-topology-fully.embedded.svg %}
<figcaption markdown="span">
A fully connected network with five nodes and ten links.
</figcaption>
</figure>

In graph theory, such a layout is known as a [complete graph](https://en.wikipedia.org/wiki/Complete_graph).
Fully connected networks scale badly
as the number of links grows quadratically with the number of nodes.
You might have encountered the formula for the number of links before:
n · (n − 1) / 2, with n being the number of nodes in the network.
As a consequence, this topology is impractical for larger networks.


### Star network

The number of links can be reduced considerably by introducing a central node,
which forwards the communication between the other nodes.
In such a star-shaped network,
the number of links scales linearly with the number of nodes.
In other words,
if you double the number of nodes,
you also double the number of links.
In a fully connected network, you would have quadrupled the number of links.
For now, we call the newly introduced node a [router](https://en.wikipedia.org/wiki/Router_(computing)).
As we will see [later on](#hubs-switches-and-routers),
such a relaying node is called differently
depending on how it operates.
Nodes that do not forward the communication of others
form the communication endpoints of the network.

<figure markdown="block">
{% include_relative generated/network-topology-star.embedded.svg %}
<figcaption markdown="span">
A star network with five nodes, five links, and one router (in blue).
</figcaption>
</figure>

While a star network scales optimally,
it is by definition completely centralized.
If the nodes belong to more than one organization,
this topology is not desirable
as the central party exerts total control over the network.
Depending on its market power,
such a party can increase the price for its service
and censor any communication it doesn't like.
Additionally, the central node becomes a [single point of failure](https://en.wikipedia.org/wiki/Single_point_of_failure):
If it fails for whatever reason,
the whole network stops working.
Since this lowers the [availability](https://en.wikipedia.org/wiki/Availability) of the network,
the star topology should not just be avoided for political but also for technical reasons.


### Mesh network

We can avoid these drawbacks by increasing the number of nodes
which forward the communication between the endpoints:

<figure markdown="block">
{% include_relative generated/network-topology-mesh.embedded.svg %}
<figcaption markdown="span">
A mesh network with six nodes, three routers, and ten links.
</figcaption>
</figure>

In this graph, any of the three routers can go down,
and communication is still possible between the nodes
that are connected not only to the unavailable router.
There are also five links that can break one at a time
while leaving all nodes indirectly connected with each other.
Such a partially connected network allows for a flexible tradeoff
between [redundancy](https://en.wikipedia.org/wiki/Redundancy_(engineering))
and [scalability](https://en.wikipedia.org/wiki/Scalability).
It is therefore usually the preferred network topology.
Furthermore, the node marked with an asterisk is connected to two routers
in order to increase its availability.
Because of higher costs,
this is usually done only for [critical systems](https://en.wikipedia.org/wiki/Critical_system),
which provide crucial services.


## Signal routing


### Network addresses

Unlike in a fully connected network,
where each node can simply pick the right link to reach the desired node,
a network with relay nodes requires that nodes can address each other.
Even if a router relays each signal on all of its links to other nodes,
which would make it a [hub](#hubs-switches-and-routers) instead of a router,
the nodes still need a way to figure out
whether they were the intended recipient of a message.
This problem can be solved by assigning a unique identifier to each node in the network
and by extending each transmitted message with the identifier of the intended recipient.
Such an identifier is called a [network address](https://en.wikipedia.org/wiki/Network_address).
Routers [can learn](#routing-protocols) on which link to forward the communication for which node.
This works best when the addresses aren't assigned randomly
but rather reflect the
– due to its physical nature often geographical –
structure of the network:

<figure markdown="block">
{% include_relative generated/signal-routing-addresses.embedded.svg %}
<figcaption markdown="span" style="max-width: 440px;">
Nodes with addresses according to the router they're connected to.
For the sake of simplicity, I no longer draw the arrow tips on links.
</figcaption>
</figure>

We're all familiar with hierarchical addresses such as
[postal codes](https://en.wikipedia.org/wiki/Postal_code),
which are known as [ZIP Codes](https://en.wikipedia.org/wiki/ZIP_Code) in the United States,
and [telephone numbers](https://en.wikipedia.org/wiki/Telephone_number) with their
[country calling codes](https://en.wikipedia.org/wiki/List_of_country_calling_codes).
Strictly speaking, the address denotes the network link of a node and not the node itself.
This can be seen in the node on the right,
which is known as B2 to router B
and as C1 to router C.
In other words,
if a node belongs to several so-called [subnetworks](https://en.wikipedia.org/wiki/Subnetwork),
such as B and C in this example,
it also has several addresses.


### Routing tables

The process of selecting a path between two nodes across a network
is called [routing](https://en.wikipedia.org/wiki/Routing).
Routers are the nodes which perform the routing.
They maintain a [routing table](https://en.wikipedia.org/wiki/Routing_table)
so they know on which link to forward the communication for each node:

<figure markdown="block">

| Destination | Link | Cost
|-
| A1 | 1 | 4
| A2 | 2 | 2
| B\_ | 3 | 5
| B\_ | 4 | 8
| C\_ | 3 | 9
| C\_ | 4 | 6

<figcaption markdown="span">
The routing table for router A.<br>
It contains all the destinations to be reached.<br>
The links are numbered according to the above graphic.<br>
The [underscore](https://en.wikipedia.org/wiki/Underscore) serves as a placeholder for any value in this position.
</figcaption>
</figure>

This table tells router A, for example,
to forward all communications for node A2 on link 2.
It doesn't matter on which link router A receives such communications.
The router also keeps track of how costly each route is.
The cost can either be in terms of [network delay](https://en.wikipedia.org/wiki/Network_delay)
or the economic cost of the transmission,
based on what providers charge each other.
In this example, router A forwards all communications for nodes starting with C on link 4
because the associated cost is lower than the cost for link 3 via router B.

<details markdown="block">
<summary markdown="span" id="forwarding-tables">
Forwarding tables
</summary>

To be precise,
the routing table contains all routes,
even the ones which aren't optimal regarding the associated costs.
Based on this information,
a router constructs the actual [forwarding table](https://en.wikipedia.org/wiki/Forwarding_information_base),
which contains only the optimal route for each destination without its cost.
This makes the table smaller and the lookup during routing faster,
which is important for [low latency](#network-performance).

<figure markdown="block">

| Destination | Link
|-
| A1 | 1
| A2 | 2
| B\_ | 3
| C\_ | 4

<figcaption markdown="span" style="max-width: 250px;">
The forwarding table for router A,
according to the [routing table](#routing-tables) above.
</figcaption>
</figure>

</details>


### Routing protocols

Routers and the physical links between them can fail at any time,
for example because a network cable is demolished by nearby construction work.
On the other hand, new [nodes and links](#nodes-and-links) are added to [communication networks](#communication-network) all the time.
Therefore, the [routing tables](#routing-tables) of routers need to be updated continuously.
Instead of updating them manually,
routers communicate changes with each other using a [routing protocol](https://en.wikipedia.org/wiki/Routing_protocol).
For example, as soon as router A detects
that it's no longer getting a response from router C,
it updates its routing table to route all communication to C via B:

<figure markdown="block">
{% include_relative generated/signal-routing-protocols.embedded.svg %}
<figcaption markdown="span">
The link between the routers A and C failed.
</figcaption>
</figure>

<figure markdown="block">

| Destination | Link | Cost
|-
| A1 | 1 | 4
| A2 | 2 | 2
| B\_ | 3 | 5
| C\_ | 3 | 9

<figcaption markdown="span" style="max-width: 490px;">
The updated routing table of router A with the routes over the link 4 removed.
With only one route left, router A forwards all communications for C on link 3.
</figcaption>
</figure>


## Signal relaying

A signal can be [relayed through a network](https://en.wikipedia.org/wiki/Switched_communication_network)
either with [circuit switching](#circuit-switching)
or with [packet switching](#packet-switching).


### Circuit switching

In a [circuit-switched network](https://en.wikipedia.org/wiki/Circuit_switching),
a dedicated [communications channel](https://en.wikipedia.org/wiki/Communications_channel)
is established between the two parties
for the duration of the [communication session](https://en.wikipedia.org/wiki/Communication_session):

<figure markdown="block">
{% include_relative generated/signal-relaying-circuit.embedded.svg %}
<figcaption markdown="span">
A circuit-switched network with a communication channel (in orange).
</figcaption>
</figure>

The best-known example of a circuit-switched network is the early [telephone network](https://en.wikipedia.org/wiki/Telephone_network).
In order to make a call,
a [switchboard operator](https://en.wikipedia.org/wiki/Switchboard_operator)
had to connect the wires of the two telephones in order to create a closed circuit.
This has the advantage that the [delay of the signal](#network-latency) remains constant throughout the call
and that the communication is guaranteed to arrive [in the same order](#out-of-order-delivery) as it was sent.
On the other hand, establishing a dedicated circuit for each communication session
can be inefficient as others cannot utilize the claimed capacity
even when it's temporarily unused, for example when no one is speaking.


### Packet switching

In a [packet-switched network](https://en.wikipedia.org/wiki/Packet_switching),
the data to transfer is split into chunks.
These chunks are called [packets](https://en.wikipedia.org/wiki/Network_packet)
and consist of a [header](https://en.wikipedia.org/wiki/Header_(computing))
and a [payload](https://en.wikipedia.org/wiki/Payload_(computing)).
The header contains information for the delivery of the packet,
such as the [network address](#network-addresses) of the sender and the recipient.
Each router has a queue for incoming packets
and then forwards each packet according to its [routing table](#routing-tables)
or, more precisely, its [forwarding table](#forwarding-tables).
Apart from these tables,
packet-switching routers do not keep any state.
In particular, no [channels](#circuit-switching) are opened or closed on the routing level.

<figure markdown="block">
{% include_relative generated/signal-relaying-packet-request.embedded.svg %}
<figcaption markdown="span">
A packet (in orange) travels through the network from the sender to the recipient.
</figcaption>
</figure>

Since each packet is routed individually,
they can take different routes from the sender to the recipient
and arrive [out of order](#out-of-order-delivery) due to varying delays.

<figure markdown="block">
{% include_relative generated/signal-relaying-packet-response.embedded.svg %}
<figcaption markdown="span">
The response from the recipient takes a different route through the network.
</figcaption>
</figure>

Since no router has a complete view of the whole network,
it may happen that packets get stuck in an [infinite loop](https://en.wikipedia.org/wiki/Infinite_loop):

<figure markdown="block">
{% include_relative generated/signal-relaying-packet-loop.embedded.svg %}
<figcaption markdown="span">
A packet travels in a circle because of an error in one of the routing tables.
</figcaption>
</figure>

In order to avoid wasting network resources,
the header of a packet also contains a counter,
which is decreased by one every time it passes a router.
If this counter reaches zero before the packet arrives at its destination,
the router discards the packet rather than forwarding it.
Such a counter limits the lifespan of a packet by limiting the number of hops it can take
and is thus known as its [time-to-live (TTL)](https://en.wikipedia.org/wiki/Time_to_live) value.
There are also other reasons why a packet can get lost in the network.
For example, the [queue](https://en.wikipedia.org/wiki/Queue_(abstract_data_type)) of a router might simply be full,
which means that additional packets can no longer be stored
and must be dropped.
Because packets are similar to cars on the road network,
some terms are borrowed from the transportation industry:
While the capacity of a [packet-switched network](#packet-switching) can be utilized better
than the capacity of a [circuit-switched network](#circuit-switching),
too much [traffic](https://en.wikipedia.org/wiki/Network_traffic) on the network
leads to [congestion](https://en.wikipedia.org/wiki/Network_congestion).

<details markdown="block" class="avoid-break-inside" open>
<summary markdown="span" id="source-and-destination-addresses">
Source and destination addresses
</summary>

Because routers keep no records regarding the route that a packet took,
the response from the recipient has to include the address of the original sender.
In other words, the sender has to disclose its own address to the recipient
in order to be able to get a response.
This is why packets always include two addresses:
the one of the source and the one of the destination.

</details>


## Internet layers

The [Internet](https://en.wikipedia.org/wiki/Internet) is a global network of computer networks.
Its name simply means "[between](https://en.wiktionary.org/wiki/inter-) networks".
It is a [packet-switched](#packet-switching) [mesh network](#mesh-network)
with only [best-effort delivery](https://en.wikipedia.org/wiki/Best-effort_delivery).
This means that the Internet provides no guarantees about whether and in what time a packet is delivered.
[Internet service providers (ISPs)](https://en.wikipedia.org/wiki/Internet_service_provider)
provide access to the Internet for businesses and private individuals.
They maintain proprietary computer networks for their customers
and are themselves interconnected through [international backbones](https://en.wikipedia.org/wiki/Internet_backbone).
The big achievement of the Internet is making individual networks interoperable
through the [Internet Protocol (IP)](https://en.wikipedia.org/wiki/Internet_Protocol).

The Internet operates in [layers](https://en.wikipedia.org/wiki/Internet_protocol_suite).
Each layer provides certain functionalities,
which can be fulfilled by different [protocols](#communication-protocol).
Such a modularization makes it possible
to replace the protocol on one layer
without affecting the protocols on the other layers.
Because the layers above build on the layers below,
they are usually listed in the following order
but then discussed in the opposite order:

<figure markdown="block">

| Name | Purpose | Endpoints | Identifier | Example
|-
| [Application layer](#application-layer) | Application logic | Application-specific resource | Application-specific | [HTTP](#hypertext-transfer-protocol)
| [Security layer](#security-layer) | Encryption and authentication | One or both of the parties | [X.509 subject name](#public-key-infrastructure) | [TLS](#transport-layer-security)
| [Transport layer](#transport-layer) | Typically reliable data transfer | Operating-system processes | [Port number](#port-numbers) | [TCP](#transmission-control-protocol)
| [Network layer](#network-layer) | Packet routing across the Internet | Internet-connected devices | [IP address](#internet-protocol-version-4) | [IP](#network-layer)
| [Link layer](#link-layer) | Handling of the physical medium | Network interface controllers | [MAC address](#media-access-control-address) | [Wi-Fi](#link-layer)

<figcaption markdown="span">
The layers of the Internet.
They differ in their purpose,
the endpoints that communicate with each other,
and how those endpoints are identified.<br>
(Please note that I made up the [security layer](#security-layer);
it doesn't exist in the [literature](https://en.wikipedia.org/wiki/Internet_protocol_suite).
Additionally, the [network layer](https://en.wikipedia.org/wiki/Network_layer)
is also called the [Internet layer](https://en.wikipedia.org/wiki/Internet_layer).)
</figcaption>
</figure>

We'll discuss each layer separately in the following subsections.
For now, you can treat this table as an overview and summary.

Before we dive into the lowest layer,
we first need to understand what "building on the layer below" means.
[Digital data](https://en.wikipedia.org/wiki/Digital_data)
can be copied perfectly from one memory location to another.
The implementation of a specific protocol receives a chunk of data,
known as the [payload](https://en.wikipedia.org/wiki/Payload_(computing)), from the layer above
and wraps it with the information required to fulfill its purpose in the so-called [header](https://en.wikipedia.org/wiki/Header_(computing)).
The payload and the header then become the payload for the layer below,
where another protocol specifies a new header to be added.
Each of these wrappings is undone by the recipient's implementation of the respective protocol.
This can be visualized as follows:

<figure markdown="block">
{% include_relative generated/internet-layers.embedded.svg %}
<figcaption markdown="span">
A piece of data flows down through the layers on the sender side and up again on the recipient side.
</figcaption>
</figure>

While this graphic is useful to wrap your head around these concepts,
it can be misleading in two ways.
Firstly, the payload can be transformed by a specific protocol
as long as the original payload can be reconstructed by the recipient.
Examples for this are encryption and redundant encoding for automatic
[error detection and correction](https://en.wikipedia.org/wiki/Error_detection_and_correction).
Secondly, a protocol can split a payload into smaller chunks and transfer them separately.
It can even ask the sender to retransmit a certain chunk.
As long as all the chunks are recombined on the recipient side,
the protocol above can be ignorant about such a process.

As we've seen [earlier](#handling-of-anomalies),
a lot of things can go wrong in computer networks.
In the following subsections,
we'll have a closer look on how protocols
compensate for the deficiencies of the [underlying network](#packet-switching).
Before we do so, we should talk about [standardization](#request-for-comments).

<details markdown="block">
<summary markdown="span" id="request-for-comments">
Request for Comments (RFC)
</summary>

When several parties communicate with each other,
it's important that they agree on a common standard.
Standards need to be proposed, discussed, published,
and updated to changing circumstances.
I'm not aware of any laws that impose specific networking standards
outside of governmental agencies.
The Internet has an open architecture,
and technology-wise, you're free to do pretty much anything you want.
This doesn't mean, though, that others will play along.
If different companies shall adopt the same standards to improve interoperability,
it's very useful to have independent working groups,
in which proposed standards are discussed and approved.
For Internet-related standards,
such an open platform is provided by the
[Internet Engineering Task Force (IETF)](https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force)
with organizational and financial support from the
[Internet Society (ISOC)](https://en.wikipedia.org/wiki/Internet_Society).
Workshop participants and managers are typically employed by large tech companies,
which want to shape future standards.

The IETF publishes its official documents as
[Requests for Comments (RFCs)](https://en.wikipedia.org/wiki/Request_for_Comments).
This name was originally chosen to avoid a commanding appearance and to encourage discussions.
In the meantime, early versions of potential RFCs are published as
[Internet Drafts](https://en.wikipedia.org/wiki/Internet_Draft),
and RFCs are approved only after several rounds of peer review.
RFCs are numbered sequentially, and once published,
they are no longer modified.
If a document needs to be revised,
a new RFC with a new number is published.
An RFC can supersede earlier RFCs,
which are then obsoleted by the new RFC.
Sometimes, RFCs are written after the documented technique has already gained popularity.
Even though the most important Internet protocols are specified in RFCs,
their conception and style is much more pragmatic than similar documents of other
[standards organizations](https://en.wikipedia.org/wiki/Standards_organization).
The [first RFC](https://datatracker.ietf.org/doc/html/rfc1) was published in 1969.
Since then, [almost 10'000 RFCs](https://www.rfc-editor.org/rfc-index.html) have been published.
Not all RFCs define [new standards](https://en.wikipedia.org/wiki/Request_for_Comments#Standards_Track),
some are just [informational](https://en.wikipedia.org/wiki/Request_for_Comments#Informational),
some describe an [experimental proposal](https://en.wikipedia.org/wiki/Request_for_Comments#Experimental),
and others simply document the [best current practice](https://en.wikipedia.org/wiki/Request_for_Comments#Best_Current_Practice).

</details>


### Link layer

[Protocols](#communication-protocol) on the [link layer](https://en.wikipedia.org/wiki/Link_layer)
take care of delivering a packet over a direct link between [two nodes](#nodes-and-links).
Examples of such protocols are [Ethernet](https://en.wikipedia.org/wiki/Ethernet) and [Wi-Fi](https://en.wikipedia.org/wiki/Wi-Fi).
Link-layer protocols are designed to handle the intricacies of the underlying physical medium and signal.
This can be an electric signal over a copper wire,
light over an optical fiber or an electromagnetic wave through space.
The node on the other end of the link, typically a router,
removes the header of the link layer,
determines on the [network layer](#network-layer) on which link to forward the [packet](#packet-switching),
and then wraps the packet according to the protocol spoken on that link.
Link-layer protocols typically detect [bit errors](https://en.wikipedia.org/wiki/Bit_error)
caused by noise, interference, distortion, and faulty synchronization.
If several devices want to send a packet over the same medium at the same time,
the signals collide, and the packets must be retransmitted
after a randomly chosen [backoff period](https://en.wikipedia.org/wiki/Exponential_backoff).

<details markdown="block">
<summary markdown="span" id="number-encoding">
Number encoding
</summary>

Numbers are used to quantify the amount of something,
and just like you can have only more, less, or an equal amount of a quantity,
a number must be either larger than, less than, or equal to any other number
(as long as we talk about [real numbers](https://en.wikipedia.org/wiki/Real_number) only).
Numbers can therefore be thought of as [points on a line](https://en.wikipedia.org/wiki/Number_line).
While numbers as concepts exist independently of the human mind
(if we assume [mathematical realism](https://en.wikipedia.org/wiki/Philosophy_of_mathematics#Mathematical_realism)),
we need a way to express numbers when thinking, speaking, and writing about them.
We do so by assigning labels and symbols to them
according to a [numeral system](https://en.wikipedia.org/wiki/Numeral_system).
For practical reasons, we have to rely on a finite set of symbols
to represent an infinite set of numbers.
To make this possible, we have to assign meaning to the
[order](https://en.wikipedia.org/wiki/Sign-value_notation),
[position](https://en.wikipedia.org/wiki/Positional_notation), and/or
[repetition](https://en.wikipedia.org/wiki/Unary_numeral_system) of symbols.
With the exception of [tally marks](https://en.wikipedia.org/wiki/Tally_marks),
only the positional notation is relevant nowadays.

In positional notation, you have an ordered list of symbols,
representing the values from zero to the length of the list minus one.
In the commonly used [decimal numeral system](https://en.wikipedia.org/wiki/Decimal_numeral_system),
there are ten symbols, also called digits: 0, 1, 2, 3, 4, 5, 6, 7, 8, and 9.
(The name "digit" comes from the Latin "digitus", which means finger.)
As soon as you have used up all the symbols,
you create a new position, usually to the left.
The represented number is the index of the symbol in this new position
multiplied by the length of the list
plus the index of the symbol in the initial position.
Each time you went through all the symbols in the right position,
you increment the left position by one.
Two positions of ten possible symbols allow you to represent 10<sup>2</sup> = 100 numbers.
Since zero is one of them, you can encode all numbers from 0 to 99 with these two positions.
The symbol in the third position counts how many times you went through the 100 numbers.
It is thus multiplied by 10<sup>2</sup> before being added up.
The symbol in the fourth position is multiplied by 10<sup>3</sup>, and so on.
All of this should be obvious to you.
However, you might not be familiar with using less than or more than ten symbols.

The [binary numeral system](https://en.wikipedia.org/wiki/Binary_numeral_system) uses,
as [the name suggests](https://en.wikipedia.org/wiki/Arity),
only two symbols, typically denoted as 0 and 1.
You count according to the rules described above:
After 0 and 1 comes 10 and 11,
which in turn are followed by 100, 101, 110, and 111.
Each position is called a [bit](https://en.wikipedia.org/wiki/Bit),
which is short for "binary digit".
Just as with decimal numbers,
the [most significant bit](https://en.wikipedia.org/wiki/Bit_numbering#Most_significant_bit) is on the left,
the [least significant bit](https://en.wikipedia.org/wiki/Bit_numbering#Least_significant_bit) on the right.
Since there are only two elements in the list of symbols,
the [base](https://en.wikipedia.org/wiki/Radix)
for [exponentiation](https://en.wikipedia.org/wiki/Exponentiation) is 2 instead of 10.
If we count the positions from the right to the left [starting at zero](https://en.wikipedia.org/wiki/Zero-based_numbering),
each bit is multiplied by two raised to the power of its position.
For example, 1101 in binary (usually written as 1101<sub>2</sub>)
is 1 · 2<sup>3</sup> + 1 · 2<sup>2</sup> + 0 · 2<sup>1</sup> + 1 · 2<sup>0</sup> = 8 + 4 + 0 + 1 = 13 in decimal.
4&nbsp;bits allow you to represent 2<sup>4</sup> = 16 numbers, and
8 bits allow you to represent 2<sup>8</sup> = 256 numbers.

Virtually all modern computers use the binary numeral system
because each bit can be encoded as the presence or absence
of a [physical phenomenon](https://en.wikipedia.org/wiki/Bit#Physical_representation),
such as [voltage](https://en.wikipedia.org/wiki/Voltage) or
[electric current](https://en.wikipedia.org/wiki/Electric_current).
This makes [operations on binary numbers](https://en.wikipedia.org/wiki/Binary_number#Binary_arithmetic)
quite easy to implement in [electronic circuits](https://en.wikipedia.org/wiki/Electronic_circuit)
with [logic gates](https://en.wikipedia.org/wiki/Logic_gate).
Since 0 and 1 don't encode a lot of information,
the smallest unit of [computer memory](https://en.wikipedia.org/wiki/Computer_memory)
that can be addressed to load or store information
is typically a [byte](https://en.wikipedia.org/wiki/Byte),
which is a collection of eight bits.
Instead of the eight bits,
a byte is often represented for humans
as a number between 0 and 255
or as two [hexadecimal symbols](https://en.wikipedia.org/wiki/Hexadecimal).
The latter assigns one symbol to four bits.
Since 4 bits encode 16 numbers,
the 10 digits are supplemented by 6 letters,
resulting in the symbols 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, A, B, C, D, E, and F.
The F in hexadecimal notation stands for 15 in decimal notation and 1111 in binary notation.

What I just wrote applies only to [natural numbers](https://en.wikipedia.org/wiki/Natural_number),
also called [unsigned integers](https://en.wikipedia.org/wiki/Integer_(computer_science)#Value_and_representation).
[Negative integers](https://en.wikipedia.org/wiki/Integer) are included
by using the leftmost bit for the [sign](https://en.wikipedia.org/wiki/Sign_(mathematics)):
Positive numbers start with a zero, negative numbers with a one.
The [actual encoding](https://en.wikipedia.org/wiki/Two%27s_complement)
is a bit more complicated because it is chosen such
that the implementation of addition, subtraction, and multiplication
is the same for signed and unsigned integers.
[Floating point numbers](https://en.wikipedia.org/wiki/Floating-point_arithmetic)
are even more complicated and beyond the scope of this article.

</details>

<details markdown="block">
<summary markdown="span" id="media-access-control-address">
Media access control (MAC) address
</summary>

The [media access control (MAC) address](https://en.wikipedia.org/wiki/MAC_address)
is commonly used as the [network address](#network-addresses) on the [link layer](#link-layer).
It's a 48-bit number, which is typically displayed as six pairs of
[hexadecimal digits](#number-encoding).
(One hexadecimal digit represents 4 bits, so twelve hexadecimal digits represent 48 bits.)
MAC addresses are used in Ethernet, Wi-Fi, and Bluetooth to address other devices in the same network.
Historically, they were assigned by the manufacturer of the [networking device](https://en.wikipedia.org/wiki/Networking_hardware)
and then remained the same throughout the lifetime of the device.
Since this allows your device to be tracked,
operating systems started randomizing MAC addresses when scanning for Wi-Fi networks
after the revelations by [Edward Snowden](https://en.wikipedia.org/wiki/Edward_Snowden).
According to Wikipedia, [MAC address randomization](https://en.wikipedia.org/wiki/MAC_address#Randomization)
was added in iOS 8, Android 6.0, Windows 10, and Linux kernel 3.18.

</details>

<details markdown="block">
<summary markdown="span" id="hubs-switches-and-routers">
Hubs, switches, and routers
</summary>

When I talked about [network topologies](#star-network),
I simply called relaying nodes "routers",
but there are actually [three types of them](https://askleo.com/whats_the_difference_between_a_hub_a_switch_and_a_router/):
- A [hub](https://en.wikipedia.org/wiki/Ethernet_hub)
  simply relays all incoming packets to all other links.
- A [switch](https://en.wikipedia.org/wiki/Network_switch)
  remembers which MAC address it encountered on which of its links
  and forwards incoming packets only to their intended recipients.
  Like a hub, a switch also operates only on the link layer.
  To the devices in the network, it still seems
  as if they are directly connected to each other.
- A [router](https://en.wikipedia.org/wiki/Router_(computing))
  inspects and forwards packets on the network layer
  based on its [forwarding table](#forwarding-tables).
  It can thereby connect several independent networks.
  Your Wi-Fi router, for example, routes packets within your local network
  but also between your local network and the network of your Internet service provider.
  As we will cover in the [next subsection](#network-layer),
  it also provides important services,
  such as [DHCP](#dynamic-host-configuration-protocol)
  and [NAT](#network-address-translation).

</details>

<details markdown="block">
<summary markdown="span" id="maximum-transmission-unit">
Maximum transmission unit (MTU)
</summary>

[Link-layer protocols](#link-layer) usually limit the size of the [packets](#packet-switching) they can forward over the [link](#nodes-and-links).
This limit is known as the [maximum transmission unit (MTU)](https://en.wikipedia.org/wiki/Maximum_transmission_unit) of the link.
For example, the MTU of Ethernet is 1500 [bytes](#number-encoding).
If a packet is larger than the MTU,
it is split into smaller fragments by the [network layer](#network-layer).
If the network drops any of the fragments,
then the entire packet is lost.

</details>

<details markdown="block" class="avoid-break-inside">
<summary markdown="span" id="ip-over-avian-carriers">
IP over Avian Carriers (IPoAC)
</summary>

Written as an [April Fools' joke](https://en.wikipedia.org/wiki/April_Fools%27_Day),
[RFC](#request-for-comments) [1149](https://datatracker.ietf.org/doc/html/rfc1149)
describes a method for delivering packets on the [link layer](#link-layer)
using [homing pigeons](https://en.wikipedia.org/wiki/Homing_pigeon).
While this method is of no practical importance,
it shows the flexibility of the [Internet layers](#internet-layers)
and is well [worth a read](https://en.wikipedia.org/wiki/IP_over_Avian_Carriers).

</details>


### Network layer

The purpose of the [network layer](https://en.wikipedia.org/wiki/Internet_layer)
is to [route](#signal-routing) packets between endpoints.
It is the [layer](#internet-layers) that ensures interoperability between separate networks on the Internet.
As a consequence, there's only one protocol which matters on this layer:
the [Internet Protocol (IP)](https://en.wikipedia.org/wiki/Internet_Protocol).
If you want to use the Internet, you have to use this protocol
in [one](#internet-protocol-version-4) of its [versions](#internet-protocol-version-6).
As we've seen earlier, [packet switching](#packet-switching) provides only unreliable communication.
It is left to the [transport layer](#transport-layer) to compensate for this.

<details markdown="block" open>
<summary markdown="span" id="internet-protocol-version-4">
Internet Protocol version 4 (IPv4)
</summary>

The first major version of the Internet Protocol is [version 4 (IPv4)](https://en.wikipedia.org/wiki/IPv4),
which has been in use [since 1982](https://en.wikipedia.org/wiki/IPv4#History)
and still accounts for [a bit more than half](https://www.google.com/intl/en/ipv6/statistics.html) of all Internet traffic in 2025.
It uses [32-bit numbers](#number-encoding) to address [endpoints](#star-network) and [routers](#mesh-network),
which are written as four numbers between 0 and 255 separated by a dot.
These [IP addresses](https://en.wikipedia.org/wiki/IP_address)
reflect the hierarchical structure of the Internet,
which is important for efficient [routing](#signal-routing).
They are assigned by the [Internet Assigned Numbers Authority (IANA)](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority),
which belongs to the American [Internet Corporation for Assigned Names and Numbers (ICANN)](https://en.wikipedia.org/wiki/ICANN),
and by five [Regional Internet Registries (RIR)](https://en.wikipedia.org/wiki/Regional_Internet_registry).
If you're interested, you can check out the [current IPv4 address allocation](https://www.iana.org/assignments/ipv4-address-space/ipv4-address-space.xhtml).
There are just under 4.3 billion IPv4 addresses (2<sup>32</sup> = 4'294'967'296),
which are quite [unevenly distributed among countries](https://en.wikipedia.org/wiki/List_of_countries_by_IPv4_address_allocation).
Given the limited address space, we're running out of IPv4 addresses.
In order to deal with the [IPv4 address exhaustion](https://en.wikipedia.org/wiki/IPv4_address_exhaustion),
the [Internet Protocol version 6 (IPv6)](#internet-protocol-version-6) has been developed.

</details>

<details markdown="block">
<summary markdown="span" id="internet-protocol-version-6">
Internet Protocol version 6 (IPv6)
</summary>

The [Internet Protocol version 6 (IPv6)](https://en.wikipedia.org/wiki/IPv6) was first specified
in [RFC](#request-for-comments) [1883](https://datatracker.ietf.org/doc/html/rfc1883) in 1995
and has been in use [since 2003](https://en.wikipedia.org/wiki/IPv6#Deployment).
It uses 128-bit addresses,
which are represented as eight groups of four [hexadecimal digits](#number-encoding),
with the groups separated by [colons](https://en.wikipedia.org/wiki/Colon_(punctuation)).
An example IPv6 address is `2001:0DB8:0000:0000:1A2B:0000:0000:0003`.
([RFC 3849](https://datatracker.ietf.org/doc/html/rfc3849)
reserves the IPv6 address [prefix](https://en.wikipedia.org/wiki/Substring#Prefix)
`2001:0DB8` for use in documentation.)
In order to make searching and comparing IPv6 addresses in text easier,
[RFC 5952](https://datatracker.ietf.org/doc/html/rfc5952) defines a
[canonical form](https://en.wikipedia.org/wiki/Canonical_form):
- **No leading zeros**: Omit leading zeros in each group but retain at least one digit.
  We thus have `2001:DB8:0:0:1A2B:0:0:3`.
- **Lowercase**: Use lowercase letters for the hexadecimal digits.
  The example address becomes `2001:db8:0:0:1a2b:0:0:3`.
- **Zero compression**: Replace the longest sequence of consecutive `0` groups with `::`.
  Shorten as many groups as possible and don't compress a single `0` group.
  If several sequences of consecutive `0` groups have the same length, compress the first one.
  The `::` may appear only once in an IPv6 address,
  but it can appear [at the beginning](#client-server-model) or the end of an address.
  Putting these rules together, `2001:0DB8:0000:0000:1A2B:0000:0000:0003`
  should be rendered in text as `2001:db8::1a2b:0:0:3`.

As IPv6 isn't interoperable with IPv4,
the transition has been [slow but steady](https://en.wikipedia.org/wiki/IPv6_deployment),
reaching [almost 50% of traffic](https://www.google.com/intl/en/ipv6/statistics.html) in 2025.

</details>

<details markdown="block">
<summary markdown="span" id="ip-geolocation">
IP geolocation
</summary>

Because the [Internet](#internet-layers) isn't just a [protocol](#communication-protocol)
but also a [physical network](https://en.wikipedia.org/wiki/Internet_backbone),
which requires big investments in infrastructure like [fiber-optic cables](https://en.wikipedia.org/wiki/Fiber-optic_cable),
[Internet service providers (ISPs)](https://en.wikipedia.org/wiki/Internet_service_provider) used to operate regionally.
([SpaceX](https://en.wikipedia.org/wiki/SpaceX)'s [Starlink](https://en.wikipedia.org/wiki/Starlink)
is starting to change that).
To facilitate the [routing](#signal-routing) of [packets](#packet-switching),
they get assigned an [IP address range](https://en.wikipedia.org/wiki/Subnetwork) for their regional network.
This allows companies to build databases that map IP addresses to their approximate geographic location.
Unless you use a [virtual private network (VPN)](https://en.wikipedia.org/wiki/Virtual_private_network)
or an [overlay network](https://en.wikipedia.org/wiki/Overlay_network) for anonymous communication,
such as [Tor](https://www.torproject.org/),
you reveal your approximate location to every server you communicate with.
Websites such as [streaming platforms](https://en.wikipedia.org/wiki/Streaming_service_provider)
use this information to restrict the content available to you
based on the country you're visiting the site from
due to their copyright licensing agreements with content producers.

One company with such a [geolocation](https://en.wikipedia.org/wiki/Geolocation) database is [IPinfo.io](https://ipinfo.io/).
Using their free [API](https://en.wikipedia.org/wiki/Application_programming_interface),
I can tell roughly where you are.
Just leave the field in the following tool empty and click on "Locate" for this.
(If you're visiting this website via a [cellular network](https://en.wikipedia.org/wiki/Cellular_network)
or a [satellite](https://en.wikipedia.org/wiki/Satellite_internet_constellation),
the result will be less accurate.)
Alternatively, enter an [IPv4](#internet-protocol-version-4) or [IPv6](#internet-protocol-version-6)
address of interest to see its approximate location.

<div id="tool-lookup-ip-address"></div>

</details>

<details markdown="block">
<summary markdown="span" id="network-performance">
Network performance
</summary>

The [performance of a network](https://en.wikipedia.org/wiki/Network_performance)
is assessed based on the following measures:
- **[Bandwidth](https://en.wikipedia.org/wiki/Bandwidth_(computing))**
  indicates how much data can be transferred in one direction in a given amount of time.
  Unlike memory, which is measured in [bytes](#number-encoding),
  bandwidth is usually measured in [bits per second](https://en.wikipedia.org/wiki/Bits_per_second),
  which is written as bit/s or bps.
  As always, multiples of the unit can be denoted with the appropriate
  [prefix](https://en.wikipedia.org/wiki/Unit_prefix),
  such as M for mega (10<sup>6</sup>) in Mbit/s or Mbps.
- **[Latency](https://en.wikipedia.org/wiki/Latency_(engineering))**
  indicates how long it takes for a single bit to reach the recipient.
  Latency is usually determined by sending a tiny message to the recipient
  and measuring the time until a tiny response is received.
  The result is called the [round-trip time (RTT)](https://en.wikipedia.org/wiki/Round-trip_delay)
  to that particular destination,
  which includes the [one-way delay (OWD)](https://en.wikipedia.org/wiki/End-to-end_delay)
  in both directions and the time it took the recipient to process the request.
  Have a look at the [next](#propagation-delay) [two](#internet-control-message-protocol) boxes
  for more information on this.
- **[Jitter](https://en.wikipedia.org/wiki/Jitter)**
  is the undesired variation in the latency of a signal.
  On the [link layer](#link-layer), such a deviation from the periodic
  [clock signal](https://en.wikipedia.org/wiki/Clock_signal)
  is caused by the properties of the physical medium.
  The term is sometimes also used to refer to
  [variation in packet delay](https://en.wikipedia.org/wiki/Packet_delay_variation).
- The **[bit error rate](https://en.wikipedia.org/wiki/Bit_error_rate)**
  indicates the percentage of bits that are flipped during the data transfer.
  As mentioned earlier, [data corruption](#data-corruption)
  has to be detected and corrected by network protocols.

The term **[throughput](https://en.wikipedia.org/wiki/Throughput)**
is sometimes used interchangeably with bandwidth.
Other times, it's used to refer to the actual rate
at which useful data is being transferred.
The effective throughput is lower than the maximum bandwidth
due to the overhead of [headers](https://en.wikipedia.org/wiki/Header_(computing)),
packet loss and retransmission,
congestion in the network,
and the delay for [acknowledgements by the recipient](#transmission-control-protocol).

More bandwidth doesn't reduce the latency of Internet communication,
which is the crucial factor for applications such as
[algorithmic trading](https://en.wikipedia.org/wiki/Algorithmic_trading)
and [online gaming](https://en.wikipedia.org/wiki/Online_game),
where latency is called [lag](https://en.wikipedia.org/wiki/Lag_(video_games)).
The design of a [protocol](#communication-protocol) impacts its performance:
The more messages that need to be exchanged in a session,
the less throughput you get over long distances
due to the many round trips.

You can measure the speed of your Internet connection
with tools such as [speedtest.net](https://www.speedtest.net/).
A high download speed is important for watching high-definition videos
and downloading large files, such as computer games and software updates.
A high upload speed is important for participating in video calls
and uploading large files, such as videos or hundreds of pictures.
As a rule of thumb,
you can divide the number of megabits per second by ten
to get a rough estimate for actual megabytes per second
due to the aforementioned overhead.
Please keep in mind that Internet communication is routed over many [links](#nodes-and-links)
and that any of the links, including the Wi-Fi link to your own router,
can limit the overall performance.
For example, if a server you interact with has a slow connection or is very busy,
then paying more for a faster Internet at your end won't improve the situation.

</details>

<details markdown="block">
<summary markdown="span" id="propagation-delay">
Propagation delay
</summary>

The physical limit for how fast a signal can travel
is the [speed of light](https://en.wikipedia.org/wiki/Speed_of_light) in vacuum,
which is roughly 300'000 km/s or 3 · 10<sup>8</sup> m/s.
It takes light 67 ms to travel halfway around the Earth
and 119 ms to travel from [geostationary orbit](https://en.wikipedia.org/wiki/Geostationary_orbit) to Earth.
While this doesn't sound like a lot,
[propagation delay](https://en.wikipedia.org/wiki/Propagation_delay)
is a real problem for applications where [latency](#network-performance) matters,
especially because a signal often has to travel back and forth to be useful.
One party typically reacts to information received from another party,
hence it takes a full round trip for the reaction to reach the first party again.
The speed at which electromagnetic waves travel through a medium
is slower than the speed of light in vacuum.
The speed of a light pulse through an [optical fiber](https://en.wikipedia.org/wiki/Optical_fiber)
is ⅔ of the speed of light in vacuum, i.e. 2.0 · 10<sup>8</sup> m/s.
A change of electrical voltage travels slightly faster through
a [copper wire](https://en.wikipedia.org/wiki/Copper_wire)
at 2.3 · 10<sup>8</sup> m/s.
When costs allow it,
optical fibers are [often preferred](https://networkengineering.stackexchange.com/a/16440)
over copper wire because they provide higher bandwidth
over longer distances with less interference
before the signal needs to be amplified.
It remains to be seen whether [satellite constellations](https://en.wikipedia.org/wiki/Satellite_internet_constellation)
in [low-Earth-orbit (LEO)](https://en.wikipedia.org/wiki/Low_Earth_orbit),
such as [SpaceX](https://en.wikipedia.org/wiki/SpaceX)'s [Starlink](https://en.wikipedia.org/wiki/Starlink),
will be able to provide lower-latency transcontinental connections
by using [laser communication in space](https://en.wikipedia.org/wiki/Laser_communication_in_space).
If they succeed, the financial industry will happily pay whatever it costs to use it.

</details>

<details markdown="block">
<summary markdown="span" id="internet-control-message-protocol">
Internet Control Message Protocol (ICMP)
</summary>

The [Internet Control Message Protocol (ICMP)](https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol)
is used by routers to send error messages to the sender of a [packet](#packet-switching),
for example, when a host cannot be reached
or when a packet exceeds its [time to live (TTL)](https://en.wikipedia.org/wiki/Time_to_live).
ICMP messages are attached to an [IP header](https://en.wikipedia.org/wiki/IPv4#Header),
in which the [IP protocol number](https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers)
is set to 1 according to [RFC 792](https://datatracker.ietf.org/doc/html/rfc792).
ICMP complements the Internet Protocol on the [network layer](#network-layer).
It has various [message types](https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol#Control_messages),
with two of them being commonly used to determine the round-trip time to a network destination.
The network utility to do so is called [ping](https://en.wikipedia.org/wiki/Ping_(networking_utility)).
It sends several echo requests and waits for the echo replies
before reporting statistics on packet loss and round-trip times:

<figure markdown="block">
<div id="code-ping-example"></div>
<figcaption markdown="span">

Pinging the [example.com](https://example.com/) server five times from my
[command-line interface](https://en.wikipedia.org/wiki/Command-line_interface).
The average round-trip time is around 88 ms.<br>
The first line consists of the command and options that I entered,
all the subsequent lines are output by the [ping utility](https://en.wikipedia.org/wiki/Ping_(networking_utility)).<br>
Round-trip times within the same geographical area are typically below 10 ms,
whereas it takes around 80 to 100 ms<br>
to the US East Coast and around 150 to 170 ms to the US West Coast and back from my place in central Europe.

</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="dynamic-host-configuration-protocol">
Dynamic Host Configuration Protocol (DHCP)
</summary>

Unlike the [MAC address](#media-access-control-address),
which at least historically always stayed the same,
the [IP address](#internet-protocol-version-4) of your device is different for every network it joins
as IP addresses are allocated top-down to allow for efficient [routing between networks](#signal-routing).
Instead of configuring the IP address manually every time you join another network,
your device can request an IP address from the network's router using the
[Dynamic Host Configuration Protocol (DHCP)](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)
as specified in [RFC 2131](https://datatracker.ietf.org/doc/html/rfc2131).
DHCP is an [application layer](#application-layer) protocol.

{% include image.md source="dhcp-configuration.png" caption="The DHCP configuration in the Wi-Fi preferences of [macOS](https://en.wikipedia.org/wiki/MacOS). Have a look at [NAT](#network-address-translation) for more information about the IP address." themed="true" image-max-width="750" %}

</details>

<details markdown="block" class="avoid-break-inside">
<summary markdown="span" id="address-resolution-protocol">
Address Resolution Protocol (ARP)
</summary>

When devices want to communicate with each other in the same network,
they need to know the [MAC address](#media-access-control-address) of the other devices
in order to address them on the [link layer](#link-layer).
The [Address Resolution Protocol (ARP)](https://en.wikipedia.org/wiki/Address_Resolution_Protocol)
resolves [IP addresses](#internet-protocol-version-4) to MAC addresses in the local network.
By using a special MAC address which is accepted by all devices on the local network,
any network participant can ask, for example, "Who has the IP address 192.168.1.2?".
The device which has this IP address responds, thereby sharing its MAC address.

</details>


### Transport layer


#### Operating systems

Before we can discuss the [transport layer](https://en.wikipedia.org/wiki/Transport_layer),
we first need to talk about operating systems.
The job of an [operating system (OS)](https://en.wikipedia.org/wiki/Operating_system) is to manage the
[hardware](https://en.wikipedia.org/wiki/Computer_hardware) of a computer.
The hardware of a computer includes:
- [processors](https://en.wikipedia.org/wiki/Processor_(computing)),
  such as the [central processing unit (CPU)](https://en.wikipedia.org/wiki/Central_processing_unit)
  and the [graphics processing unit (GPU)](https://en.wikipedia.org/wiki/Graphics_processing_unit),
- [memory](https://en.wikipedia.org/wiki/Computer_memory),
  such as [volatile memory](https://en.wikipedia.org/wiki/Volatile_memory)
  and [non-volatile memory](https://en.wikipedia.org/wiki/Non-volatile_memory)
  like your [solid-state drive (SSD)](https://en.wikipedia.org/wiki/Solid-state_drive),
- [input/output (I/O) devices](https://en.wikipedia.org/wiki/Input/output),
  such as a [keyboard](https://en.wikipedia.org/wiki/Computer_keyboard)
  and a [mouse](https://en.wikipedia.org/wiki/Computer_mouse) for input,
  a [monitor](https://en.wikipedia.org/wiki/Computer_monitor)
  and [speakers](https://en.wikipedia.org/wiki/Computer_speakers) for output,
- as well as a [network interface controller (NIC)](https://en.wikipedia.org/wiki/Network_interface_controller)
  to communicate with other devices on the same network.
{:.compact}

An operating system serves the following three purposes:
- **Abstraction**: It simplifies and standardizes access to the hardware,
  making it easier for engineers to develop [software](https://en.wikipedia.org/wiki/Software)
  for several [computing platforms](https://en.wikipedia.org/wiki/Computing_platform).
- **Duplication**: It provides the same hardware to all [programs](https://en.wikipedia.org/wiki/Computer_program)
  running on the same computer, while giving each program the illusion that it has the hardware just for itself.
- **Protection**: It enforces restrictions on the behavior of programs.
  For example, it can deny access to the webcam or certain parts of
  the [file system](https://en.wikipedia.org/wiki/File_system)
  unless the user has granted the necessary permissions.


#### Port numbers

When a program is being executed,
it is called a [process](https://en.wikipedia.org/wiki/Process_(computing)).
This distinction is important
because the same program can be executed several times in parallel,
which results in several processes until they terminate.
Since more than one process may want to use the network connection at the same time,
the [operating system](#operating-systems) needs a way to keep the traffic of different processes apart.
The label used for this purpose is a [16-bit integer](#number-encoding)
known as [port number](https://en.wikipedia.org/wiki/Port_(computer_networking)).
When a process sends a request to another device,
the operating system chooses an arbitrary but still unused port number
and encodes it as the source port in the transport-layer wrapping of the outgoing packet.
The recipient then has to include the same port number as the destination port in its response.
When the operating system of the requester receives this response,
it knows which process to forward the incoming packet to
because it kept track of which port numbers it used for which process.

But how does the operating system of the recipient know
what to do with the incoming packet?
The answer is registration and convention.
A process can ask the operating system to receive all incoming packets
which have a certain destination port.
If no other process has claimed this port before,
the operating system grants this port to the process.
A port can be bound to at most one process.
If it is already taken,
then the operating system returns an error.
Ports are distributed on a first-come, first-served basis.
To claim port numbers below 1024,
processes need a [special privilege](https://en.wikipedia.org/wiki/Superuser), though.
Which port to claim as a receiving process is handled by convention.
Each [application layer](#application-layer) protocol
defines one or several default ports to receive traffic on.
Wikipedia has an extensive [list of established port numbers](https://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers).

<figure markdown="block">
{% include_relative generated/operating-system.embedded.svg %}
<figcaption markdown="span">
An application process registers the [port 80](#hypertext-transfer-protocol) at the operating system and then receives a [packet](#packet-switching) on this port.
</figcaption>
</figure>


#### Client-server model

A [server](https://en.wikipedia.org/wiki/Server_(computing))
is just a [process](#port-numbers)
registered with the [operating system](#operating-systems)
to handle incoming traffic on a certain [port](#port-numbers).
It does this to provide a certain [service](https://en.wikipedia.org/wiki/Service_(systems_architecture)),
which is then requested by so-called [clients](https://en.wikipedia.org/wiki/Client_(computing)).
This is called the [client-server model](https://en.wikipedia.org/wiki/Client%E2%80%93server_model),
which contrasts with a [peer-to-peer architecture](https://en.wikipedia.org/wiki/Peer-to-peer),
where each [node](#nodes-and-links) equally provides and consumes the service.
The communication is always initiated by the client.
If the server makes a request itself,
it becomes the client in that interaction.
A server is typically accessed via a network, such as the Internet,
but it can also run on the same machine as its client.
In such a case, the client accesses the server via a so-called [loopback](https://en.wikipedia.org/wiki/Loopback),
which is a [virtual network interface](https://en.wikipedia.org/wiki/Virtual_network_interface)
where the destination is the same as the source.
The current computer is often referred to as [localhost](https://en.wikipedia.org/wiki/Localhost).
There is also a dedicated IP address for this purpose:
`127.0.0.1` in the case of [IPv4](#internet-protocol-version-4)
and `::1` in the case of [IPv6](#internet-protocol-version-6).

<figure markdown="block">
{% include_relative generated/client-server.embedded.svg %}
<figcaption markdown="span" style="max-width: 345px;">
The client requests a service provided by the server.
The client's [port number](#port-numbers) is dynamic, the server's static.
</figcaption>
</figure>

<details markdown="block" open>
<summary markdown="span" id="transmission-control-protocol">
Transmission Control Protocol (TCP)
</summary>

The problem with [packet-switched networks](#packet-switching), such as the [Internet](#internet-layers), is
that packets can get lost or [arrive out of order](#out-of-order-delivery) with an [arbitrary delay](#network-latency).
However, it is desirable for many applications
that what the receiver receives is exactly what the sender sent.
So how can we get reliable, in-order transfer of data over an unreliable network?
This is achieved by the [Transmission Control Protocol (TCP)](https://en.wikipedia.org/wiki/Transmission_Control_Protocol),
which brings the [concept of a connection](https://en.wikipedia.org/wiki/Connection-oriented_communication)
from [circuit-switched networks](#circuit-switching) to packet-switched networks.
But unlike connections in circuit-switched networks,
TCP connections are handled by the communication endpoints
without the involvement of the routers in between.

In order to provide reliable data transfer,
both the sending and the receiving [process](#port-numbers) temporarily store
outgoing and incoming packets in a [buffer](https://en.wikipedia.org/wiki/Data_buffer).
In each direction of communication,
the packets are enumerated with a so-called [sequence number](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure).
For each packet that is being transferred,
its [32-bit](#number-encoding) sequence number is encoded in the [TCP header](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#TCP_segment_structure).
This allows the recipient to reorder incoming packets which arrived out of order.
By including the sequence number
up to which they have successfully received all packets from the other party
in the TCP header as well,
each party lets the other party know
that it can remove earlier packets from its buffer.
Packets whose receipt is not acknowledged in this way are retransmitted by the sender.

TCP headers also include a [checksum](https://en.wikipedia.org/wiki/Checksum) to detect [transmission errors](#data-corruption).
On top of that,
TCP allows each party to specify
how many packets beyond the last acknowledged sequence number they are willing to receive.
This mechanism, known as [flow control](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Flow_control),
ensures that the sender does not overwhelm the receiver.
Last but not least,
the sender slows down its sending rate
when too many packets are lost
because the network might be overloaded.
This feature is called [congestion control](https://en.wikipedia.org/wiki/TCP_congestion_control).

</details>

<details markdown="block">
<summary markdown="span" id="ip-address-spoofing">
IP address spoofing
</summary>

In all the protocols we have discussed so far,
nothing ensures the authenticity of the transmitted information.
For example, an attacker can fake their identity
by encoding a different [source address](#source-and-destination-addresses)
into the [header of a packet](#packet-switching).
By posing as someone else,
the attacker might gain access to a system
that they didn't have before.
This is known as a [spoofing attack](https://en.wikipedia.org/wiki/Spoofing_attack).
On the [link layer](#link-layer),
it's called [MAC address spoofing](https://en.wikipedia.org/wiki/MAC_spoofing),
and on the [network layer](#network-layer),
it's called [IP address spoofing](https://en.wikipedia.org/wiki/IP_address_spoofing).

Since a [router](#hubs-switches-and-routers) connects different networks,
it can block packets that come from one network
but have a source address from a different network.
For packets coming from the outside but claim to be from the [local network](https://en.wikipedia.org/wiki/Local_area_network),
this is referred to as [ingress filtering](https://en.wikipedia.org/wiki/Ingress_filtering).
Ingress filtering protects internal machines from external attackers.
For outgoing packets that do not have a source address from the local network,
the term is [egress filtering](https://en.wikipedia.org/wiki/Egress_filtering).
Egress filtering protects external machines from internal attackers.
As such, the administrator of the local network has fewer incentives to implement this.

The reason why we're discussing this under the [transport layer](#transport-layer) and not earlier is
that [TCP](#transmission-control-protocol) makes the spoofing of [IP addresses](#internet-protocol-version-4) much more difficult.
The problem with encoding a wrong source address is
that the recipient sends its responses to that wrong address.
This means that unless an attacker also compromised a router close to the recipient,
they won't receive any of the response packets.
Therefore, the interaction needs to be completely predictable for the attack to succeed.
Before any actual data can be sent,
TCP first [establishes a connection](https://en.wikipedia.org/wiki/Transmission_Control_Protocol#Connection_establishment)
by exchanging a few TCP packets without a payload.
As mentioned [earlier](#communication-channel),
such preliminary communication in preparation for the actual communication is called a [handshake](https://en.wikipedia.org/wiki/Handshaking).
In a TCP handshake,
both parties choose the initial [sequence number](#transmission-control-protocol) for their outgoing packets at random.
As the sequence number consists of [32 bits](#number-encoding),
which results in more than four billion possibilities,
an attacker who doesn't see the responses from the victim
is very unlikely to guess the correct sequence number.
Thus, none of the victim's response packets will be properly acknowledged,
which leads to a failed connection on the transport layer
before the program on the [application layer](#application-layer)
gets a chance to perform what the attacker wanted.

</details>

<details markdown="block">
<summary markdown="span" id="user-datagram-protocol">
User Datagram Protocol (UDP)
</summary>

There is a second important protocol on the [transport layer](#transport-layer),
which I want to mention for the sake of completeness:
the [User Datagram Protocol (UDP)](https://en.wikipedia.org/wiki/User_Datagram_Protocol).
UDP provides connectionless and thus unreliable communication between [processes](#port-numbers),
encoding only the source and destination [port numbers](#port-numbers) together with a length field and a checksum
in [its header](https://en.wikipedia.org/wiki/User_Datagram_Protocol#UDP_datagram_structure).
It provides none of the other features of [TCP](#transmission-control-protocol),
thereby prioritizing fast delivery over reliability.
This is useful for streaming real-time data, such as a phone or video call, over the Internet.
While the quality of the call deteriorates when too many packets are [lost](#data-corruption) or [delayed](#network-latency),
there's no point in insisting on having them delivered as they cannot be played back later.
As there is no connection setup and consequently no need for a handshake,
UDP can also be used to [broadcast](#broadcasting-and-information-security) information to all devices in the same local network.
Protocols based on UDP, such as [DNS](#domain-name-system),
are often vulnerable to [IP address spoofing](#ip-address-spoofing),
which makes [amplification attacks](#amplification-attacks) possible.

</details>

<details markdown="block">
<summary markdown="span" id="network-address-translation">
Network address translation (NAT)
</summary>

In an effort to conserve [IPv4 addresses](#internet-protocol-version-4)
in order to alleviate the above-mentioned [address space exhaustion](#internet-protocol-version-4),
all devices in a local network commonly share the same [source address](#source-and-destination-addresses)
when communicating with other devices over the Internet.
This is accomplished by requiring that all communication is initiated by devices in the local network
and by having the [router](#hubs-switches-and-routers) engage in a technique known as
[network address translation (NAT)](https://en.wikipedia.org/wiki/Network_address_translation).
The basic idea is that the router maintains a mapping from the internally used IP address and [port number](#port-numbers)
to a port number it uses externally.

<figure markdown="block">

| Internal address | Internal port | External port
|:-:|:-:|:-:
| 192.168.1.2 | 58'237 | 49'391
| 192.168.1.2 | 51'925 | 62'479
| 192.168.1.4 | 64'296 | 53'154
| … | … | …
{:.table-with-vertical-border-after-column-2}

<figcaption markdown="span">
A translation table with some sample data.
</figcaption>
</figure>

For each outgoing packet,
the router checks whether it already has a mapping for the given IP address and source port.
If not, it creates a new mapping to a port number it has not recently used in its external communication.
The router then rewrites the headers of the outgoing packet
by replacing the internal IP address with its own on the [network layer](#network-layer)
and the internal port with the mapped external port on the [transport layer](#transport-layer).
For each incoming packet,
the router looks up the packet's destination port number in its translation table.
If found, it replaces the destination address and port of the packet with the found internal values
and forwards the packet to the corresponding device in the local network.
If no such entry exists, it simply drops the incoming packet.
What makes the technique a bit complicated in practice
is that the router also has to recompute all the checksums on the transport layer
and handle potential [fragmentation](#maximum-transmission-unit) on the network layer.

From a security perspective, network address translation has the desirable side effect
that the router now also acts as a [firewall](#firewall),
blocking all unsolicited incoming traffic.
This breaks symmetric end-to-end connectivity, though.
One of the core principles of the Internet is
that any device can communicate with any other device.
Given the widespread adoption of NAT,
this principle no longer holds nowadays, unfortunately.
If you still want to host a server on such a network,
you need to configure your router to forward all incoming traffic on a certain port to that machine.
This is known as [port forwarding](https://en.wikipedia.org/wiki/Port_forwarding).
The loss of end-to-end connectivity is also a problem for [peer-to-peer applications](https://en.wikipedia.org/wiki/Peer-to-peer),
which need to [circumvent NAT](https://en.wikipedia.org/wiki/NAT_traversal)
by [punching a hole](https://en.wikipedia.org/wiki/Hole_punching_(networking))
through its firewall or rely on an intermediary server to relay all communication.

Two remarks on the values used in the example translation table above:
- IP addresses starting with 192.168 are reserved for [private networks](https://en.wikipedia.org/wiki/Private_network).
  This address range is often used for local networks behind routers which perform NAT.
  As a consequence, your network settings might look quite similar to [mine](#dynamic-host-configuration-protocol).
- [Clients](#client-server-model) can use any port number they like as their source port.
  If this wasn't the case, network address translation wouldn't work.
  I've chosen the values above from the range
  that [IANA](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority) suggests
  for such [ephemeral ports](https://en.wikipedia.org/wiki/Ephemeral_port),
  namely 49'152 to 65'535.

</details>

<details markdown="block">
<summary markdown="span" id="server-on-your-personal-computer">
Server on your personal computer
</summary>

I said [above](#client-server-model) that
a server is just a process registered with the [operating system](#operating-systems)
to handle incoming traffic on a certain [port](#port-numbers).
In particular, no special hardware is required;
you can easily run a server on your personal computer.
In practice, servers run on hardware optimized for their respective task, of course.
For example, since the computers in data centers are administrated remotely most of the time,
they don't need to have a keyboard, mouse, or monitor.
But there are also other reasons besides hardware
why running a server on your personal computer is not ideal:
- **Uptime**: A server should be online all the time
  so that others can reach it at any time.
  If you host, for example,
  your personal website on your personal computer,
  you should no longer switch off your computer.
  Even restarting your computer after installing some updates
  makes your website unavailable for a short amount of time.
- **Utilization**: Unless your website is popular,
  your computer will be idle most of the time.
  In a data center, several customers can share the same machine,
  which makes better use of the hardware as well as electricity.
- **Workload**: If your website does become popular,
  your personal computer might no longer be powerful enough to serve it.
  Professional hosting providers, on the other hand,
  have experience in [balancing increased load](https://en.wikipedia.org/wiki/Load_balancing_(computing))
  across several machines.
- **Administration**: Keeping a service secure and available requires a lot of time and expertise.
  While this can be an enjoyable and at times frustrating side project,
  better leave the monitoring and maintenance of your services to experts.
- **Dynamic addresses**: Once you set up port forwarding on your router
  in order to circumvent [network address translation](#network-address-translation),
  you still face the problems that your computer gets a dynamic [IP address](#internet-protocol-version-4) from the router
  and that the router typically gets a dynamic IP address from your Internet service provider
  (see [DHCP](#dynamic-host-configuration-protocol)).
  In the local network, you can configure your router
  to assign always the same IP address to your computer based on its [MAC address](#media-access-control-address).
  As far as your public IP address is concerned,
  your [ISP](https://en.wikipedia.org/wiki/Internet_service_provider) might offer a static address at a premium.
  Otherwise, you'd have to use [Dynamic DNS](https://en.wikipedia.org/wiki/Dynamic_DNS).

In conclusion, running a production server on your ordinary computer is possible but not recommended.
However, software engineers often run a development server locally on their machine,
which they then access via the above-mentioned [loopback address](#client-server-model) from the same machine.
This allows them to [test changes locally](https://en.wikipedia.org/wiki/Deployment_environment)
before they deploy a new version of their software.

</details>

<details markdown="block">
<summary markdown="span" id="firewall">
Firewall
</summary>

A [firewall](https://en.wikipedia.org/wiki/Firewall_(computing))
permits or denies network traffic based on configured rules.
The goal is to protect the local network or machine from outside threats.
In order to compromise your system,
an attacker needs to find a hole in the firewall
and a vulnerability in a particular application.
Having multiple layers of security controls is known as
[defense in depth](https://en.wikipedia.org/wiki/Defense_in_depth_(computing)).
Depending on the firewall and the configured rules,
[packets](#packet-switching) are inspected and filtered on the [network](#network-layer), [transport](#transport-layer), or [application layer](#application-layer).
If the firewall rules are imposed by someone else,
such as a network administrator or the government,
users might resort to [tunneling](https://en.wikipedia.org/wiki/Tunneling_protocol#Circumventing_firewall_policy)
their traffic via an approved protocol.
Make sure you have the firewall enabled in the network settings of your operating system.

</details>


### Security layer

All the communication we have seen so far is neither authenticated nor encrypted.
This means that any router can read and alter the messages that pass through it.
Since the network determines the [route](#signal-routing) of the [packets](#packet-switching) rather than you as a sender,
you have no control over which companies and nations are involved in delivering them.
The lack of confidentiality is especially problematic
when using the [Wi-Fi](https://en.wikipedia.org/wiki/Wi-Fi) in a public space,
such as a restaurant or an airport,
because your device simply connects to the [wireless access point](https://en.wikipedia.org/wiki/Wireless_access_point)
of a [given network](https://en.wikipedia.org/wiki/Service_set_(802.11_network)#SSID) with the best signal.
Since your device has no way to authenticate the network,
anyone [who knows the Wi-Fi password](#wi-fi-protected-access) can impersonate the network
and then inspect and modify your traffic
by setting up a fake access point.
This is known as an [evil twin attack](https://en.wikipedia.org/wiki/Evil_twin_(wireless_networks)),
which also affects [mobile phone networks](https://www.youtube.com/watch?v=fQSu9cBaojc).
As a general principle, you should never trust the [network layer](#network-layer).

<details markdown="block" open>
<summary markdown="span" id="transport-layer-security">
Transport Layer Security (TLS)
</summary>

[Transport Layer Security (TLS)](https://en.wikipedia.org/wiki/Transport_Layer_Security)
is the main protocol to provide confidential and authenticated communication over the Internet.
Its predecessor, Secure Sockets Layer (SSL),
was developed at [Netscape](https://en.wikipedia.org/wiki/Netscape)
and released in 1995 as version 2.0.
In order to increase acceptance and adoption,
SSL was renamed to TLS in 1999 after SSL 3.0.
TLS exists in the versions 1.0, 1.1, 1.2, and 1.3.
SSL 2.0 and 3.0 as well as TLS 1.0 and 1.1 have been
[deprecated](https://en.wikipedia.org/wiki/Transport_Layer_Security#History_and_development)
over time due to security weaknesses
and should no longer be used.
While it is beyond the scope of this article
to explain how the [cryptography](https://en.wikipedia.org/wiki/Cryptography) used in TLS works,
this is what it provides:

{:#party-authentication}
- **Party authentication**: The identity of the communicating parties can be authenticated
  using [public-key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography).
  While TLS supports the authentication of both the client and the server,
  usually only the identity of the server is verified.
  To this end, the server sends a [signed](#digital-signatures) [public-key certificate](https://en.wikipedia.org/wiki/Public_key_certificate)
  to the client during the [TLS handshake](https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_handshake).
  The client then verifies whether the signature was issued by [an organization it trusts](#public-key-infrastructure).
  (You find more information on this in [these](#digital-signatures) [boxes](#public-key-infrastructure).)
  This allows the client to be fairly confident that it connected to the right server
  without the communication being intercepted by a
  [man in the middle (MITM)](https://en.wikipedia.org/wiki/Man-in-the-middle_attack).
  While the client could also present a public-key certificate,
  the client is more commonly authenticated on the [application layer](#application-layer),
  for example with [a username and a password](/email/#password-based-authentication-mechanisms).

{:#content-confidentiality}
- **Content confidentiality**: The content of the conversation is
  [encrypted](https://en.wikipedia.org/wiki/Encryption) in transit with
  [symmetric-key cryptography](https://en.wikipedia.org/wiki/Symmetric-key_algorithm).
  The [shared key](https://en.wikipedia.org/wiki/Shared_secret)
  is [generated](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange)
  by the client and the server during the TLS handshake at the start of the session.
  Please note that while the content is encrypted,
  a lot of [metadata](https://en.wikipedia.org/wiki/Metadata) is revealed
  to anyone who observes the communication between the two parties.
  An eavesdropper [learns that](https://security.stackexchange.com/a/4418/228462)
  - a TLS connection was established between the two [IP addresses](#internet-protocol-version-4),
  - the time and duration of the connection, which leaks a lot,
    given that a response often triggers follow-up connections,
  - the rough amount of data that was transferred in each direction,
  - and likely the [name of the server](https://security.stackexchange.com/a/7706/228462).
    Before TLS 1.3, the server sends its certificate to the client in plaintext.
    Even when TLS 1.3 is being used, the client [probably sent](#dns-stub-resolvers) an unencrypted [DNS query](#domain-name-system) beforehand.
    Moreover, the eavesdropper can make a [reverse DNS lookup](https://en.wikipedia.org/wiki/Reverse_DNS_lookup) of the server's IP address.
    And last but not least, the client typically [indicates the desired host name](#wireshark-sni)
    to the server so that the server knows which certificate to send back.
    As of 2025, [Encrypted Client Hello (ECH)](https://datatracker.ietf.org/doc/draft-ietf-tls-esni/) is being finalized
    to [encrypt the sensitive parts](https://blog.cloudflare.com/encrypted-client-hello/) of the client's first message, including the server name,
    if the server publishes an [encryption public key](#public-key-encryption) in the `ech` parameter
    of an [`SVCB` or `HTTPS` DNS record](#svcb-and-https-resource-records).
    Have a look at [this example](#tool-lookup-dns-records&domainName=cloudflare-ech.com&recordType=HTTPS).
  {:.compact}

{:#message-authentication}
- **Message authentication**: Each transmitted message is [authenticated](https://en.wikipedia.org/wiki/Message_authentication)
  with a so-called [message authentication code](https://en.wikipedia.org/wiki/Message_authentication_code).
  This allows each party to verify that all messages were sent by the other party
  and that the messages were not modified in transit.
  (Encryption alone usually does not guarantee
  the [integrity](https://en.wikipedia.org/wiki/Data_integrity)
  of the encrypted data because encryption generally does not protect against
  [malleability](https://en.wikipedia.org/wiki/Malleability_(cryptography)).)
  What TLS [does not provide](https://security.stackexchange.com/questions/103645/does-ssl-tls-provide-non-repudiation-service),
  however, is [non-repudiation](https://en.wikipedia.org/wiki/Non-repudiation).
  Or put another way: A party can plausibly dispute
  that it made the statements inside a TLS connection.
  This is because message authentication codes are [symmetric](https://en.wikipedia.org/wiki/Message_authentication_code#Security),
  which means that whoever can verify them can also generate them.

Since TLS requires reliable communication,
it uses [TCP](#transmission-control-protocol) on the [transport layer](#transport-layer)
– or is handled by [QUIC](#quic) over [UDP](#user-datagram-protocol).

</details>

<details markdown="block">
<summary markdown="span" id="quic">
QUIC
</summary>

[QUIC](https://en.wikipedia.org/wiki/QUIC), which is pronounced as "quick",
is a modern alternative to using [TLS](#transport-layer-security) over [TCP](#transmission-control-protocol)
with the [following features among others](https://en.wikipedia.org/wiki/QUIC#Characteristics):
- **Combined [handshake](https://en.wikipedia.org/wiki/Handshake_(computing))**:
  When running TLS over TCP,
  it takes one [round trip](#network-performance) to establish the TCP connection
  and another round trip to establish the TLS 1.3 connection inside the TCP connection.
  (A full TLS 1.2 handshake takes two round trips.)
  QUIC combines the two [handshakes](#communication-channel)
  by carrying the bytes of the TLS 1.3 handshake in its first two packets.
  [TLS 1.3](https://en.wikipedia.org/wiki/Transport_Layer_Security#TLS_1.3)
  was specified before QUIC in [RFC 8446](https://datatracker.ietf.org/doc/html/rfc8446)
  and could be used by the standardized version of QUIC as is.
  TLS libraries, on the other hand, had to be adapted to expose the information required by QUIC.
  TLS 1.3 is an integral part of QUIC, i.e. QUIC cannot be used without it.
- **Proper [multiplexing](https://en.wikipedia.org/wiki/Multiplexing)**:
  While some protocols which run over TCP, such as [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2)
  (the second major version of [HTTP](#hypertext-transfer-protocol)),
  allow several documents to be sent in parallel by interleaving them,
  a missing TCP packet in one document blocks the loading of all the documents.
  This is known as [head-of-line blocking](https://en.wikipedia.org/wiki/Head-of-line_blocking).
  QUIC solves this problem by using [UDP](#user-datagram-protocol) on the [transport layer](#transport-layer)
  and handling retransmission of lost packets for each stream within the same QUIC connection independently.
  The advantage over opening several connections to the same server is that the connection setup overhead
  (the round trip, [counterparty authentication](#transport-layer-security),
  and [key agreement](https://en.wikipedia.org/wiki/Key-agreement_protocol))
  can be shared by several streams,
  while also allowing some streams to be prioritized over others.
  To make this possible, QUIC encrypts each packet individually.
- **Connection migration**:
  Unlike TCP, which identifies a connection by the local and remote
  [IP addresses](#internet-protocol-version-4) and [port numbers](#port-numbers),
  QUIC identifies a connection typically by a connection ID in the packet header.
  This allows QUIC connections to survive [network](https://en.wikipedia.org/wiki/Local_area_network) changes,
  such as switching from a [Wi-Fi](https://en.wikipedia.org/wiki/Wireless_LAN) to a [mobile hotspot](https://en.wikipedia.org/wiki/Tethering),
  whereas TCP connections [time out](#connection-loss) and must be re-established by each client,
  causing interruptions and overhead.

QUIC was originally developed at [Google](https://en.wikipedia.org/wiki/Google) in 2012
and then standardized by the [IETF](#request-for-comments) in May 2021
in [RFC 8999](https://datatracker.ietf.org/doc/html/rfc8999),
[RFC 9000](https://datatracker.ietf.org/doc/html/rfc9000),
[RFC 9001](https://datatracker.ietf.org/doc/html/rfc9001),
and [RFC 9002](https://datatracker.ietf.org/doc/html/rfc9002).
Originally, QUIC was an acronym for Quick UDP Internet Connections.
In the IETF standards, QUIC has become the proper name of the protocol.
QUIC is the basis of [HTTP/3](https://en.wikipedia.org/wiki/HTTP/3)
(the third major version of [HTTP](#hypertext-transfer-protocol))
as specified in [RFC 9114](https://datatracker.ietf.org/doc/html/rfc9114)
and [DNS over QUIC (DoQ)](#secure-dns-connections)
as specified in [RFC 9250](https://datatracker.ietf.org/doc/html/rfc9250).
HTTP/3 is supported by all major browsers and
by [around 36% of all websites](https://w3techs.com/technologies/details/ce-http3).
[Cloudflare](https://en.wikipedia.org/wiki/Cloudflare)
(a large [content delivery network (CDN)](https://en.wikipedia.org/wiki/Content_delivery_network))
serves [around 31% of its requests](https://radar.cloudflare.com/adoption-and-usage) over HTTP/3.

While TLS is not mandatory for HTTP/2, browsers support HTTP/2 [only over TLS](https://caniuse.com/http2).
Both HTTP/2 and HTTP/3 are served on [port](#port-numbers) 443.
So how does a browser know whether a webserver supports HTTP/3 with all its advantages?
A server can advertise the protocols it supports with a [special DNS record](#svcb-and-https-resource-records).
When connecting to a webserver for the first time,
a browser can check this record or start both an HTTP/2 and an HTTP/3 connection in parallel
and abort the former when the latter succeeds.
Alternatively, a webserver can indicate its support for HTTP/3 with the HTTP response header field
[`Alt-Svc: h3=":443"`](https://datatracker.ietf.org/doc/html/rfc9114#section-3.1.1).

</details>

<details markdown="block">
<summary markdown="span" id="digital-signatures">
Digital signatures
</summary>

The essential feature of signatures is
that they are easy for the author to produce
but hard for others to forge.
Since digital information can be duplicated and appended without degradation,
a [digital signature](https://en.wikipedia.org/wiki/Digital_signature)
has to depend on the signed content.
Handwritten signatures, on the other hand,
are bound to the content simply by being on the same piece of paper/material.

Digital signature schemes consist of three
[algorithms](https://en.wikipedia.org/wiki/Algorithm):
- **Key generation**: First, the signer chooses a random private key,
  from which they can compute the corresponding public key.
  The signer should keep the private key to themself,
  while the public key can be shared with anyone.
  Both keys are usually just numbers or pairs of numbers in a certain range.
  For the digital signature scheme to be secure,
  it has to be infeasible to derive the private key from the public key.
  This requires that [one-way functions](https://en.wikipedia.org/wiki/One-way_function),
  which are easy to compute but hard to invert, exist.
  It is widely believed that this is the case,
  but we have [no proof](https://en.wikipedia.org/wiki/P_versus_NP_problem) for this yet.
  An example of such an asymmetric relationship is integer multiplication versus
  [integer factorization](https://en.wikipedia.org/wiki/Integer_factorization).
  While the former can be computed efficiently,
  the latter becomes exceedingly hard for large numbers.

<figure markdown="block">
{% include_relative generated/private-and-public-key.embedded.svg %}
<figcaption markdown="span">
The public key can be derived from the private key, but not vice versa.
</figcaption>
</figure>

- **Signing**: The signer then computes the signature for a given message
  using the private key generated in the previous step.
  The signature is also just a number or a [tuple](https://en.wikipedia.org/wiki/Tuple) of several numbers.
  Since the computation of the signature depends on the private key,
  only the person who knows the private key can produce the signature.
- **Verifying**: Anyone who has the message, the signature, and the signer's public key
  can verify that the signature was generated by the person knowing the corresponding private key.

<figure markdown="block">
{% include_relative generated/digital-signature.embedded.svg %}
<figcaption markdown="span">
A visualization of what flows into and out from the signing and the verifying algorithms (in blue).
</figcaption>
</figure>

As you can see from these algorithms,
digital signatures rely on a different
[authentication factor](https://en.wikipedia.org/wiki/Authentication#Authentication_factors)
than handwritten signatures.
While the security of handwritten signatures relies on something the signer does with their fine motor skills,
the security of digital signatures relies on something the signer knows or rather has.
In theory, a private key is a piece of information and thus knowledge.
In practice, however, a private key is usually too big to remember
and thus rather a piece of data that the user has.
Since the private key is not inherent to the signer
but rather chosen by the signer,
digital signatures require that
the signer assumes responsibility for the signed statements.
This brings us to the next topic: [public-key infrastructure](#public-key-infrastructure).

</details>

<details markdown="block">
<summary markdown="span" id="public-key-infrastructure">
Public-key infrastructure (PKI)
</summary>

How do you know that someone took responsibility
for all signatures which can be verified with a certain public key
if you have never met them in person?
In the absence of knowledge like this,
you cannot authenticate anyone over an insecure channel.
However, if you know the public key of some individuals,
you can verify whether or not they signed a certain statement.
A statement can be of the form:
"Person … told me that their public key is …".
If you know the public key of the person who signed such a statement
and if you trust this person to sign only truthful statements,
then you just learned the public key of another person.
With this technique,
you can now authenticate someone
you have never met before
as long as you have met someone before
who met that someone before.
For example, if you met Alice at some point
and received her public key directly from her,
you can authenticate Bob over an untrusted network
if Alice met Bob and confirms to you (and everyone else)
that a specific public key indeed belongs to Bob.
Whether Alice sends the signed statement with this content directly to you
or whether Bob presents this signed statement during the conversation with him doesn't matter.
Since you know the public key of Alice,
you can verify that only she could produce the signature.
In order to make the system scale better,
you can decide to also trust Bob's statements
regarding the public key of other people,
in particular if Alice decided to trust Bob in this regard.
This makes trust [transitive](https://en.wikipedia.org/wiki/Transitive_relation):
If you trust Alice and Alice trusts Bob, then you also trust Bob.

Signed statements of the above form are called
[public-key certificates](https://en.wikipedia.org/wiki/Public_key_certificate).
A widely adopted format for public-key certificates is
[X.509](https://en.wikipedia.org/wiki/X.509),
which is also used in TLS.
X.509 certificates are often displayed as follows:

{% include image.md source="digital-certificate.png" caption="The public-key certificate of [Wikipedia](https://en.wikipedia.org/wiki/Main_Page) as displayed by an older version of [Google Chrome](https://en.wikipedia.org/wiki/Google_Chrome) on [macOS](https://en.wikipedia.org/wiki/MacOS)." themed="true" image-max-width="750" %}

There are two different paradigms for issuing public-key certificates:
- **[Web of trust](https://en.wikipedia.org/wiki/Web_of_trust)**:
  As described above, you start out with no trust
  and then expand your circle of trust
  by meeting people and verifying each other's public key.
  This is done most efficiently at so-called
  [key-signing parties](https://en.wikipedia.org/wiki/Key_signing_party),
  where participants verify each other with state-issued identity documents.
  The big advantage of this paradigm is that it is completely decentralized,
  requiring no setup and no [trusted third party](https://en.wikipedia.org/wiki/Trusted_third_party).
  On the other hand, it demands a lot of diligence from individual users.
  Additionally, every user has a different view of which identity assertions can be trusted.
  While this works reasonably well for social applications such as messaging,
  such a fragmented trust landscape is not ideal for economic interactions.
- **[Certification authorities (CAs)](https://en.wikipedia.org/wiki/Certificate_authority)**:
  In the other, more common paradigm,
  manufacturers deliver their devices or operating systems
  with a [preinstalled list](https://en.wikipedia.org/wiki/Public_key_certificate#Root_programs)
  of trusted third parties to their customers.
  An employer might replace or extend this list on corporate devices.
  These trusted third parties are called certification authorities (CAs).
  While users can add and remove CAs on their own devices,
  they rarely do this – and I also recommend against messing with this list,
  as badly informed changes can compromise the security of your system.
  Organizations and individuals pay one of these CAs to assert their identity.
  A preinstalled CA, also known as a [root CA](https://en.wikipedia.org/wiki/Root_certificate),
  can also delegate the authority to certify to other entities,
  which are called intermediate CAs.
  If you have a look at the top of the above screenshot,
  you see that this is exactly what happened:
  The root CA *DigiCert High Assurance EV Root CA*
  delegated its authority with a signed certificate
  to the intermediate CA *DigiCert SHA2 High Assurance Server CA*,
  which in turn signed that the public key at the bottom of the screenshot,
  of which only the beginning is displayed by default,
  belongs to the *Wikimedia Foundation* as the subject of the certificate.
  If we check the list of root CAs,
  we see that *DigiCert High Assurance EV Root CA* is indeed among them:

{% include image.md source="root-certificates.png" caption="The list of root CAs as displayed by the preinstalled application [Keychain Access](https://support.apple.com/guide/keychain-access/welcome/mac) on [macOS](https://en.wikipedia.org/wiki/MacOS). On my Mac, this list contains 143 trusted root CAs, including the one [shown above](#digital-certificate)." themed="true" image-max-width="750" caption-max-width="580" %}

As described [above](#transport-layer-security),
the server sends its certificate to the client during the TLS handshake.
By also including the certificate of a potential intermediate CA,
the client has all the information needed to authenticate the server.
Therefore, CAs don't have to be reachable over the Internet,
which is good for the security of their signing keys
and for the reliability of the Internet.
There is a lot more to public-key certificates,
such as expiration and [revocation](https://en.wikipedia.org/wiki/Certificate_revocation_list),
but these aspects are beyond the scope of this article.

</details>

<details markdown="block">
<summary markdown="span" id="public-key-encryption">
Public-key encryption
</summary>

Another use case of [public-key cryptography](https://en.wikipedia.org/wiki/Public-key_cryptography)
besides [digital signatures](#digital-signatures) is [encryption](https://en.wikipedia.org/wiki/Encryption).
The private key and the public key are generated similarly [as before](#digital-signatures),
but a different pair of algorithms (called encryption and decryption)
allows anyone to transmit a message, which is called [plaintext](https://en.wikipedia.org/wiki/Plaintext) when it's not encrypted
and [ciphertext](https://en.wikipedia.org/wiki/Ciphertext) when it is encrypted, to a recipient so that no one else can read it.
I added this box just so that you're not confused when I use the term public key in the context of encryption.

<figure markdown="block">
{% include_relative generated/public-key-encryption.embedded.svg %}
<figcaption markdown="span">
How encryption transforms a plaintext into a ciphertext,
which can be deciphered by the recipient, who has the corresponding private key.
</figcaption>
</figure>

</details>

<details markdown="block">
<summary markdown="span" id="wi-fi-protected-access">
Wi-Fi Protected Access (WPA)
</summary>

[Wi-Fi Protected Access (WPA)](https://en.wikipedia.org/wiki/Wi-Fi_Protected_Access)
is the name of three security certification programs by the [Wi-Fi Alliance](https://en.wikipedia.org/wiki/Wi-Fi_Alliance).
Since each WPA generation maps to concrete standards, you can also think of them as three protocols.
When you see a lock symbol next to a network's name in the Wi-Fi dropdown of your [operating system](#operating-systems),
it means that the Wi-Fi network uses WPA.
As of 2025, the vast majority of Wi-Fi networks use [WPA2](https://en.wikipedia.org/wiki/Wi-Fi_Protected_Access#WPA2),
which replaced [WPA](https://en.wikipedia.org/wiki/Wi-Fi_Protected_Access#WPA) in 2004.
In a wireless network, every device within reach of the sending device [receives the signal](#broadcasting-and-information-security)
and simply ignores packets which aren't addressed to it.
However, you can use a tool such as [Wireshark](https://en.wikipedia.org/wiki/Wireshark) to [capture all packets](#capturing-network-traffic)
that your [network interface controller](https://en.wikipedia.org/wiki/Network_interface_controller) sees,
even the ones which aren't addressed to you.
While WPA2 encrypts your communication with the Wi-Fi router
using a device- and session-specific [cryptographic key](https://en.wikipedia.org/wiki/Key_(cryptography)),
anyone who knows the network's password and captured your WPA2 [handshake](#communication-channel) with the router can derive this key.
Unless [Protected Management Frames (PMF)](https://en.wikipedia.org/wiki/IEEE_802.11w-2009) is being used,
which is usually not the case in WPA2 networks,
an attacker can often trigger another handshake by sending [deauthentication frames](https://en.wikipedia.org/wiki/Wi-Fi_deauthentication_attack).
You must therefore always assume in your [threat model](https://en.wikipedia.org/wiki/Threat_model)
that other devices on your Wi-Fi network can read your communication.

[WPA3](https://en.wikipedia.org/wiki/Wi-Fi_Protected_Access#WPA3), which was introduced in 2018,
uses a [password-authenticated key exchange (PAKE)](https://en.wikipedia.org/wiki/Password-authenticated_key_agreement),
whose key cannot be derived from a captured handshake
even if the attacker knows or later learns the network's password.
Additionally, PMF is required for WPA3.
It also replaces the [Wi‑Fi Protected Setup (WPS)](https://en.wikipedia.org/wiki/Wi-Fi_Protected_Setup)
with the more secure [Device Provisioning Protocol (DPP)](https://www.netmaker.io/resources/device-provisioning-protocol-dpp)
and supports [Opportunistic Wireless Encryption (OWE)](https://en.wikipedia.org/wiki/Opportunistic_Wireless_Encryption)
for networks that aren't password-protected.
Outside of enterprise networks, WPA3 isn't widely adopted yet.

(When you click on "Advanced…" in the Wi-Fi settings of [macOS](https://en.wikipedia.org/wiki/MacOS), you see a list of known networks.
On my computer, many of them are listed with the security type "WPA3 Personal", even the network I'm currently using.
However, when I [alt-click on the Wi-Fi symbol](#guide-to-capturing-packets-on-macos) in the [menu bar](https://en.wikipedia.org/wiki/Menu_bar),
it says "Security: WPA2 Personal", which is what's actually being used.
I don't know why macOS says something else in the list of known networks.
It might be that these networks advertise support for WPA3 but still allow WPA2 for compatibility.
This just shifts the question, though, to why macOS isn't using the newer protocol
when the router supports both in [transitional mode](https://en.wikipedia.org/wiki/Wi-Fi_Protected_Access#Dragonblood).)

Neither WPA2 nor WPA3 for personal networks protects against an [evil twin attack](#security-layer)
if the attacker knows the network's password.
There are enterprise versions of these protocols, though,
where [wireless access points](https://en.wikipedia.org/wiki/Wireless_access_point) can be authenticated with [certificates](#public-key-infrastructure).
Moreover, an enhanced version of WPA3-Personal was introduced in 2020 under the name
[SAE-PK](https://www.wi-fi.org/beacon/thomas-derham-nehru-bhandaru/wi-fi-certified-wpa3-december-2020-update-brings-new-0),
which adds the [fingerprint](https://en.wikipedia.org/wiki/Public_key_fingerprint)
of a persistent [public key](#digital-signatures) to a network's configuration
and uses it to authenticate the wireless access point.

Please note that WPA protects only the wireless link to and from your [router](#hubs-switches-and-routers) on the [link layer](#link-layer).
The router decrypts WPA packets and can then inspect and alter their contents.
WPA has nothing to do with the [security layer](#security-layer).
This [information box](/#information-boxes) is here just to stress the importance of the security layer.

</details>

<details markdown="block">
<summary markdown="span" id="capturing-network-traffic">
Capturing network traffic
</summary>

After learning about [how insecure most Wi-Fi networks still are](#wi-fi-protected-access),
it's time to put theory into practice.
As you will see in this box,
it's fairly easy to record and analyze all the [packets](#packet-switching) that your computer sees on your Wi-Fi network.
Before I show you step by step how to do it,
you must be aware that unauthorized interception of third-party communications is prohibited in most jurisdictions
as most states protect the [secrecy of correspondence](https://en.wikipedia.org/wiki/Secrecy_of_correspondence).
I explain to you how do it only because seeing is believing.
Capture traffic only from your own devices in networks that you operate or for which you have explicit permission to do so.
In short: <span class="color-orange">Don't wiretap other people without their consent!</span>


##### Guide to capturing packets:

1. Download the [free and open-source](https://en.wikipedia.org/wiki/Free_and_open-source_software)
   [packet analyzer](https://en.wikipedia.org/wiki/Packet_analyzer) [Wireshark](https://en.wikipedia.org/wiki/Wireshark)
   from [this page](https://www.wireshark.org/download.html)
   and follow [its installation instructions](https://www.wireshark.org/docs/wsug_html/#ChapterBuildInstall).
2. Connect to the Wi-Fi network on which you want to capture the packets.
3. Start Wireshark, open "Options" under the [menu "Capture"](https://www.wireshark.org/docs/wsug_html/#ChUseCaptureMenuSection),
   and enable the ["Monitor Mode"](https://www.wireshark.org/docs/wsug_html/#ChCapCaptureOptions) in the column with this name
   in the row of your Wi-Fi interface.
   If it's in use, it's the only interface besides the [loopback interface](https://en.wikipedia.org/wiki/Loopback#Virtual_loopback_interface) with traffic.
   (On [macOS](https://en.wikipedia.org/wiki/MacOS), this interface is typically called `en0`.)
   Whether this allows you to capture packets on the network which aren't sent from your computer or to your computer
   depends on the [network interface controller (NIC)](https://en.wikipedia.org/wiki/Network_interface_controller),
   the [driver](https://en.wikipedia.org/wiki/Device_driver), and the [operating system](#operating-systems).
   While the monitor mode is active, you might get disconnected from your Wi-Fi network.
4. In the [“Capture Options” window](https://www.wireshark.org/docs/wsug_html/#ChCapCaptureOptions),
   select the Wi-Fi interface and click on "Start" on the bottom right.
5. If everything goes well, you should immediately see dozens of recorded packets in the upper half of the Wireshark window.
   If nothing happens and you read "no packets" in the [status bar](https://www.wireshark.org/docs/wsug_html/#ChUseStatusbarSection) at the bottom,
   follow the [next guide below](#guide-to-capturing-packets-on-macos) if you're using a [Mac](https://en.wikipedia.org/wiki/Mac_(computer))
   or troubleshoot your issue with a [large language model (LLM)](https://en.wikipedia.org/wiki/Large_language_model) otherwise.
   You can [stop capturing packets](https://www.wireshark.org/docs/wsug_html/#ChCapStopSection)
   by clicking on the red square in the toolbar or on the corresponding item in the "Capture" menu.
   If packets were captured, [continue here](#guide-to-analyzing-the-captured-packets).


##### Guide to capturing packets on [macOS](https://en.wikipedia.org/wiki/MacOS) if the above didn't work: {#guide-to-capturing-packets-on-macos}

1. On my [MacBook Pro](https://en.wikipedia.org/wiki/MacBook_Pro), Wireshark captures packets only when I disable the monitor mode.
   You can test whether the monitor mode works at all by running `sudo tcpdump -I -i en0`{:.enable-click-to-copy}
   in the [Terminal](https://en.wikipedia.org/wiki/Terminal_(macOS)).
   ([`sudo`](https://en.wikipedia.org/wiki/Sudo) runs the [`tcpdump` command](https://www.tcpdump.org/manpages/tcpdump.1.html) with maximum permissions.
   `-I` activates the monitor mode and `-i` determines the interface, namely `en0`.)
   You stop capturing packets with [Control-C](https://en.wikipedia.org/wiki/Control-C).
   If this doesn't capture any packets either, then the problem isn't with Wireshark's permissions or settings.
2. Click on the Wi-Fi symbol in the [menu bar](https://en.wikipedia.org/wiki/Menu_bar) of macOS
   while holding down the [option key (⌥)](https://en.wikipedia.org/wiki/Option_key).
   In the second line of the [drop-down menu](https://en.wikipedia.org/wiki/Drop-down_list),
   you see whether the name of your Wi-Fi interface is indeed `en0`.
   Under the network you're currently connected to,
   it should say "Security: [WPA2 Personal](#wi-fi-protected-access)" (or alternatively "Security: None").
   If this is not the case, you cannot inspect the packets sent to and from other devices in your network.
   Two lines below, you see [on which channel](https://en.wikipedia.org/wiki/List_of_WLAN_channels) your Wi-Fi operates.
   In my case, it says "Channel: 6 (2.4 GHz, 20 MHz)".
   Write down the channel number before the parentheses and the number before [MHz](https://en.wikipedia.org/wiki/Hertz) (in my case 6 and 20).
3. Open the [Wireless Diagnostics](https://support.apple.com/guide/mac-help/use-wireless-diagnostics-mchlf4de377f/mac) app of macOS.
   It's located at `/System/Library/CoreServices/Applications/`{:.enable-click-to-copy},
   but it's easier to open through the extended Wi-Fi menu as explained in the previous point
   or by using [Spotlight](https://en.wikipedia.org/wiki/Spotlight_(Apple)).
   Ignore the [wizard/assistant](https://en.wikipedia.org/wiki/Wizard_(software)) of Wireless Diagnostics;
   open the "Sniffer" under the "Window" menu of Wireless Diagnostics instead.
4. Make sure that the channel number and the channel width match the numbers that you wrote down earlier.
   (These numbers should actually match the channel of the device whose traffic you want to record.
   As long as both devices are connected to the same [access point](https://en.wikipedia.org/wiki/Wireless_access_point), the channel is the same.
   If you have a [mesh setup](https://en.wikipedia.org/wiki/Wireless_mesh_network)
   with [Wi-Fi repeaters](https://en.wikipedia.org/wiki/Wireless_repeater),
   make sure that both devices are connected to the same repeater.)
5. Click "Start" in the "Sniffer" window of Wireless Diagnostics.
   Once you're done capturing, click "Stop".
   Please note that you lose Internet connectivity while your Wi-Fi controller is in monitoring mode.
   (While the monitor mode is on, the Wi-Fi symbol in the menu bar changes to an eye.)
   The captured packets are stored in a [packet capture (.pcap)](https://en.wikipedia.org/wiki/Pcap) file in `var/tmp`{:.enable-click-to-copy}.
6. In the [Finder](https://en.wikipedia.org/wiki/Finder_(software)),
   open "Go to Folder…" (⇧⌘G) under the "Go" menu and enter `var/tmp`{:.enable-click-to-copy}.
   Open the `.pcap` file in Wireshark.
   (Wireshark should be the default application if you simply double-click the file.)


##### A few remarks on packet capturing with macOS: {#remarks-on-packet-capturing-with-macos}

- If you're stuck in monitor mode even though you've finished capturing,
  you might have to reboot your computer.
  Monitor mode is not a persistent firmware flag that survives a reboot.
  Before rebooting, [ChatGPT](https://en.wikipedia.org/wiki/ChatGPT) suggested the following,
  but none of these suggestions worked for me:
  - Turn your Wi-Fi off in the menu bar. Wait for a couple of seconds and then turn it on again.
  - Make sure that your Wi-Fi interface is indeed called `en0` by running `networksetup -listallhardwareports`{:.enable-click-to-copy}
    on your [command-line interface (CLI)](https://en.wikipedia.org/wiki/Command-line_interface).
  - Toggle the power on your Wi-Fi interface with `networksetup -setairportpower en0 off`{:.enable-click-to-copy}
    and then `networksetup -setairportpower en0 on`{:.enable-click-to-copy}.
  - Drop the interface with [ifconfig](https://en.wikipedia.org/wiki/Ifconfig):
    `sudo ifconfig en0 down`{:.enable-click-to-copy} and then `sudo ifconfig en0 up`{:.enable-click-to-copy}.
  {:.compact}
- Once you have activated the monitor mode with the Sniffer tool of Wireless Diagnostics,
  you can capture the packets with Wireshark as well.
  This allows you to see the packets as they are being received,
  which is much better for demonstrations.
- The `.pcap` files of the Sniffer tool in `/var/tmp`{:.enable-click-to-copy} persist across reboots.
  Since they may contain sensitive traffic,
  delete them manually as soon as you're done analyzing them.
- I haven't found a way to activate the monitor mode from the command line.
  [Apple](https://en.wikipedia.org/wiki/Apple_Inc.) used to ship an `airport` utility, which made this possible,
  but since around [macOS Sonoma 14.4](https://en.wikipedia.org/wiki/MacOS_Sonoma) this is no longer supported.


##### Guide to analyzing the captured packets:

1. If your Wi-Fi network is password-protected (using [WPA2 Personal](#wi-fi-protected-access)),
   open the [preferences of Wireshark](https://www.wireshark.org/docs/wsug_html/#ChCustPreferencesSection).
   Expand the "Protocols" on the left side and click on "IEEE 802.11" in the long list of supported protocols.
   Make sure that decryption is enabled.
   Then click on "Edit…" next to "Decryption keys".
   Create a new entry with the plus at the bottom, select `wpa-pwd` as the key type, and set the key to `password:name`,
   using the password and the [name](https://en.wikipedia.org/wiki/Service_set_(802.11_network)#Service_set_identifier) of your Wi-Fi network.
   Then click "OK".
2. In the [text field between the toolbar and the captured packets](https://www.wireshark.org/docs/wsug_html/#ChUseFilterToolbarSection),
   enter `eapol`{:.enable-click-to-copy} to filter for the
   [Extensible Authentication Protocol (EAP)](https://en.wikipedia.org/wiki/Extensible_Authentication_Protocol)
   [over LAN (EAPOL)](https://en.wikipedia.org/wiki/IEEE_802.1X).
   Make sure that you see four packets (numbered "Message 1" to 4) from the device whose packets you want to analyze
   if your Wi-Fi network is password-protected.
   As mentioned [earlier](#wi-fi-protected-access), the device- and session-specific encryption key can be derived only
   if the four [handshake](#communication-channel) packets were captured when the device joined the network
   (and if you know the network's password, which we told Wireshark in the previous step).
   If you don't see four EAPOL packets, [start another capture](#guide-to-capturing-packets)
   and ensure that the device of interest joins the network during the capture.
   (Just disabling Wi-Fi for a couple of seconds on the device might not be enough.
   Ideally, you join another network before re-connecting to the network on which you capture the packets.)
3. You can filter for all the packets sent from and to your other device
   by entering `wlan.addr == aa:bb:cc:dd:ee:ff`{:.enable-click-to-copy}
   using the (potentially network-specific) [MAC address](#media-access-control-address) of the device.
   If you cannot determine its MAC address from the packets that you see in Wireshark,
   look up its MAC address in the Wi-Fi settings of the device.
   (You can also filter for an [IPv4 address](#internet-protocol-version-4) with `ip.addr == …`{:.enable-click-to-copy}
   and for an [IPv6 address](#internet-protocol-version-6) with `ipv6.addr == …`{:.enable-click-to-copy}.
   The problem with this is that the device might use both IPv4 and IPv6,
   and by filtering for one, you lose the other (unless you combine them with `||`, i.e. `ip.addr == … || ipv6.addr == …`{:.enable-click-to-copy}).
   To make things worse, a device typically has several IPv6 addresses.)
4. The amount of packets that you see is likely still overwhelming.
   You can combine several filters with `&&` to narrow the packets down to what you're interested in (even during live capture).
   Here are some examples [for filtering](https://www.wireshark.org/docs/wsug_html/#ChWorkDisplayFilterSection):
   - **Filter for a protocol**:
     [DHCP](#dynamic-host-configuration-protocol) with `dhcp`{:.enable-click-to-copy},
     [HTTP](#hypertext-transfer-protocol) with `http`{:.enable-click-to-copy},
     [DNS](#domain-name-system) with `dns`{:.enable-click-to-copy},
     [TLS](#transport-layer-security) with `tls`{:.enable-click-to-copy},
     [QUIC](#quic) with `quic`{:.enable-click-to-copy},
     [ARP](#address-resolution-protocol) with `arp`{:.enable-click-to-copy}, etc.
   - **Hide certain protocols**:
     Hide all [802.11 management and control frames](https://en.wikipedia.org/wiki/802.11_frame_types) with `wlan.fc.type >= 2`{:.enable-click-to-copy},
     filter for traffic on the [network layer](#network-layer) with `(ip || ipv6)`{:.enable-click-to-copy},
     exclude [Multicast DNS (mDNS)](https://en.wikipedia.org/wiki/Multicast_DNS) for `.local` domain names with `!mdns`{:.enable-click-to-copy}, and so on.
   - **Filter for the presence of a field**:
     `tls.handshake.extensions_server_name`{:.enable-click-to-copy} for all initial [TLS packets](#transport-layer-security)
     where the "Client Hello" uses [server name indication (SNI)](https://en.wikipedia.org/wiki/Server_Name_Indication).
     (This includes initial [QUIC packets](#quic); but unlike ordinary TLS, you don't see the server name in the "Info" column.
     You have to select the packet and then expand "QUIC IETF" > "CRYPTO" > "TLSv1.3 Record Layer: […]" >
     "Handshake Protocol: Client Hello" > "Extension: server_name" in the lower left quadrant.)
   - **Filter for the value in a field**:
     `dns.flags.response == 0`{:.enable-click-to-copy} for DNS queries and `dns.flags.response == 1`{:.enable-click-to-copy} for replies.
5. When you select a packet, you can inspect its content in the lower left quadrant of the Wireshark window.
   You can expand the various [Internet layers](#internet-layers) to see the corresponding header fields
   and the actual payload on the [application layer](#application-layer).
   When you right-click on a specific field,
   you can add the field as a column in the packet table above by clicking on "Apply as Column".
   You can also filter the packets for this value in this field
   by choosing an option under "Apply as Filter" in the [context menu](https://en.wikipedia.org/wiki/Context_menu).


##### Screenshots of examples

The following screenshots depict network traffic from my [iPad](https://en.wikipedia.org/wiki/IPad) on my private Wi-Fi
that I captured using my [MacBook Pro](https://en.wikipedia.org/wiki/MacBook_Pro).

{% include image.md source="wireshark-dns.png" caption="When filtering the packets for the [DNS protocol](#domain-name-system), we see queries for various [record types](#resource-record-types) of [ef1p.com](https://ef1p.com/). The queries are [sent to the router](#dns-stub-resolvers) with the [IPv4 address](#internet-protocol-version-4) [`192.168.178.1`](#network-address-translation). As you can see on the line where it says [User Datagram Protocol](#user-datagram-protocol) in the lower left quadrant, the selected query was sent to the [port](#port-numbers) [53](#transport-protocol). In the lower right quadrant, you can see where the query name, which I selected on the left, appears in the sequence of sent bytes. I added the \"Name\" column in the table with the filtered packets by right-clicking on the (selected) \"Name: ef1p.com\" field in the lower left quadrant and then choosing \"Apply as Column\". The router sent the responses to the three queries in a single [802.11n frame](https://en.wikipedia.org/wiki/IEEE_802.11n-2009#Frame_aggregation) using [MAC service data unit (MSDU) aggregation](https://en.wikipedia.org/wiki/Frame_aggregation#MSDU_aggregation), which is why the length of the packet on the last line is three times bigger." themed="true" image-max-width="878" caption-max-width="878" %}

{% include image.md source="wireshark-sni.png" caption="When the browser on my iPad loaded this website over [HTTPS](#hypertext-transfer-protocol) on port [443](#hypertext-transfer-protocol), it sent the domain name of the server in the clear in its first message to the server, using the [Server Name Indication (SNI) extension](https://en.wikipedia.org/wiki/Server_Name_Indication) of [TLS](#transport-layer-security). This allows the server to send back the right certificate even if it hosts several websites. Until [WPA3](#wi-fi-protected-access) or [Encrypted Client Hello (ECH)](https://datatracker.ietf.org/doc/draft-ietf-tls-esni/) is widely deployed, you have to assume that every device in the same network knows which websites you visit." themed="true" image-max-width="708" caption-max-width="735" %}

{% include image.md source="wireshark-dhcp.png" caption="When a device joins a network and doesn't have an [IP address](#internet-protocol-version-4) yet, it uses [`0.0.0.0`](https://en.wikipedia.org/wiki/0.0.0.0) as the source for [DHCP](#dynamic-host-configuration-protocol) queries and sends them to the [broadcast address](https://en.wikipedia.org/wiki/Broadcast_address) `255.255.255.255`, which is limited to the local network. The [router](#hubs-switches-and-routers) with the IP address [`192.168.178.1`](#network-address-translation) assigned the IP address `192.168.178.104` to my iPad in the selected packet. (On the [link layer](#link-layer), each device is addressed with its [MAC address](#media-access-control-address).) As you can see in the screenshot, the router also told my iPad in the [option 6](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol#Options) of DHCP to [send all DNS queries to the router](#dns-stub-resolvers)." themed="true" image-max-width="636" caption-max-width="680" %}

</details>


### Application layer

Everything we've covered so far serves a single purpose:
to accomplish things we humans are interested in.
This is done with protocols on the [application layer](https://en.wikipedia.org/wiki/Application_layer).
Examples of application-layer protocols are
the [HyperText Transfer Protocol (HTTP)](#hypertext-transfer-protocol)
as the foundation of the [World Wide Web (WWW)](https://en.wikipedia.org/wiki/World_Wide_Web),
the [Simple Mail Transfer Protocol (SMTP)](/email/#simple-mail-transfer-protocol)
for delivering [email](/email/),
the [Internet Message Access Protocol (IMAP)](/email/#internet-message-access-protocol)
for retrieving email,
and the [File Transfer Protocol (FTP)](https://en.wikipedia.org/wiki/File_Transfer_Protocol)
for, as you can probably guess, transferring files.
What all of these protocols have in common is
that they all use a [text-based format](#text-based-protocols),
that they all run over [TCP](#transmission-control-protocol),
and that they all have a secure variant running over [TLS](#transport-layer-security),
namely [HTTPS](https://en.wikipedia.org/wiki/HTTPS),
[SMTPS](https://en.wikipedia.org/wiki/SMTPS),
[IMAPS](https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol#Security),
and [FTPS](https://en.wikipedia.org/wiki/FTPS).
This is the beauty of modularization:
Application-layer protocols can reuse the same protocols below,
while the protocols below don't need to know anything about the protocols above.

<details markdown="block">
<summary markdown="span" id="text-encoding">
Text encoding
</summary>

Similar to [numbers](#number-encoding),
human language is also encoded with symbols.
By assigning meaning to specific combinations of symbols,
which we call words,
we can encode a large vocabulary with relatively few symbols.
In computing, the symbols which make up a text are called
[characters](https://en.wikipedia.org/wiki/Character_(computing)).
English texts consist of
[letters](https://en.wikipedia.org/wiki/Letter_(alphabet)),
[digits](https://en.wikipedia.org/wiki/Numerical_digit),
[punctuation marks](https://en.wikipedia.org/wiki/Punctuation),
and [control characters](https://en.wikipedia.org/wiki/Control_character).
Control characters are used to structure texts without being printed themselves.
So-called [whitespace characters](https://en.wikipedia.org/wiki/Whitespace_character),
such as [space](https://en.wikipedia.org/wiki/Space_(punctuation)),
[tab](https://en.wikipedia.org/wiki/Tab_key#Tab_characters),
and [newline](https://en.wikipedia.org/wiki/Newline),
fall in this category.
Other examples of control characters are
[backspace](https://en.wikipedia.org/wiki/Backspace),
[escape](https://en.wikipedia.org/wiki/Escape_character),
the [end-of-transmission character](https://en.wikipedia.org/wiki/End-of-Transmission_character),
and the [null character](https://en.wikipedia.org/wiki/Null_character)
to indicate the [end of a string](https://en.wikipedia.org/wiki/Null-terminated_string).
(A [string](https://en.wikipedia.org/wiki/String_(computer_science))
is just a sequence of characters in [memory](https://en.wikipedia.org/wiki/Computer_memory).)

In order to uniquely identify them,
a so-called [code point](https://en.wikipedia.org/wiki/Code_point)
is assigned to each character.
A code point is just a number,
which itself needs to be encoded
in order to store or transmit text.
In order to understand each other,
two or more parties need to agree on a common
[character encoding](https://en.wikipedia.org/wiki/Character_encoding).
After the [Morse code](https://en.wikipedia.org/wiki/Morse_code)
for [telegraphs](https://en.wikipedia.org/wiki/Electrical_telegraph),
the [American Standard Code for Information Interchange (ASCII)](https://en.wikipedia.org/wiki/ASCII),
which was developed in the 1960s,
became the first widely adopted character encoding for computers.
Based on the [English alphabet](https://en.wikipedia.org/wiki/English_alphabet),
ASCII specifies 128 characters and how they are encoded as seven-bit integers.
It is basically [just a table](https://en.wikipedia.org/wiki/ASCII#Printable_characters)
mapping characters to their code points and vice versa.
Since it's easier to reserve a whole byte for each character,
the eighth bit made it possible to [extend ASCII](https://en.wikipedia.org/wiki/Extended_ASCII)
with 128 additional characters.
Many companies used this for
[proprietary extensions](https://en.wikipedia.org/wiki/Extended_ASCII#Proprietary_extensions),
before the [International Organization for Standardization (ISO)](https://en.wikipedia.org/wiki/International_Organization_for_Standardization)
published [ISO 8859](https://en.wikipedia.org/wiki/ISO/IEC_8859) in 1987,
which standardized character sets for
[Western European languages](https://en.wikipedia.org/wiki/ISO/IEC_8859-1),
[Eastern European languages](https://en.wikipedia.org/wiki/ISO_8859-2),
and others.

The character encodings defined by ISO 8859 have the problem
that they are not compatible with each other.
Since character encodings are typically used for whole documents
including websites and not just for parts of them,
you cannot use characters from different sets in the same document.
Additionally, each document has to be accompanied with the used character set
as part of its [metadata](https://en.wikipedia.org/wiki/Metadata)
because none of the encodings will ever be in a position to supersede them all
as a widely accepted default encoding.
[Unicode](https://en.wikipedia.org/wiki/Unicode),
which is maintained by the California-based
[Unicode Consortium](https://en.wikipedia.org/wiki/Unicode_Consortium),
unifies different character sets
by providing a unique code point for every imaginable character.
Unicode specifies different encodings for these code points,
which are known as [Unicode Transformation Formats (UTF)](https://en.wikipedia.org/wiki/Unicode#UTF).
The most popular ones are [UTF-8](https://en.wikipedia.org/wiki/UTF-8),
which uses one to four bytes for each code point
and maximizes compatibility with ASCII,
and [UTF-16](https://en.wikipedia.org/wiki/UTF-16),
which uses one or two 16-bit units per code point.

</details>

<details markdown="block">
<summary markdown="span" id="text-based-protocols">
Text-based protocols
</summary>

A communication protocol has to specify
how text and numbers in messages are encoded
or at least how the recipient is informed about the used encoding.
As mentioned above,
many [application-layer protocols](#application-layer) are
[text-based](https://en.wikipedia.org/wiki/Text-based_protocol),
which means that the transmitted messages can be meaningfully displayed in a text editor.
This is in contrast to [binary protocols](https://en.wikipedia.org/wiki/Binary_protocol),
whose messages are difficult to read for humans without specialized analysis software.
As we just learned, text is also encoded with [binary numbers](#number-encoding),
and text editors can be considered as specialized software.
The real difference between the two categories of protocols is
that text-based protocols delimit different pieces of information
with a certain character, such as a newline or a colon, at that position,
whereas binary protocols often define specific lengths in bytes for each
[field](https://en.wikipedia.org/wiki/Field_(computer_science))
or prefix a field with its length in bytes.
The advantage of binary protocols is
that they can directly incorporate arbitrary data,
whereas the data in text-based protocols needs to be
[escaped](https://en.wikipedia.org/wiki/Escape_character)
in order to ensure that the delimiting character does not occur within a field.
If, for example, different header fields are separated by a newline,
then none of the header fields may contain a newline character.
If they do, the newline character needs to be replaced
with the appropriate [escape sequence](https://en.wikipedia.org/wiki/Escape_sequence)
as defined by the protocol.
A common escape sequence for a newline character is `\n`.
Alternatively, the whole data could be re-encoded with a certain set of characters.
This is required when arbitrary data needs to be encoded
where only text is permitted or reliably supported.
This is the case for [email attachments](https://en.wikipedia.org/wiki/Email_attachment)
because email originally supported only [7-bit ASCII](#text-encoding).
If you attach a picture to an email, for example,
the picture is split into chunks of 6 bits,
and each chunk is encoded with one of 64 characters.
This encoding is called [Base64](https://en.wikipedia.org/wiki/Base64),
and it needs to be reverted by the recipient
in order to display the picture.
Base64 uses the characters `A` – `Z`, `a` – `z`, `0` – `9`, `+`, and `/`
(26 + 26 + 10 + 2 = 64).
Because binary protocols require no such transformation
and often omit field labels
or replace them with numeric tags,
they are more compact and efficient than text-based protocols.

</details>

<details markdown="block">
<summary markdown="span" id="hypertext-transfer-protocol">
HyperText Transfer Protocol (HTTP)
</summary>

In order for you to read this article,
your [browser](https://en.wikipedia.org/wiki/Web_browser) fetched this page from a
[web server](https://en.wikipedia.org/wiki/Web_server) via [HTTP](https://en.wikipedia.org/wiki/HTTP) over [TLS](#transport-layer-security),
which is known as [HTTPS](https://en.wikipedia.org/wiki/HTTPS).
Given the popularity of [the Web](https://en.wikipedia.org/wiki/World_Wide_Web),
HTTP is one of the most widely used [application-layer protocols](#application-layer).
If we ignore newer versions of the protocol and rarely used features,
HTTP is a fairly simple protocol and thus an excellent first example.
HTTP works according to the [client-server model](#client-server-model):
The client sends a request, and the server sends back a response.
The first line of the request starts with the
[request method](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol#Request_methods),
which specifies whether the request is about
retrieving (`GET`) or submitting (`POST`) data.
The request method is followed by
the [resource](https://en.wikipedia.org/wiki/Web_resource) to retrieve or submit to
and the protocol version.
The first line of the response includes the
[status code](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes),
which indicates whether the request was successful
and, if not, what went wrong.
While the first line is different,
both HTTP requests and responses continue with
[header fields](https://en.wikipedia.org/wiki/List_of_HTTP_header_fields)
(formatted as `name: value` on separate lines),
an empty line,
and an optional [message body](https://en.wikipedia.org/wiki/HTTP_message_body).
If you request a file,
the body of the request is usually empty,
whereas the body of the response contains the file
(assuming that the request was successful).
If, on the other hand, you submit data,
such as your username and password in a login form,
the request contains this data in its body,
whereas the body of the response could be empty,
for example, when your browser is being redirected to a different page.
We have encountered the concept of [header and payload](#packet-switching) several times already,
and HTTP follows the same logic.
Let's look at a slightly modified example from
[Wikipedia](https://en.wikipedia.org/wiki/HTTP#HTTP/1.1_example_of_request_/_response_transaction):

<figure markdown="block">

```http
GET /index.html HTTP/1.0
Host: www.example.com

```

<figcaption markdown="span" style="max-width: 700px;">
A minimal HTTP request from a client,
requesting the resource `/index.html` from the host `www.example.com`.
Please note that the request is terminated by an empty line and has no message body.
</figcaption>
</figure>

The only mandatory request header field is `Host`.
It is required to let the server know
from which website to serve the requested resource
in case the same server hosts several websites.
As you [learned above](#port-numbers),
only one process can bind to a specific port on the same machine,
thus this header field is the only way for a server
to tell the requests to different websites apart.
(Strictly speaking, it's one process
per [port number](#port-numbers) and [IP address](#internet-protocol-version-4).
So if the server has several network interfaces,
the requests on each interface could be handled by a different process.)
The default port is 80 for HTTP and 443 for HTTPS.
If you want to request a website on a different port,
you would specify this after the host name in the
[URL](https://en.wikipedia.org/wiki/Uniform_Resource_Locator).
For example, if you run a web server [locally](#server-on-your-personal-computer) on port 4000,
you would access it at `http://localhost:4000/`{:.enable-click-to-copy} in your browser.
Let's look at the response:

<figure markdown="block" class="allow-break-inside">

```http
HTTP/1.0 200 OK
Date: Mon, 23 May 2005 22:38:34 GMT
Content-Type: text/html; charset=UTF-8
Content-Length: 155
Last-Modified: Wed, 08 Jan 2003 23:11:55 GMT
Server: Apache/1.3.3.7 (Unix) (Red-Hat/Linux)

<html>
  <head>
    <title>An example page</title>
  </head>
  <body>
    <p>Hello, World! This is a very simple HTML document.</p>
  </body>
</html>
```

<figcaption markdown="span">
A possible HTTP response from the server,
which includes the requested resource in its message body after the empty line.
</figcaption>
</figure>

As indicated by the `Content-Type` header field,
the response is an HTML document.
HTML stands for [HyperText Markup Language](https://en.wikipedia.org/wiki/HTML)
and is the document format of the Web.
The browser parses the HTML document
and displays it as a website.
`<p>` stands for a paragraph, which is then closed by `</p>`.
The other so-called [tags](https://en.wikipedia.org/wiki/HTML#Markup)
in the example above should be self-explanatory.
Usually, a website references other files from its HTML,
such as [styles](https://en.wikipedia.org/wiki/Cascading_Style_Sheets),
[scripts](https://en.wikipedia.org/wiki/JavaScript),
and [images](https://en.wikipedia.org/wiki/HTML_element#Images_and_objects).
These files can be hosted on the same or a different server.
The browser fetches them via separate HTTP requests.
The body of the response is not limited to [text-based formats](#text-based-protocols),
any files can be transferred via HTTP.
Thanks to the `Content-Length` header field,
binary files don't need to be escaped.
Every modern browser includes powerful
[developer tools](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/What_are_browser_developer_tools),
with which you can inspect the requests it made:

{% include image.md source="developer-tools.png" caption="The network tab in [Chrome's developer tools](https://developers.google.com/web/tools/chrome-devtools) shows you the resources the browser loaded in order to render the visited page. If you click on one of the resources, you see details, such as its request method and the IP address with the port number of the server, on the right." themed="true" image-max-width="880" caption-max-width="860" %}

If you are familiar with the [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface)
of your operating system,
you can write such HTTP requests yourself.
On [macOS](https://en.wikipedia.org/wiki/MacOS),
the default program providing such a command-line interface
is [Terminal](https://support.apple.com/guide/terminal/welcome/mac),
located in the `/Applications/Utilities`{:.enable-click-to-copy} folder.
With the networking utility [nc](https://en.wikipedia.org/wiki/Netcat),
you can establish a [TCP](#transmission-control-protocol) connection to the designated server.
If the website is provided via HTTPS,
you can use [OpenSSL](https://en.wikipedia.org/wiki/OpenSSL)
to establish a [TLS](#transport-layer-security) connection to the designated server.
The following tool generates what you have to enter in your command-line interface
based on the provided [Web address](https://en.wikipedia.org/wiki/URL):

<figure markdown="block">
<div id="tool-protocol-http"></div>
<figcaption markdown="span">
How to make an HTTP(S) request from your command-line interface.
You can copy the text to your [clipboard](https://en.wikipedia.org/wiki/Clipboard_(computing)) by clicking on it.
</figcaption>
</figure>

</details>

<details markdown="block" open>
<summary markdown="span" id="domain-name-system">
Domain Name System (DNS)
</summary>


##### Name registration

The hierarchical numbers used in [network addresses](#network-addresses)
are great for machines to [route](#signal-routing) [packets](#packet-switching)
but difficult for humans to remember.
The [Domain Name System (DNS)](https://en.wikipedia.org/wiki/Domain_Name_System)
as specified in [RFC 1034](https://datatracker.ietf.org/doc/html/rfc1034) and [RFC 1035](https://datatracker.ietf.org/doc/html/rfc1035)
solves this problem by providing a hierarchical
[namespace](https://en.wikipedia.org/wiki/Namespace)
of easily memorizable [domain names](https://en.wikipedia.org/wiki/Domain_name)
and a protocol to access public information associated with such names.
A domain name consists of a sequence of labels separated by a dot.
Similar to how the [Internet](#network-layer)
is more than just a protocol as it also governs the allocation of [IP addresses](#internet-protocol-version-4),
the Domain Name System is more than just an [application-layer protocol](#application-layer)
as it also governs the allocation of domain names,
thereby ensuring that each domain name is unique.
At the root of this system is again the
[Internet Corporation for Assigned Names and Numbers (ICANN)](https://en.wikipedia.org/wiki/ICANN),
which approves the [top-level domains (TLD)](https://en.wikipedia.org/wiki/Top-level_domain)
and accredits the [registry operators](https://en.wikipedia.org/wiki/Domain_name_registry),
which manage the registration of names within their domain.
As an organization or individual,
you register your domains at a so-called
[domain name registrar](https://en.wikipedia.org/wiki/Domain_name_registrar),
which has to be [accredited by the registry operators](https://www.icann.org/registrar-reports/accreditation-qualified-list.html)
of all the top-level domains under which it allows its customer to register a domain name.
This has the advantage that you as a registrant have to interact with only a single company
even if you register various domain names under different top-level domains.
Let's look at an example: I'm the registrant of [ef1p.com](https://ef1p.com).
The top-level domain of this domain name is [com](https://en.wikipedia.org/wiki/.com).
The registry operator for `.com` is [Verisign](https://en.wikipedia.org/wiki/Verisign).
The domain name registrar I have chosen to register my domains is [Infomaniak](https://en.wikipedia.org/wiki/Infomaniak).
I pay them around 18 USD every year just so that I can keep this domain.
In order to avoid ambiguity,
a [fully qualified domain name (FQDN)](https://en.wikipedia.org/wiki/Fully_qualified_domain_name)
is sometimes written with a trailing dot, such as `ef1p.com.`.
Otherwise, the label might just refer to a [subdomain](https://en.wikipedia.org/wiki/Subdomain).
Don't let this confuse you in the [DNS lookup tool](#dns-lookup-tool) below.


##### Distributed database

From a technical point of view,
DNS acts as a [distributed database](https://en.wikipedia.org/wiki/Distributed_database),
which stores the information associated with domain names
on numerous machines distributed all over the Internet.
These machines are called [name servers](https://en.wikipedia.org/wiki/Name_server),
and each entry they store is called a [resource record (RR)](https://en.wikipedia.org/wiki/Domain_Name_System#Resource_records).
While some name servers provide the [authoritative answer](https://en.wikipedia.org/wiki/Name_server#Authoritative_answer)
to queries regarding the domain names for which they are responsible,
others simply store these answers for a limited period of time.
Such temporary storage is known as [caching](https://en.wikipedia.org/wiki/Cache_(computing)),
and it allows other devices in the same network to look up the information faster.
Caching is also important to distribute the load more evenly among name servers,
which improves the scalability of the Domain Name System.
Each record specifies how long [it can be cached](https://en.wikipedia.org/wiki/Domain_Name_System#Record_caching),
which limits how outdated the answer to a query can be.
This expiration period is called [time to live (TTL)](https://en.wikipedia.org/wiki/Time_to_live),
and a common value for this is one hour.
This means that if you change a DNS record with such a TTL value,
you have to wait for up to one hour
until the stale entries have been discarded everywhere.


##### IP address lookups

The most common use case of DNS is to resolve a domain name to an [IP address](#internet-protocol-version-4).
Every time a [client](#client-server-model) connects to a server identified by a domain name,
it first has to query a name server to obtain the IP address of the server
because the [network layer](#network-layer) has no notion of domain names.
This is similar to how you have to look up the phone number of a person
before you can call that person.
In this sense, DNS can be compared to a [telephone book](https://en.wikipedia.org/wiki/Telephone_directory);
but, rather than looking up the phone number of persons,
you look up the IP address of computers on the Internet.
Another difference is that each domain name is unique,
which cannot be said about the names of humans.
A domain name can resolve to [several IP addresses](https://en.wikipedia.org/wiki/Round-robin_DNS),
which distributes requests among several servers
and allows clients to connect to a different server
if they cannot reach one of them.
This indirection of first having to look up
the IP address of the server you want to connect to
also has the advantage that a server can be replaced
without having to notify its users about the new address.


##### Transport protocol

DNS specifies a binary encoding for requests and responses.
[By default](#dns-stub-resolvers),
DNS uses the [User Datagram Protocol (UDP)](#user-datagram-protocol)
in order to avoid the additional [round trips](#network-performance)
required by the [Transmission Control Protocol (TCP)](#transmission-control-protocol)
for the connection setup.
If the request or the response packet is lost,
the client simply queries again after the configured [timeout](#connection-loss).
If not all queried resource records fit into a single UDP packet
(see the [maximum transmission unit](#maximum-transmission-unit)),
the DNS server [indicates this in its response](https://blog.apnic.net/2024/07/15/revisiting-dns-and-udp-truncation/).
In such a case, the client should discard the UDP response
and send the same query over TCP again.
DNS is served on [port](#port-numbers) 53 for UDP and TCP.


##### Resource record types

There are [other types of resource records](https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4)
besides the one which resolves a domain name to an [IPv4 address](#internet-protocol-version-4):

<figure markdown="block" class="allow-break-inside">

| Acronym | Name | Value | Example
|-
| [`A`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.4.1) | IPv4 address record | A single IPv4 address. | <a href="#tool-lookup-dns-records&domainName=ef1p.com&recordType=A&dnssecOk=false" title="Look up the A records of ef1p.com.">↗</a>
| [`AAAA`](https://datatracker.ietf.org/doc/html/rfc3596#section-2.1) | IPv6 address record | A single IPv6 address. | <a href="#tool-lookup-dns-records&domainName=google.com&recordType=AAAA&dnssecOk=false" title="Look up the AAAA records of google.com.">↗</a>
| [`ANY`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.2.5) | Any record type query | Return all record types of the queried domain. | <a href="#tool-lookup-dns-records&domainName=ef1p.com&recordType=ANY&dnssecOk=false" title="Look up ANY records of ef1p.com.">↗</a>
| [`CAA`](https://datatracker.ietf.org/doc/html/rfc8659#section-4) | CA authorization record | The CA authorized to issue certificates for this domain.<br>Only checked by CAs before issuing a certificate. | <a href="#tool-lookup-dns-records&domainName=wikipedia.org&recordType=CAA&dnssecOk=false" title="Look up the CAA records of wikipedia.org.">↗</a>
| [`CNAME`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.1) | Canonical name record | Another domain name to continue the lookup with. | <a href="#tool-lookup-dns-records&domainName=www.facebook.com&recordType=CNAME&dnssecOk=false" title="Look up the CNAME records of www.facebook.com.">↗</a>
| [`MX`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.9) | Mail exchange record | The server to deliver the mail for the queried domain to. | <a href="#tool-lookup-dns-records&domainName=gmail.com&recordType=MX&dnssecOk=false" title="Look up the MX records of gmail.com.">↗</a>
| [`NS`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.11) | Name server record | The authoritative name server of the queried domain. | <a href="#tool-lookup-dns-records&domainName=youtube.com&recordType=NS&dnssecOk=false" title="Look up the NS records of youtube.com.">↗</a>
| [`OPENPGPKEY`](https://datatracker.ietf.org/doc/html/rfc7929#section-2) | OpenPGP key | The local part of the user's email address is hashed. | <a href="#tool-lookup-dns-records&domainName=7b2489a62716f4bfdabb289442549772ea1920b90535fb206948d927._openpgpkey.fedoraproject.org&recordType=OPENPGPKEY&dnssecOk=false" title="Look up the OPENPGPKEY records of fedora-44-primary@fedoraproject.org.">↗</a>
| [`PTR`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.12) | Pointer record | Another domain name without continuing the lookup.<br>Primarily used for implementing [reverse DNS lookups](https://en.wikipedia.org/wiki/Reverse_DNS_lookup). | <a href="#tool-lookup-dns-records&domainName=10.144.253.17.in-addr.arpa&recordType=PTR&dnssecOk=false" title="Do a reverse lookup on one of apple.com's IPv4 addresses.">↗</a><br><a href="#tool-lookup-dns-records&domainName=e.0.0.2.0.0.0.0.0.0.0.0.0.0.0.0.2.0.8.0.a.0.0.4.0.5.4.1.0.0.a.2.ip6.arpa&recordType=PTR&dnssecOk=false" title="Do a reverse lookup on one of google.com's IPv6 addresses. (1e100 = 10^100, which is called a googol.)">↗</a>
| [`SMIMEA`](https://datatracker.ietf.org/doc/html/rfc8162#section-2) | S/MIME certificate | The local part of the user's email address is hashed. | <a href="#tool-lookup-dns-records&domainName=b1a51af355b2082ce05911aa0cc98a2d816fb6bc6b2901d2c0ded2de._smimecert.spodhuis.org&recordType=SMIMEA&dnssecOk=false" title="Look up the SMIMEA records of ietf-dane-phil@spodhuis.org.">↗</a>
| [`SOA`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.13) | Start of authority record | Administrative information for [secondary name servers](https://en.wikipedia.org/wiki/Name_server#Authoritative_answer). | <a href="#tool-lookup-dns-records&domainName=amazon.com&recordType=SOA&dnssecOk=false" title="Look up the SOA record of amazon.com.">↗</a>
| [`SRV`](https://datatracker.ietf.org/doc/html/rfc2782) | Service record | The port number and domain name of the queried service. | <a href="#tool-lookup-dns-records&domainName=_submission._tcp.gmail.com&recordType=SRV&dnssecOk=false" title="Look up the SRV record of _submission._tcp.gmail.com. As an email client, you can use the subdomain _submission._tcp to figure out which server to submit outgoing emails to. Unfortunately, this standard is not widely used.">↗</a>
| [`SSHFP`](https://datatracker.ietf.org/doc/html/rfc4255#section-3) | SSH fingerprint | The hash of the server's SSH key for initial authentication. | <a href="#tool-lookup-dns-records&domainName=ccczh.ch&recordType=SSHFP&dnssecOk=false" title="Look up the SSHFP records of ccczh.ch.">↗</a>
| [`TLSA`](https://datatracker.ietf.org/doc/html/rfc6698#section-2) | Server certificate | See [DNS-Based Authentication of Named Entities (DANE)](/email/#dns-based-authentication-of-named-entities). | <a href="#tool-lookup-dns-records&domainName=_25._tcp.mail.protonmail.ch&recordType=TLSA&dnssecOk=false" title="Look up the TLSA records of _25._tcp.mail.protonmail.ch.">↗</a>
| [`TXT`](https://datatracker.ietf.org/doc/html/rfc1035#section-3.3.14) | Text record | Arbitrary text used in place of introducing a new record type. | <a href="#tool-lookup-dns-records&domainName=hello.ef1p.com&recordType=TXT&dnssecOk=false" title="Look up the TXT records of hello.ef1p.com.">↗</a>

<figcaption markdown="span">
Some of the more common [DNS record types](https://en.wikipedia.org/wiki/List_of_DNS_record_types).
Don't worry if you don't yet understand what they are used for.
</figcaption>
</figure>


##### DNS lookup tool

We will encounter some of these record types in future articles on this blog.
For now, I want to give you the opportunity to play around with the actual DNS.
I use an [API by Google](https://developers.google.com/speed/public-dns/docs/doh/json)
to query what you enter.
Try it with any domain name you are interested in.
If you hover with your mouse over the data,
you get additional explanations and options,
such as doing a [reverse lookup](https://en.wikipedia.org/wiki/Reverse_DNS_lookup) of an IPv4 or IPv6 address.
The [DNSSEC](#domain-name-system-security-extensions) option and the record types which are not in the above table
will be introduced [here](#dnssec-resource-records) and [here](#svcb-and-https-resource-records).
If you want to play around with the tools in this article without scrolling,
I also published them separately on [this page](/internet/tools/).

<div id="tool-lookup-dns-records"></div>

</details>

<details markdown="block">
<summary markdown="span" id="domain-name-system-security-extensions">
Domain Name System Security Extensions (DNSSEC)
</summary>


##### DNS security issues

The problem with plain old [DNS](#domain-name-system) is that the answer to a query cannot be trusted.
While non-authoritative name servers
that cache and relay answers for others
are great for scalability,
they are really bad for security
as they can reply with fake answers,
thereby [poisoning the cache](https://en.wikipedia.org/wiki/DNS_spoofing)
of [DNS resolvers](https://en.wikipedia.org/wiki/Domain_Name_System#DNS_resolvers).
Additionally, an attacker who can modify your network traffic
can also replace the actual response from a name server with a malicious one
because neither [UDP](#user-datagram-protocol) nor [IP](#internet-protocol-version-4) authenticates the transmitted data.
To make things even worse,
an attacker might not even have to modify your network traffic.
As long as the attacker [sees your DNS query](#broadcasting-and-information-security)
by being on the same network,
they can simply respond faster than the queried name server.
Since UDP is a connectionless protocol without a handshake,
the source IP address of the response can easily be [spoofed](#ip-address-spoofing)
so that it seems as if the response was indeed sent from the queried name server.
If the attacker does not see the query because they are on a non-involved network,
such a [race attack](https://en.wikipedia.org/wiki/DNS_spoofing#Prevention_and_mitigation)
becomes much harder as the attacker has to guess the correct timing of the response,
the correct DNS query ID used to match answers to questions,
as well as the correct [source port](#port-numbers) from which the query was sent.
For this reason, DNS queries should always be sent from a random source port,
and also [NAT routers](#network-address-translation) should choose external ports unpredictably.
Since DNS is often used to determine the destination address of requests,
a successful attack on the DNS resolution of your computer
allows the attacker to redirect all your Internet traffic through servers that they control.
The only thing that can limit the damage they can do is [TLS](#transport-layer-security)
with valid [public-key certificates](#public-key-infrastructure)
or another protocol with similar security properties on the [application layer](#application-layer).
This also requires that the user does not simply dismiss warnings about invalid certificates.
Luckily, such warnings are quite intimidating in most browsers by now
and can no longer be dismissed with a single click.
If you don't know what I'm talking about,
visit [this page](https://untrusted-root.badssl.com/)
in order to get such a warning.
There is no risk in visiting this page
as long as you abort and don't modify your security settings.


##### Authenticity without confidentiality

The [Domain Name System Security Extensions (DNSSEC)](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions)
solve these [DNS security issues](#dns-security-issues)
by [authenticating](https://en.wikipedia.org/wiki/Message_authentication) resource records.
DNSSEC doesn't provide [confidentiality](https://en.wikipedia.org/wiki/Information_security#Confidentiality), though.
You would have to use [another protocol](#secure-dns-connections) for that.
For most readers, it's enough to know that the integrity of DNS can be protected.
The rest of this box dives fairly deep into how DNSSEC works according to
[RFC 4033](https://datatracker.ietf.org/doc/html/rfc4033) (overview and considerations),
[RFC 4034](https://datatracker.ietf.org/doc/html/rfc4034) ([new types of resource records](#dnssec-resource-records)),
and [RFC 4035](https://datatracker.ietf.org/doc/html/rfc4035) (protocol modifications).


##### Administrative zones

Before we can discuss these extensions,
we first need to understand
that the Domain Name System is split into [administrative zones](https://en.wikipedia.org/wiki/DNS_zone),
each of which is managed by a single entity.
Each such entity runs name servers (or lets a company run them on its behalf),
which return the authoritative answers for the domains in its zone.
DNS has a single and thus centralized [root zone](https://en.wikipedia.org/wiki/DNS_root_zone),
which is managed by the [Internet Assigned Numbers Authority (IANA)](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority),
a subsidiary of the [Internet Corporation for Assigned Names and Numbers (ICANN)](https://en.wikipedia.org/wiki/ICANN),
but operated by [Verisign](https://en.wikipedia.org/wiki/Verisign).
The root domain is denoted by the empty label,
but it is usually written and queried as a single period: `.`.
If you query a [root name server](https://en.wikipedia.org/wiki/Root_name_server)
for a domain such as `ef1p.com.`
(written with a trailing dot because `com` is a subdomain of the root domain with the empty label),
it will answer that `com` belongs to a different DNS zone
and provide you with the addresses of the authoritative name servers of that zone.
If you query one of those name servers for `ef1p.com.`,
it will tell you again that other name servers are responsible for this domain.
You can query all these name servers with the tool at the end of the previous box:
[the root name servers](#tool-lookup-dns-records&domainName=.&recordType=NS&dnssecOk=false),
[the .com name servers](#tool-lookup-dns-records&domainName=com.&recordType=NS&dnssecOk=false),
and [the ef1p.com name servers](#tool-lookup-dns-records&domainName=ef1p.com.&recordType=NS&dnssecOk=false).
Somewhat confusingly, the name servers are listed with a domain name rather than an [IP address](#internet-protocol-version-4).
In order to avoid the [circular dependency](https://en.wikipedia.org/wiki/Circular_dependency)
that [you already need to have used DNS in order to use DNS](https://en.wikipedia.org/wiki/DNS_root_zone#Initialization_of_DNS_service),
DNS clients have to be delivered not only with the domain names of the root name servers but also with their IP addresses.
This is usually accomplished with a [file like this](https://www.internic.net/zones/named.cache).
As long as they can reach one of the root name servers,
it will tell them the IP address of any name server it refers them to as well.
This is accomplished with so-called [glue records](https://en.wikipedia.org/wiki/Domain_Name_System#Circular_dependencies_and_glue_records),
which are address resource records for name servers in a subzone returned by the name server of the superzone.
I cannot demonstrate this with the above tool
because [Google](https://developers.google.com/speed/public-dns/docs/doh/json) does all the recursive resolution for us.
If you are familiar with a [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface),
you can use the [dig command](https://en.wikipedia.org/wiki/Dig_(command)) to check this:
`dig net @a.root-servers.net.`{:.enable-click-to-copy} returns in the authority section of the DNS answer
that the name server for `net.` is `a.gtld-servers.net.` (among others)
and in the additional section of the DNS answer
that the [IPv4 address](#internet-protocol-version-4) of `a.gtld-servers.net.` is `192.5.6.30`.
(The authority section indicates the
[authoritative name servers](https://en.wikipedia.org/wiki/Domain_Name_System#Authoritative_name_server)
of the queried domain or its canonical name.
In the additional section,
a name server can add records
that are related to the query
but which the client didn't yet ask for.)
While for a domain name such as `ef1p.com.`
each subdomain starts its own zone as we have just seen,
I would declare any further subdomains, such as `www.ef1p.com.`,
in the same zone as `ef1p.com.`.
Since I'm the administrator of my zone,
I can do this without involving any party
other than [infomaniak.com](https://www.infomaniak.com/),
which operates the name servers on my behalf,
thanks to the hierarchical and distributed nature of DNS.


##### Single trust anchor

Coming back to DNSSEC after this little detour,
the core idea is that each zone signs its records
and provides these signatures in newly created records.
Each administrative zone uses its own [cryptographic keys](#digital-signatures) for this,
but the zone above in the hierarchy lists and signs the public keys of its subzones.
This allows you to verify the public keys and resource records of all DNSSEC-enabled zones
as long as you know the public key of the root zone.
This is similar to the [public-key infrastructure](#public-key-infrastructure) behind TLS,
where root certification authorities delegate their authority to intermediate certification authorities
by signing their public key.
There is a crucial difference, though.
In the case of TLS, everyone needs to trust every single certification authority
since any certification authority can issue a certificate for any domain.
With DNSSEC, you need to trust only the administrators of the zones above you.
For this blog, that's the root zone and the `com.` zone.
A zone like `attacker.example.org.` cannot authorize a different DNSSEC key for `ef1p.com.`.
In computer security, requiring less trust is always better.
While DNSSEC fails spectacularly if the root key is compromised,
TLS fails if the key of any certification authority is compromised.
Having a [single point of failure](https://en.wikipedia.org/wiki/Single_point_of_failure)
is preferable to having [many independent points of failure](https://x.com/csoandy/status/570239492386385921).
There have been [attempts to address this issue for TLS](/email/#dns-based-authentication-of-named-entities),
but, unfortunately, they weren't widely adopted.
Let's have a look at some technical aspects of DNSSEC next.


##### DNSSEC resource records

DNSSEC introduced the following DNS record types:

<figure markdown="block" class="allow-break-inside">

| Acronym | Name | Value |
|-
| [`DNSKEY`](https://datatracker.ietf.org/doc/html/rfc4034#section-2) | DNS public key record | The public key used to sign the resource records of the queried domain. | <a href="#tool-lookup-dns-records&domainName=.&recordType=DNSKEY&dnssecOk=true" title="Look up the DNSKEY records of the root zone.">↗</a>
| [`DS`](https://datatracker.ietf.org/doc/html/rfc4034#section-5) | Delegation signer record | The hash of the key-signing key (KSK) used in the delegated DNS zone. | <a href="#tool-lookup-dns-records&domainName=com.&recordType=DS&dnssecOk=true" title="Look up the DS record for the com zone signed by the root zone.">↗</a>
| [`RRSIG`](https://datatracker.ietf.org/doc/html/rfc4034#section-3) | Resource record signature | A digital signature on the queried set of resource records. | <a href="#tool-lookup-dns-records&domainName=.&recordType=RRSIG&dnssecOk=true" title="Look up the various RRSIG records of the root domain.">↗</a>
| [`NSEC`](https://datatracker.ietf.org/doc/html/rfc4034#section-4) | Next secure record | The next existing subdomain used for authenticated [denial of existence](#denial-of-existence). | <a href="#tool-lookup-dns-records&domainName=nonexistent.ef1p.com.&recordType=A&dnssecOk=true" title="See the NSEC record returned when looking up the A record of the nonexistent domain nonexistent.ef1p.com.">↗</a>
| [`NSEC3`](https://datatracker.ietf.org/doc/html/rfc5155#section-3) | `NSEC` version 3 | A salted hash of the next existing subdomain to prevent [zone walking](#zone-walking). | <a href="#tool-lookup-dns-records&domainName=com.&recordType=A&dnssecOk=true" title="See the NSEC3 record returned when looking up the nonexistent A record of the domain com.">↗</a>
| [`NSEC3PARAM`](https://datatracker.ietf.org/doc/html/rfc5155#section-4) | `NSEC3` parameters | Used by authoritative name servers to generate the `NSEC3` records. | <a href="#tool-lookup-dns-records&domainName=example.com.&recordType=NSEC3PARAM&dnssecOk=true" title="Look up the NSEC3PARAM record of example.com.">↗</a>
| [`CDS`](https://datatracker.ietf.org/doc/html/rfc7344#section-3.1) | Child copy of `DS` | Used by the child zone to publish the desired `DS` record in the parent zone. | <a href="#tool-lookup-dns-records&domainName=gov.&recordType=CDS&dnssecOk=true" title="Look up the CDS record of gov.">↗</a>
| [`CDNSKEY`](https://datatracker.ietf.org/doc/html/rfc7344#section-3.2) | Child copy of `DNSKEY` | Used by the child zone so that the parent zone can compute the `DS` record. | <a href="#tool-lookup-dns-records&domainName=gov.&recordType=CDNSKEY&dnssecOk=true" title="Look up the CDNSKEY record of gov.">↗</a>

<figcaption markdown="span">
The [DNS record types introduced for DNSSEC](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions#Resource_records)
as defined in [RFC 4034](https://datatracker.ietf.org/doc/html/rfc4034),
[RFC 5155](https://datatracker.ietf.org/doc/html/rfc5155),
and [RFC 7344](https://datatracker.ietf.org/doc/html/rfc7344).
</figcaption>
</figure>


##### Key-signing keys and zone-signing keys

Although DNSSEC validation treats all keys equally,
[RFC 4033](https://datatracker.ietf.org/doc/html/rfc4033)
distinguishes between key-signing keys (KSKs)
and zone-signing keys (ZSKs).
A zone lists both types of keys with `DNSKEY` records.
The parent zone lists the [cryptographic hash](https://en.wikipedia.org/wiki/Cryptographic_hash_function)
of the key-signing key in a `DS` record.
(A hash is the result of a [one-way function](https://en.wikipedia.org/wiki/One-way_function),
which maps inputs of arbitrary size to outputs of a fixed size and is infeasible to invert.)
By using only the hash of a key instead of the key itself,
the parent zone has to store less data because the hash is shorter.
And of course, we're talking only about [public keys](#digital-signatures) here.
The key-signing key is then used to sign one or more zone-signing keys.
The signature, which covers all `DNSKEY` records,
is published in an `RRSIG` record with the same domain name.
The zone-signing keys are then used to sign all other records of the zone.
The advantage of this distinction between key-signing keys and zone-signing keys
is that the latter can have a shorter lifetime
and be replaced more frequently because,
unlike in the case of key-signing keys,
the parent zone is not involved.
The algorithms that can be used to sign records are listed
[on Wikipedia](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions#Algorithms)
and, more authoritatively, [by IANA](https://www.iana.org/assignments/dns-sec-alg-numbers/dns-sec-alg-numbers.xhtml).
The supported hash algorithms for `DS` records are [listed here](https://www.iana.org/assignments/ds-rr-types/ds-rr-types.xhtml).


##### Key-signing ceremonies

As mentioned [above](#single-trust-anchor),
the key-signing key of the root zone acts as the [trust anchor](https://en.wikipedia.org/wiki/Trust_anchor) for DNSSEC.
Its hash is published [on the website of IANA](https://www.iana.org/dnssec/files)
together with a scan of handwritten signatures by [trusted community representatives](https://www.iana.org/dnssec/tcrs),
attesting the output of the used [hardware security module (HSM)](https://en.wikipedia.org/wiki/Hardware_security_module).
You can inspect the root public key [with the above tool](#tool-lookup-dns-records&domainName=.&recordType=DNSKEY&dnssecOk=true)
or by entering `dig . dnskey +dnssec`{:.enable-click-to-copy} into your command-line interface.
(The key-signing key is in the record which starts with 257.
The other record, starting with 256, contains the zone-signing key.)
All DNSSEC-aware DNS resolvers are delivered with a copy of this public key
in order to be able to validate resource records recursively.
The corresponding private key is stored in two secure facilities,
which safeguard the root key-signing key with geographical redundancy.
One of them is located on the US West Coast in [El Segundo, California](https://www.google.com/maps/place/El+Segundo,+CA+90245,+USA/),
the other one on the US East Coast in [Culpeper, Virginia](https://www.google.com/maps/place/Culpeper,+VA+22701,+USA/).
All [ceremonies](https://en.wikipedia.org/wiki/Key_ceremony) involving this private key
are [publicly documented](https://www.iana.org/dnssec/ceremonies)
in order to increase trust in the root key of DNSSEC.
For example, you can download the [log files](https://en.wikipedia.org/wiki/Log_file)
as well as camera footage from different angles from [a recent ceremony](https://www.iana.org/dnssec/ceremonies/41).
I can also recommend you to read this [first-hand account](https://www.cloudflare.com/dns/dnssec/root-signing-ceremony/).


##### Offline signing

For performance and security reasons,
DNSSEC has been designed so that the resource records in a zone can be signed before being served by a name server.
This allows the records to be signed on an [air-gapped computer](https://en.wikipedia.org/wiki/Air_gap_(networking)),
such as an HSM, which never needs to be connected to the Internet and is thus never exposed to network-based attacks.
As far as performance is concerned, name servers don't have to perform cryptographic operations for each request,
which means that fewer machines can serve more requests.
By not requiring access to the private key,
name servers including the [root servers](https://root-servers.org/)
can be located all over the world without potential for abuse by local governments.
While China, for example, can ([and does](https://en.wikipedia.org/wiki/Great_Firewall#Blocking_methods))
[inject forged DNS responses](http://www.sigcomm.org/sites/default/files/ccr/papers/2012/July/2317307-2317311.pdf)
in order to censor content on its network,
this practice is prevented or at least consistently detected when DNSSEC is used.
In other words, you have to trust only the administrator of a zone
and not the operator of an authoritative name server.
As mentioned just a few paragraphs [earlier](#single-trust-anchor),
requiring less trust is always better in computer security.


##### Resulting design complexity

Allowing the signatures to be computed in advance makes DNSSEC more complicated in several regards:

{:#replay-attacks}
- **Replay attacks**: Even if an attacker cannot forge a valid response,
  they can replace the response to a new request with the response from an earlier request
  if they can intercept the traffic on the victim's network.
  This is known as a [replay attack](https://en.wikipedia.org/wiki/Replay_attack)
  and is usually prevented by including a [random number used only once](https://en.wikipedia.org/wiki/Cryptographic_nonce)
  in the request, which then also has to be included in the authenticated response.
  However, due to the above [design decision](#offline-signing),
  DNSSEC signatures cannot depend on fresh data from the client.
  Since the potentially precomputed signatures stay the same for many requests
  and DNSSEC doesn't authenticate anything else in the response,
  such as the DNS packet itself including its header,
  an attacker can replay outdated DNS records including their DNSSEC signatures.
  In order to limit the period during which DNS records can be replayed,
  `RRSIG` records include an expiration date,
  after which the signature may no longer be used to authenticate the signed resource records.
  Suitable validity periods for DNSSEC signatures are discussed
  in [section 4.4.2 of RFC 6781](https://datatracker.ietf.org/doc/html/rfc6781#section-4.4.2).

{:#denial-of-existence}
- **Denial of existence**: How can you be sure that a domain name doesn't exist
  or doesn't have the queried record type
  without requiring the authoritative name server to sign such a statement on the fly?
  Since each label of a domain name (the part between two dots) can be up to 63 characters long,
  a domain can have more direct subdomains than there are
  [atoms in the observable universe](https://en.wikipedia.org/wiki/Observable_universe#Matter_content%E2%80%94number_of_atoms).
  (The limit of 63 characters is imposed by [RFC 1035](https://datatracker.ietf.org/doc/html/rfc1035)
  because the DNS protocol encodes the length of a label with a [6-bit number](https://stackoverflow.com/a/19341879/12917821).)
  This makes it impossible to generate and sign negative responses for all nonexistent subdomains in advance.
  A generic negative response, which doesn't depend on the queried domain name, doesn't work
  because an attacker could [replay such a response](#replay-attacks) even when the queried domain does exist.
  Instead of mentioning the nonexistent domain in the response,
  DNSSEC achieves [authenticated denial of existence](https://datatracker.ietf.org/doc/html/rfc7129)
  by returning that no subdomain exists in a given range,
  which includes the queried domain.
  Since all domains in a zone are known to the administrator of that zone,
  the gaps between the subdomains can be determined and signed in advance.
  <br>
  For example, if you [query the nonexistent domain](#tool-lookup-dns-records&domainName=nonexistent.ef1p.com.&recordType=A&dnssecOk=true)
  `nonexistent.ef1p.com.`, you get an `NSEC` record in the authority section of the response,
  which says that the next domain name in the zone after `hello.ef1p.com.` is `www.ef1p.com.`,
  and an `RRSIG` record, which signs the `NSEC` record.
  Since `nonexistent.ef1p.com.` comes after `hello.ef1p.com.` and before `www.ef1p.com.`
  in the alphabetically sorted list of subdomains in that zone,
  we now know for sure that this domain does not exist.
  The base domain of the zone,
  which is `ef1p.com.` in our example,
  is not just at the beginning of this list but also at the end.
  If you click on the magnifying glass after `www.ef1p.com.` in the data column of the `NSEC` record
  in order to [query the `NSEC` record](#tool-lookup-dns-records&domainName=www.ef1p.com.&recordType=NSEC&dnssecOk=true) of `www.ef1p.com.`,
  you see that the next domain after `www.ef1p.com.` is `ef1p.com.`.
  In other words, the list of subdomains wraps around
  for the purpose of determining the gaps to sign.
  <br>
  Each `NSEC` record also specifies the types of records
  that the domain to which it belongs has.
  If you query, for example, the [`MX` record of `hello.ef1p.com.`](#tool-lookup-dns-records&domainName=hello.ef1p.com.&recordType=MX&dnssecOk=true),
  you get the `NSEC` record of that domain instead.
  Since `MX` is not listed in this `NSEC` record,
  you can be certain that no such record exists.
  While an attacker might still be able to drop the response to your DNS query,
  `NSEC` records prevent them from lying about the existence of a domain name or record type.
  In particular, they cannot strip DNSSEC information from a response
  because a resolver can check whether a zone has DNSSEC enabled
  by querying the `DS` record in the parent zone.
  Since the resolver knows that the root zone has DNSSEC enabled,
  the attacker would have to be able to deny the existence of a `DS` record in an authenticated zone,
  which they cannot do thanks to the mechanism described in this paragraph.
  In practice, your zone can have DNSSEC enabled only if all the zones above it have DNSSEC enabled.

{:#zone-walking}
- **Zone walking**: `NSEC` records create a new problem, though.
  By querying the `NSEC` record of the respective subsequent domain,
  you can enumerate all the domains in a zone,
  which is known as walking the zone.
  While all the information in the Domain Name System is public
  in the sense that it can be requested by anyone
  because the sender of a query is never authenticated,
  you previously had to guess the names of subdomains.
  Since I couldn't find a tool to walk a DNS zone online
  (the [closest one](https://hackertarget.com/find-dns-host-records/)
  I could find works completely differently),
  I built one for you,
  using the same [Google API](https://developers.google.com/speed/public-dns/docs/doh/json) as [before](#tool-lookup-dns-records):
  <div id="tool-lookup-zone-domains" class="mt-3"></div>
  Unfortunately, not many domains have DNSSEC records,
  and most of them which do use `NSEC3` rather than `NSEC`.
  It's thus not easy to find domains to feed into this tool.
  Besides the [root zone](https://en.wikipedia.org/wiki/DNS_root_zone),
  which is [walkable](#tool-lookup-zone-domains&startDomain=.),
  [some top-level domains (TLD)](https://www.farsightsecurity.com/blog/txt-record/zone-walking-20170901/)
  also use `NSEC` records for authenticated denial of existence,
  which means that one can list all domains registered under such a TLD.
  Among those are [country-code top-level domains](https://en.wikipedia.org/wiki/Country_code_top-level_domain)
  such as [.br (Brazil)](#tool-lookup-zone-domains&startDomain=br.),
  [.kg (Kyrgyzstan)](#tool-lookup-zone-domains&startDomain=kg.),
  [.lk (Sri Lanka)](#tool-lookup-zone-domains&startDomain=lk.),
  [.lr (Liberia)](#tool-lookup-zone-domains&startDomain=lr.),
  [.pr (Puerto Rico)](#tool-lookup-zone-domains&startDomain=pr.),
  and [.tn (Tunisia)](#tool-lookup-zone-domains&startDomain=tn.),
  as well as [generic top-level domains](https://en.wikipedia.org/wiki/Generic_top-level_domain)
  such as [.audio](#tool-lookup-zone-domains&startDomain=audio.),
  [.auto](#tool-lookup-zone-domains&startDomain=auto.),
  [.game](#tool-lookup-zone-domains&startDomain=game.),
  [.hosting](#tool-lookup-zone-domains&startDomain=hosting.),
  [.lol](#tool-lookup-zone-domains&startDomain=lol.),
  and [.pics](#tool-lookup-zone-domains&startDomain=pics.).
  <br>
  For security and privacy reasons, many organizations prefer
  not to expose the content of their zone so easily.
  This problem was first addressed by [RFC 4470](https://datatracker.ietf.org/doc/html/rfc4470),
  which suggested generating and signing minimally covering `NSEC` records for nonexistent domains on the fly,
  and later by [RFC 5155](https://datatracker.ietf.org/doc/html/rfc5155),
  which introduced the new record type `NSEC3`.
  As the former proposal abandons offline signing,
  thereby sacrificing security for better privacy,
  we'll focus on the latter proposal in this bullet point.
  <br>
  Instead of determining the gaps between domain names directly,
  all domain names in a zone are hashed in the case of `NSEC3`.
  These hashes are then sorted,
  and an `NSEC3` record is created for each gap in this list.
  If a DNS resolver queries a domain name that doesn't exist,
  the name server responds with the `NSEC3` record
  whose range covers the hash of the queried domain.
  Similar to `NSEC` records,
  `NSEC3` records also list the record types
  that exist for the domain name
  which hashes to the start of the range.
  Thus, if the queried domain name exists but the queried record type doesn't,
  a resolver can verify such a negative response
  by checking that the hash of the queried domain matches the start value of the received `NSEC3` record.
  An `NSEC3` record also indicates which hash function is used,
  how many times the hash function is applied to a domain name,
  and optionally a [random value](https://en.wikipedia.org/wiki/Salt_(cryptography)),
  which is mixed into the hash function in order to defend against
  [pre-computed hash attacks](https://en.wikipedia.org/wiki/Rainbow_table).
  While an attacker can try to brute-force the names of subdomains
  based on the hashes it received in `NSEC3` records,
  such a random value restricts the attack to one zone at a time.
  The computational effort of such a targeted attack can be increased
  by increasing the number of times the hash function is applied.
  The difference to just querying guessed subdomain names
  is that the search for the [preimage](https://en.wikipedia.org/wiki/Preimage_attack)
  of a hash can be done without interacting with the authoritative name server.
  <br>
  Besides protecting the domain names with a one-way function,
  `NSEC3` also allows to skip the names of unsigned subzones
  when determining the gaps to sign by setting the
  [opt-out flag](https://datatracker.ietf.org/doc/html/rfc5155#section-3.1.2.1).
  By skipping all subzones that don't deploy DNSSEC,
  the size of a zone can be reduced as fewer `NSEC3` records are required.
  While easily guessable subdomains, such as `www` or `mail`, have to be considered public anyway,
  `NSEC3` protects the resource records of subdomains with more random names reasonably well.
  <br>
  Please note that the DNS query still has to include the actual domain name and not its hash.
  By just learning the hash of a subdomain,
  you don't yet know the domain name to query.
  However, it's still relatively easy to figure out the overall number of domain names in a zone
  by probing the name server with names that hash to a range
  for which you haven't seen an `NSEC3` record yet.
  Hash functions make only the task of finding an input that hashes to a specific output hard,
  but if the output just has to land in a certain range,
  then the bigger the range, the easier the problem.
  Even if you introduce additional dummy `NSEC3` records,
  you still leak an upper limit of domain names in the zone.

{:#compact-denial-of-existence}
- **Compact Denial of Existence**: Since publishing this article,
  online signing (i.e. computing RRSIG signatures on demand instead of in advance) has become more popular.
  In September 2025, [RFC 9824](https://datatracker.ietf.org/doc/html/rfc9824) has been published,
  which suggests to respond to a query for a nonexistent domain
  by claiming that the domain name exists but that it has no resource records of the queried type.
  For this purpose, the RFC introduces a new record type `NXNAME`,
  which can be listed in `NSEC` records to signal that the queried domain name does not exist.
  In the next domain name field of the `NSEC` record,
  the queried domain name is prefixed with a label consisting of a single null octet,
  which is written as `\000`.
  You can see this [when you query nonexistent.ietf.org](#tool-lookup-dns-records&domainName=nonexistent.ietf.org&recordType=NSEC&dnssecOk=true).
  Zones which use this technique, such as [ietf.org](#tool-lookup-zone-domains&startDomain=ietf.org&resultLimit=10), cannot be walked.

{:#wildcard-expansion}
- **Wildcard expansion**: Last but not least,
  [wildcard records](https://en.wikipedia.org/wiki/Wildcard_DNS_record)
  make DNSSEC even more complicated.
  The idea of a wildcard record is
  that it is returned
  whenever the queried domain name doesn't exist in the zone.
  For example, if an ordinary record is declared at `mail.example.com.`
  and a wildcard record is declared at `*.example.com.`,
  with `*` being the [wildcard character](https://en.wikipedia.org/wiki/Wildcard_character),
  a query for `mail.example.com.` will return the former record,
  and a query for `anything-else.example.com.` will return the latter.
  The wildcard can be used only as the leftmost DNS label
  and cannot be combined with other characters on that level.
  Thus, neither `mail.*.example.com.` nor `mail*.example.com.` is a wildcard record.
  For a wildcard record to match,
  the domain name may not exist on the level of the wildcard.
  The above wildcard record matches `anything.else.example.com.`
  because `else.example.com.` doesn't exist,
  but it doesn't match `anything.mail.example.com.`
  because `mail.example.com.` exists.
  Whether a wildcard name matches is determined
  independently from the queried record type.
  For example, if `mail.example.com.` has only an `MX` record
  while `*.example.com` has an `A` record,
  then querying `mail.example.com.` for an `A` record returns no data.
  However, not all implementations adhere to these rules.
  Without DNSSEC (or when [Compact Denial of Existence](#compact-denial-of-existence) is being used
  to [generate a response](https://datatracker.ietf.org/doc/html/rfc9824#section-3.3) for the queried domain name on the fly),
  DNS resolvers don't learn
  whether an answer has been synthesized from a wildcard record
  or whether the returned record exists as such in the zone.
  <br>
  Since signatures cannot be precomputed for all possible matches,
  `RRSIG` records indicate the number of labels
  in the domain name to which they belong,
  without counting the empty label for the root
  and the potential wildcard label.
  This allows a validator to reconstruct the original name,
  which is covered in the signature
  and thus required to verify the signature.
  For example, when querying the [IPv4 address](#internet-protocol-version-4) of `anything.else.example.com.`,
  the returned `A` record is accompanied
  by an `RRSIG` record with a label count of 2.
  This tells the validator to verify the signature for `*.example.com.`.
  If the label count was 3, it would have been `*.else.example.com.`.
  <br>
  Equally importantly, we need to ensure
  that this wildcard `RRSIG` record cannot be replayed
  for domain names that do exist,
  such as `mail.example.com.` in our example.
  For this reason, DNSSEC mandates
  that wildcard `RRSIG` records are valid only
  if an `NSEC` or an `NSEC3` record proves
  that the queried domain name doesn't exist.
  This means that the response to `anything.else.example.com.`
  includes not just an `A` and an `RRSIG` record
  but also an `NSEC(3)` record.
  The wildcard domain name is included as such
  in the list used to determine the `NSEC(3)` records.
  This is important to prove
  that a domain name doesn't exist
  or that a synthesized domain name doesn't have the queried record type.
  For example, the response for `anything.mail.example.com.` has to include
  an `NSEC(3)` record which proves that `anything.mail.example.com.` doesn't exist,
  an `NSEC(3)` record which proves that `mail.example.com.` does exist,
  and an `NSEC(3)` record which proves that `*.mail.example.com.` doesn't exist.
  If, on the other hand, `anything-else.example.com.` is queried for an `MX` record,
  the response has to include an `NSEC(3)` record
  which proves that `anything-else.example.com.` doesn't exist,
  and the `NSEC(3)` record at `*.example.com.`,
  which proves that wildcard-expanded domain names don't have records of this type.
  If some of these `NSEC(3)` records are the same,
  the name server should include them and the corresponding `RRSIG` records only once
  in the authority section of the response.
  If this is still confusing,
  you find a longer explanation of wildcards in DNSSEC
  [here](https://datatracker.ietf.org/doc/html/rfc7129#section-5.5).

{:#amplification-attacks}
- **Amplification attacks**:
  By including relatively large `RRSIG` records in its responses
  and by requiring up to three `NSEC(3)` records for [wildcard expansion](#wildcard-expansion),
  DNSSEC increases the size of DNS responses significantly.
  While the [vast majority](https://labs.ripe.net/author/giovane_moura/fragmentation-truncation-and-timeouts-are-large-dns-messages-falling-to-bits/)
  of DNSSEC responses still fit into a single [UDP](#user-datagram-protocol) packet
  without having to [fall back](#transport-protocol) on [TCP](#transmission-control-protocol),
  an attacker can send a multiple of their own bandwidth to a victim's computer
  by [changing the source address](#ip-address-spoofing) of DNS requests with large responses to the victim's IP address.
  This is known as a [DNS amplification attack](https://en.wikipedia.org/wiki/Denial-of-service_attack#Amplification),
  which is a type of [denial-of-service attack](https://en.wikipedia.org/wiki/Denial-of-service_attack).
  DNS providers [mitigate amplification attacks](https://www.cloudflare.com/dns/dnssec/dnssec-complexities-and-considerations/)
  using techniques such as [response rate limiting (RRL)](https://kb.isc.org/docs/aa-01000).


##### Varied adoption

Even though the [Domain Name System](#domain-name-system) is a core component of the Internet
and should be secured accordingly,
the deployment of DNSSEC [varies a lot](https://blog.apnic.net/2023/09/18/measuring-the-use-of-dnssec/).
While [around a third](https://stats.labs.apnic.net/dnssec) of worldwide users
[indirectly use](#dns-stub-resolvers) DNS resolvers which fully validate DNSSEC
and [more than half](https://www.sidn.nl/en/news-and-blogs/majority-of-dutch-domains-and-internet-users-have-dnssec-security#dnssec-use-within-tlds)
of all domains registered at several European [country-code top-level domains](https://en.wikipedia.org/wiki/Country_code_top-level_domain),
such as the [Dutch (.nl)](https://en.wikipedia.org/wiki/.nl),
[Czech (.cz)](https://en.wikipedia.org/wiki/.cz),
[Norwegian (.no)](https://en.wikipedia.org/wiki/.no),
[Swedish (.se)](https://en.wikipedia.org/wiki/.se),
and [since 2025](https://www.nic.ch/export/shared/.content/files/Switch_Report_Registry_2024.pdf)
also the [Swiss (.ch)](https://en.wikipedia.org/wiki/.ch) zone,
use DNSSEC to authenticate their records,
only [around 4%](https://www.verisign.com/resources/dnssec-tools/dnssec-scoreboard/) of [.com](https://en.wikipedia.org/wiki/.com) domains
and [around 5%](https://www.verisign.com/resources/dnssec-tools/dnssec-scoreboard/) of [.net](https://en.wikipedia.org/wiki/.net) domains
have DNSSEC enabled in 2025.
When you play around with the [above tool](#tool-lookup-dns-records), you will note in particular that
[none of the big tech companies](https://www.sidn.nl/en/news-and-blogs/none-of-the-biggest-internet-services-are-dnssec-enabled)
protect their DNS records with DNSSEC.
As these companies dominate Internet traffic,
[around 96%](https://stats.labs.apnic.net/cfdnssecdata/) of all DNS queries are for unsigned domain names.
The reason for their reluctance to deploy DNSSEC seems to be operational risks
(see [this list of DNSSEC outages](https://ianix.com/pub/dnssec-outages.html) due to misconfigurations,
which bring down a zone and its subzones with all their services)
and overhead ([key management](https://en.wikipedia.org/wiki/Key_management) with rollovers, larger responses, and potentially on-the-fly signing)
with limited security benefits as most of their traffic is via [HTTPS](#hypertext-transfer-protocol),
whose communication is secured with [TLS](#transport-layer-security) and [public-key certificates](#public-key-infrastructure).
However, DNS supports more than just [IP addresses](#internet-protocol-version-4) of webservers,
such as [autoconfiguration of mail clients](/email/#autoconfiguration),
[indirect resolution of mail servers](/email/#address-resolution),
and [sender authentication of emails](/email/#fixes),
among [many](/email/#smimea-resource-record) [other](/email/#openpgpkey-resource-record) [things](/email/#sshfp-resource-record),
which DNSSEC secures as well.


##### Digest computation

[IANA](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority)
publishes the [key-signing key](#key-signing-keys-and-zone-signing-keys) of the [root zone](#administrative-zones)
at [https://data.iana.org/root-anchors/root-anchors.xml](https://data.iana.org/root-anchors/root-anchors.xml):

<figure markdown="block">

```xml
…
<KeyDigest id="Kmyv6jo" validFrom="2024-07-18T00:00:00+00:00">
  <KeyTag>38696</KeyTag>
  <Algorithm>8</Algorithm>
  <DigestType>2</DigestType>
  <Digest>683D2D0ACB8C9B712A1948B27F741219298D0A450D612C483AF444A4C0FB2B16</Digest>
  <PublicKey>AwEAAa96jeuknZlaeSrvyAJj6ZHv28hhOKkx3rLGXVaC6rXTsDc449/cidltpkyGwCJNnOAlFNKF2jBosZBU5eeHspaQWOmOElZsjICMQMC3aeHbGiShvZsx4wMYSjH8e7Vrhbu6irwCzVBApESjbUdpWWmEnhathWu1jo+siFUiRAAxm9qyJNg/wOZqqzL/dL/q8PkcRU5oUKEpUge71M3ej2/7CPqpdVwuMoTvoB+ZOT4YeGyxMvHmbrxlFzGOHOijtzN+u1TQNatX2XBuzZNQ1K+s2CXkPIZo7s6JgZyvaBevYtxPvYLw4z9mR7K2vaF18UYH9Z9GNUUeayffKC73PYc=</PublicKey>
  <Flags>257</Flags>
</KeyDigest>
…
```

<figcaption markdown="span">
The newest key-signing key of the root zone,
formatted in the [Extensible Markup Language (XML)](https://en.wikipedia.org/wiki/XML).
</figcaption>
</figure>

You find the same digest in [this PDF](https://www.iana.org/reports/2024/root-ksk-2024.pdf),
which is covered with handwritten signatures by [trusted community representatives](https://www.iana.org/dnssec/tcrs).
(Digest is just a synonym for [hash](https://en.wikipedia.org/wiki/Cryptographic_hash_function).)
In this section, I explain [how the digest is computed](https://security.stackexchange.com/a/269147/228462).
According to [RFC 4034](https://datatracker.ietf.org/doc/html/rfc4034#section-5.1.4),

```js
digest = digest_algorithm(DNSKEY owner name | DNSKEY RDATA);
DNSKEY RDATA = Flags | Protocol | Algorithm | Public Key.
```

where `|` denotes [concatenation](https://en.wikipedia.org/wiki/Concatenation).
We thus need to hash the following [binary data](#number-encoding), which I write in [hexadecimal notation](#number-encoding):
- `\x00`: the encoding of the root domain `.`
  (every domain name is [terminated by a length byte of zero](https://datatracker.ietf.org/doc/html/rfc1035#section-3.1)),
- `\x01\x01`: [257](#key-signing-ceremonies) in the [flags field](https://datatracker.ietf.org/doc/html/rfc4034#section-2.1.1)
  (257 denotes a key-signing key, 256 a [zone-signing key](#key-signing-keys-and-zone-signing-keys)),
- `\x03`: 3 in the [protocol field](https://datatracker.ietf.org/doc/html/rfc4034#section-2.1.2)
  (this value is always 3 [according to the RFC](https://datatracker.ietf.org/doc/html/rfc4034#section-2.1.2)),
- `\x08`: 8 in the [algorithm field](https://datatracker.ietf.org/doc/html/rfc4034#section-2.1.3)
  (which refers to [RSA](https://en.wikipedia.org/wiki/RSA_cryptosystem)/[SHA-256](https://en.wikipedia.org/wiki/SHA-2)
  according to [this registry](https://www.iana.org/assignments/dns-sec-alg-numbers/dns-sec-alg-numbers.xhtml)),
- the above public key [in binary](https://datatracker.ietf.org/doc/html/rfc4034#section-2.1.4) instead of [Base64 encoding](#text-based-protocols).

We have to compute the `<DigestType>` 2 of this data,
which according to [this registry](https://www.iana.org/assignments/ds-rr-types/ds-rr-types.xhtml) is [SHA-256](/email/#secure-hash-algorithms):

<figure markdown="block">
<div id="code-digest-computation"></div>
<figcaption markdown="span" style="max-width: 725px;">

How to compute the digest of the root zone's key-signing key.
([`awk`](https://en.wikipedia.org/wiki/AWK) simply renders the output more nicely.)

</figcaption>
</figure>


##### Further reading

If you want to learn more about DNSSEC,
the Dutch [registry operator](https://en.wikipedia.org/wiki/Domain_name_registry)
[SIDN](https://en.wikipedia.org/wiki/.nl) has a
[great FAQ](https://www.sidn.nl/en/modern-internet-standards/dnssec).

</details>

<details markdown="block">
<summary markdown="span" id="dns-stub-resolvers">
DNS stub resolvers
</summary>

A big problem of [DNSSEC](#domain-name-system-security-extensions) is
that most applications leave the resolution of domain names to the operating system [by default](#dns-configuration-recommendations)
and most operating systems (except [OpenBSD](https://en.wikipedia.org/wiki/OpenBSD)) don't validate DNSSEC by default.
Operating systems are usually shipped with [stub resolvers](https://datatracker.ietf.org/doc/html/rfc4033#section-7),
which [cache responses](#distributed-database)
but leave the recursive querying of [authoritative servers](https://datatracker.ietf.org/doc/html/rfc9499#section-6-4.36)
to a [recursive resolver](https://en.wikipedia.org/wiki/Domain_Name_System#DNS_resolvers).
Your computer learns which name server to query typically via [DHCP](#dynamic-host-configuration-protocol)
(through [option 6](#wireshark-dhcp)) when joining a network.
The [router](#hubs-switches-and-routers) often provides its own [IP address](#internet-protocol-version-4)
and then [forwards](https://datatracker.ietf.org/doc/html/rfc9499#section-6-4.62) all [DNS queries](#domain-name-system)
to the recursive resolver of your [Internet service provider (ISP)](https://en.wikipedia.org/wiki/Internet_service_provider).

<figure markdown="block">
{% include_relative generated/domain-name-resolution.embedded.svg %}
<figcaption markdown="span" style="max-width: 725px;">

What a typical domain name resolution looks like when you visit the domain `ef1p.com`.
The recursive resolver first queries the authoritative server of the [root zone](https://en.wikipedia.org/wiki/DNS_root_zone) for authoritative servers of the `.com` zone
before querying one of them for an authoritative server of the `ef1p.com` zone,
which returns the `A` records associated with `ef1p.com`.
(Not sending the original query to all authoritative servers is known as
[QNAME minimization](https://blog.verisign.com/security/maximizing-qname-minimization-a-new-chapter-in-dns-protocol-evolution/)
as described in [RFC 9156](https://datatracker.ietf.org/doc/html/rfc9156).)

</figcaption>
</figure>

Many recursive resolvers validate DNSSEC, but all the resolvers before it typically don't,
which means that they have to trust the recursive resolver and the [insecure network](#problems-with-plaintext-dns).
Validating DNSSEC only on the recursive resolver rather than on your device leads to two problems:
- **Insecure last mile**:
  Ordinary DNS leaves the ["last mile"](https://www.sidn.nl/en/modern-internet-standards/dnssec#faq-What%20is%20the%20%27last%20mile'%3F)
  from the recursive resolver of your ISP to your device vulnerable to tampering and censorship,
  especially when using public Wi-Fis.
  There are [several protocols to secure DNS connections](#secure-dns-connections),
  but unfortunately, they aren't widely used because they require [manual configuration](#dns-configuration-recommendations),
  which is [about to change](#discovery-of-designated-resolvers).
- **Opaque upstream failure**:
  When a recursive resolver fails to validate DNSSEC,
  it returns the error code [`SERVFAIL`](https://en.wikipedia.org/wiki/Domain_Name_System#DNS_message_format) (server failure).
  When receiving this generic error, which is used for many DNS problems,
  browsers display a message such as "this site can't be reached",
  "we're having trouble finding that site", or "server not found".
  Such messages don't inform the user about what's causing the issue and who's fault it is,
  making the user experience of DNSSEC failures opaque and frustrating.
  And unlike invalid [TLS](#transport-layer-security) [certificates](#public-key-infrastructure),
  the user cannot override the failure to connect anyway.
  While this behavior is desirable from a security standpoint, it increases frustration in benign cases.
  [RFC 8914](https://datatracker.ietf.org/doc/html/rfc8914), published in 2020,
  introduced [Extended DNS Errors (EDE)](https://developers.cloudflare.com/1.1.1.1/infrastructure/extended-dns-error-codes/),
  which allow applications to distinguish between different `SERVFAIL` causes.
  Hopefully, this will lead to more informative error messages in the future.

You can check whether your browser's DNS setup validates DNSSEC by visiting [dnssec-failed.org](http://dnssec-failed.org/),
a [documented test site](https://www.internetsociety.org/resources/deploy360/2013/dnssec-test-sites/), for which DNSSEC validation fails.
If you don't get an error message, your browser uses the stub resolver of your operating system
and none of the involved resolvers validate DNSSEC.
If you get an error, it might be that your browser uses a [different resolver path](#how-to-configure-your-browser) than your operating system.
You can check whether any resolver in the resolver path of your operating system validates DNSSEC
by using the [dig command](https://en.wikipedia.org/wiki/Dig_(command))
on your [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface):

<figure markdown="block">
<div id="code-dig-without-dnssec-validation"></div>
<figcaption markdown="span" style="max-width: 780px;">

When using the default DNS resolver, I get no error
and `dnssec-failed.org` resolves to an `A` record, which it shouldn't.
This means that the recursive resolver of my ISP doesn't validate DNSSEC.
I highlighted the relevant parts of the output in color.

</figcaption>
</figure>

<figure markdown="block">
<div id="code-dig-with-dnssec-validation"></div>
<figcaption markdown="span" style="max-width: 840px;">

When telling `dig` to use [Google's public DNS resolver](https://developers.google.com/speed/public-dns/docs/using) `@8.8.8.8`,
[which validates DNSSEC](https://developers.google.com/speed/public-dns/docs/security#dnssec),
you get the output above: The status is `SERVFAIL` and under `OPT PSEUDOSECTION:`
follows the [Extension Mechanisms for DNS (EDNS)](https://en.wikipedia.org/wiki/Extension_Mechanisms_for_DNS)
as specified in [RFC 6891](https://datatracker.ietf.org/doc/html/rfc6891).
In EDNS, the [option code 15](https://datatracker.ietf.org/doc/html/rfc8914#section-2-5.1) (`OPT=15`)
stands for [Extended DNS Errors (EDE)](https://datatracker.ietf.org/doc/html/rfc8914).
The EDE data, which I highlighted in blue, is printed in [hexadecimal](#number-encoding) on a single line.
The [first two bytes](https://datatracker.ietf.org/doc/html/rfc8914#section-2-5.5), which I underlined, contain the EDE error code.
Error code 9 means [DNSKEY missing](https://datatracker.ietf.org/doc/html/rfc8914#section-4.10).
The remaining bytes contain a short, human-readable explanation
[encoded](#text-encoding) [in UTF-8](https://datatracker.ietf.org/doc/html/rfc8914#section-2-5.7).
`dig` renders the text in parentheses after the raw bytes.
The two periods represent the error code in the first two bytes, which cannot be printed.
Since [ASCII is a subset of UTF-8](#text-encoding),
you can use the [ASCII table](https://en.wikipedia.org/wiki/ASCII#Printable_character_table)
to decode the remaining bytes: 4e → N, 6f → o, 20 → space, and so on.
Newer versions of `dig` render the blue line more nicely.

</figcaption>
</figure>

Google's custom name server replies to requests for the `TXT` record of `o-o.myaddr.l.google.com`
with the [IP address](#internet-protocol-version-4) of the requester.
This allows you to determine the IP address of your current recursive resolver with the following command
on your [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface):
`dig +short o-o.myaddr.l.google.com TXT`{:.enable-click-to-copy}.
When you query Google's authoritative name server directly with
`dig @ns1.google.com +short o-o.myaddr.l.google.com TXT`{:.enable-click-to-copy},
you get the IP address of your computer
(or of [your router](#hubs-switches-and-routers)
after [network address translation](#network-address-translation)).
([Akamai](https://en.wikipedia.org/wiki/Akamai_Technologies) provides a
[similar service](https://www.akamai.com/blog/developers/introducing-new-whoami-tool-dns-resolver-information).)
(Click on the two commands to copy them.)

</details>

<details markdown="block">
<summary markdown="span" id="secure-dns-connections">
Secure DNS connections
</summary>


##### Problems with plaintext DNS

The [classic DNS protocol](#transport-protocol), which is sometimes called
[DNS over UDP and TCP port 53 (Do53)](https://en.wikipedia.org/wiki/Domain_Name_System#Conventional:_DNS_over_UDP_and_TCP_port_53_(Do53)),
is neither [encrypted](https://en.wikipedia.org/wiki/Encryption) nor [authenticated](https://en.wikipedia.org/wiki/Message_authentication_code),
which leads to the following problems:
- **Privacy**:
  Since [most Wi-Fi networks aren't secure](#wi-fi-protected-access),
  all devices in your network can learn about [all the domain names that you look up](#screenshots-of-examples).
  This is especially bad when using the public Wi-Fi in restaurants, hotels, and airports.
  While the privacy risk is most acute in your local network for your communication with the [recursive resolver](#dns-stub-resolvers),
  it still exists for the communication [between the recursive resolver and authoritative servers](#between-recursive-resolvers-and-authoritative-servers),
  especially [when using ECS](#edns-client-subnet).
- **Security**:
  While [DNSSEC](#domain-name-system-security-extensions) prevents bogus and censored DNS replies,
  it is [rarely validated on your device](#dns-stub-resolvers),
  which makes [secure DNS protocols](#secure-dns-protocols) essential also for security.
  There are two scenarios to consider:
  - **Communication with the router**:
    If you cannot verify that a reply comes [from the router](#dns-stub-resolvers) (or the recursive resolver behind it),
    [any device on your Wi-Fi network](#wi-fi-protected-access) can respond to your DNS queries faster than the router,
    thereby [poisoning your cache](https://en.wikipedia.org/wiki/DNS_spoofing) with malicious records
    (including malicious [negative responses](https://en.wikipedia.org/wiki/Negative_cache) for censoring).
    This is known as a DNS race attack.
  - **Communication with a custom resolver**:
    By default, your operating system uses the recursive resolver [provided by the router](#dns-stub-resolvers).
    As you have no idea who operates the router in a public network and whether the router is properly maintained or compromised,
    you should configure your devices to use a [recursive resolver of your choosing](#dns-configuration-recommendations).
    Since all communication with the custom resolver passes through the potentially malicious router,
    a custom resolver improves your security only if the communication with it is secure.

The rest of this box goes into technical details about [secure DNS protocols](#secure-dns-protocols)
and how to [discover](#discovery-of-designated-resolvers) [them](#discovery-of-network-designated-resolvers).
If you're not a software engineer, I suggest you continue with [how to configure your device](#dns-configuration-recommendations)
to improve the privacy and security of your [DNS setup](#dns-stub-resolvers).


##### Secure DNS protocols

The [Internet Engineering Task Force (IETF)](#request-for-comments) standardized three encrypted and authenticated
[transport protocols for DNS](https://en.wikipedia.org/wiki/Domain_Name_System#Transport_protocols):

| Name | RFC | Over | Port | Framing | Authentication | [ALPN](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation) identifier
|-
| [**DNS over TLS (DoT)**](https://en.wikipedia.org/wiki/DNS_over_TLS) | [RFC 7858](https://datatracker.ietf.org/doc/html/rfc7858) | [TLS](#transport-layer-security) | 853 ([TCP](#transmission-control-protocol)) | 2-byte length prefix | Optional | `dot`
| [**DNS over HTTPS (DoH)**](https://en.wikipedia.org/wiki/DNS_over_HTTPS) | [RFC 8484](https://datatracker.ietf.org/doc/html/rfc8484) | [HTTPS](#hypertext-transfer-protocol) | 443 | HTTP framing | Mandatory | `h2` or `h3`
| [**DNS over QUIC (DoQ)**](https://en.wikipedia.org/wiki/Domain_Name_System#DNS_over_QUIC_(DoQ)) | [RFC 9250](https://datatracker.ietf.org/doc/html/rfc9250) | [QUIC](#quic) | 853 ([UDP](#user-datagram-protocol)) | 2-byte length prefix | Encouraged | `doq`
{:.text-nowrap}

All three protocols use the same [binary encoding](#text-based-protocols)
that is used in the [classic DNS protocol](#problems-with-plaintext-dns) on [port 53](#transport-protocol).
DoT and DoQ prefix the DNS message with its length [encoded in two bytes](#number-encoding)
exactly [like DNS over TCP](https://datatracker.ietf.org/doc/html/rfc1035#section-4.2.2).
DoH works over any [HTTP](#hypertext-transfer-protocol) version with either:
- [`POST`](https://en.wikipedia.org/wiki/POST_(HTTP)):
  The binary DNS message is sent in the HTTP message body with the header
  [`Content-Type:`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Type) `application/dns-message`.
  In HTTP/1.1, its size is conveyed via the [`Content-Length` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Length).
  In HTTP/2 and HTTP/3, the length of the DNS message is inferred from the [`DATA` frames](https://datatracker.ietf.org/doc/html/rfc9113#section-6.1).
  Clients should set the [Accept header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Accept) to `Accept: application/dns-message`.
- [`GET`](https://en.wikipedia.org/wiki/HTTP#Method):
  The binary DNS message is [base64url](https://datatracker.ietf.org/doc/html/rfc4648#section-5)-encoded
  (i.e. [Base64](#text-based-protocols)-encoded with `-` instead of `+` and `_` instead of `/`)
  and passed in the [query parameter](https://en.wikipedia.org/wiki/Query_string) with the name `dns`
  as part of the [URL](https://en.wikipedia.org/wiki/URL).
  There is no length indication for this parameter.

Each DoH server [can choose](https://datatracker.ietf.org/doc/html/rfc8484#section-3)
the [path](https://en.wikipedia.org/wiki/URL#Syntax) at which it provides the service.
This allows a single server to host several DoH [endpoints](https://en.wikipedia.org/wiki/Web_API#Endpoints) with different properties.
The path is typically [`/dns-query`](https://datatracker.ietf.org/doc/html/rfc8484#section-4.1.1),
which results in [URI Templates](https://datatracker.ietf.org/doc/html/rfc6570)
such as [`https://dns.google/dns-query{?dns}`](https://developers.google.com/speed/public-dns/docs/doh).
(Google also provides a [JSON](https://en.wikipedia.org/wiki/JSON) [API](https://en.wikipedia.org/wiki/Web_API)
at [`https://dns.google/resolve?`](https://developers.google.com/speed/public-dns/docs/doh/json),
which I use in the [DNS tool](#dns-lookup-tool) above.
While other companies use the same format, the JSON API isn't standardized.
In particular, the format doesn't adhere to [RFC 8427](https://datatracker.ietf.org/doc/html/rfc8427).)
Please note that for both endpoints, the [HTTP response status code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status)
can be [200 (success)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/200) even when the DNS lookup failed,
for example due to `SERVFAIL` or `NXDOMAIN`.
You have to check the [DNS response code](https://en.wikipedia.org/wiki/Domain_Name_System#DNS_message_format).
(In the JSON API, the field is called [`Status`](https://developers.google.com/speed/public-dns/docs/doh/json#dns_response_in_json).)

While the outgoing [port](#port-numbers) of DoT and DoQ might get blocked by a [firewall](#firewall) on a [router](#hubs-switches-and-routers),
DoH looks like normal [web traffic](https://en.wikipedia.org/wiki/Web_traffic),
which is a form of [tunnelling](https://en.wikipedia.org/wiki/Tunneling_protocol#Circumventing_firewall_policy).
The additional [round trips](#network-performance) of these secure DNS protocols when compared to classic DNS over [UDP](#user-datagram-protocol)
can be amortized by keeping the connection to the resolver alive for future queries.

DoH [requires](https://datatracker.ietf.org/doc/html/rfc8484#section-8.1)
that the client authenticates the [DNS resolver](#dns-stub-resolvers) with a [X.509 certificate](#public-key-infrastructure).
DoT, on the other hand, can be used [opportunistically](https://datatracker.ietf.org/doc/html/rfc7858#section-4.1),
for example when only an [IP address](#internet-protocol-version-4) but no [domain name](#name-registration) of the resolver is known.
While [opportunistic encryption](https://en.wikipedia.org/wiki/Opportunistic_encryption) provides [privacy](#problems-with-plaintext-dns)
in the presence of a [passive attacker](https://en.wikipedia.org/wiki/Passive_attack)
and is thus preferable to communicating in [plaintext](https://en.wikipedia.org/wiki/Plaintext),
not authenticating the resolver leaves the client vulnerable to
a [man-in-the-middle attack](https://en.wikipedia.org/wiki/Man-in-the-middle_attack) by an active attacker.
If the resolver's [hostname](https://en.wikipedia.org/wiki/Hostname) is known and the resolver supports DoT,
the client shouldn't fall back to [classic DNS](#transport-protocol) on (attacker-induced) failure.


##### SVCB and HTTPS resource records

[RFC 9460](https://datatracker.ietf.org/doc/html/rfc9460) introduces two new [resource record types](#resource-record-types)
to improve performance, privacy, and security when accessing services:

{:#svcb-resource-records}
- `SVCB` (contraction of "service binding") records inform [clients](#client-server-model) how to connect to a given service before opening a connection.
  When a client wants to connect to the service identified by the [URL](https://en.wikipedia.org/wiki/URL) `scheme://host:port`,
  it looks up the `SVCB` records [at the domain](https://datatracker.ietf.org/doc/html/rfc9460#section-2.3) `_port._scheme.host`
  if `SVCB` records are defined for the given `scheme` and the client supports them.
  Using subdomains starting with an underscore under the domain to which the records actually apply
  follows the "Attribute Leaves" naming convention formalized in [RFC 8552](https://datatracker.ietf.org/doc/html/rfc8552).
  Schemes which define the use of `SVCB` records [must be registered](https://datatracker.ietf.org/doc/html/rfc9460#section-11)
  with the [Internet Assigned Numbers Authority (IANA)](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority) for inclusion
  in the ["Underscored and Globally Scoped DNS Node Names"](https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#underscored-globally-scoped-dns-node-names)
  and ["Uniform Resource Identifier (URI) Schemes"](https://www.iana.org/assignments/uri-schemes/uri-schemes.xhtml#uri-schemes-1) registries.
  Schemes [can specify](https://datatracker.ietf.org/doc/html/rfc9460#section-2.3) not to use the `_port` subdomain or to use it only for non-default ports.
  The scheme and port subdomains separate the `SVCB` records for different services without having to introduce a new record type for each service.
  [DNSSEC](#domain-name-system-security-extensions) [is optional](https://datatracker.ietf.org/doc/html/rfc9460#section-12) for `SVCB` records.
  Before looking at examples of `SVCB` records in the [next bullet point](#https-resource-records) and a [later section](#discovery-of-designated-resolvers),
  we study their [format](https://datatracker.ietf.org/doc/html/rfc9460#section-2)
  and the [motivation](https://datatracker.ietf.org/doc/html/rfc9460#section-1.1) for introducing them:
  - **Alternative endpoints**:
    One goal of `SVCB` records is to let clients discover alternative endpoints for a given service.
    In this regard, `SVCB` records are similar to [`MX` records](/email/#address-resolution) and [`SRV` records](/email/#autoconfiguration).
    But while `MX` and `SRV` records tell clients only where to connect (i.e. the host name and the [port number](#port-numbers)),
    `SVCB` records also tell clients how to connect (e.g. which protocols are supported and how to encrypt sensitive information).
    `SVCB` records can be used to indicate fallback servers in case the primary server doesn't respond
    or to [balance the load](https://en.wikipedia.org/wiki/Load_balancing_(computing)) among several servers,
    including ones geographically closer to the client via a [content delivery network (CDN)](https://en.wikipedia.org/wiki/Content_delivery_network).
    `SVCB` records consist of [three fields](https://datatracker.ietf.org/doc/html/rfc9460#section-1.2):
    - **Priority**:
      A number indicating the priority of this endpoint relative to others.
      Endpoints with lower priority values are preferred.
      When a domain has several `SVCB` records for a given scheme and port with the same priority value,
      clients [should shuffle](https://datatracker.ietf.org/doc/html/rfc9460#section-2.4.1) the order of these records.
      Clients [should try](https://datatracker.ietf.org/doc/html/rfc9460#section-3) higher-priority endpoints (i.e. those with lower priority values),
      before falling back to lower-priority alternatives.
      If all endpoints fail and the use of `SVCB` records is optional for the scheme at hand,
      clients should attempt to connect to the service as if no `SVCB` records exist [before giving up](https://datatracker.ietf.org/doc/html/rfc9460#section-3).
    - **Target**:
      The domain name of the endpoint.
      When connecting to the endpoint, clients must validate that the [TLS](#transport-layer-security) [certificate](#public-key-infrastructure)
      has been issued to the [original service identity](https://datatracker.ietf.org/doc/html/rfc9460#section-2.3),
      which is typically the `host` name (without the `_port` and `_scheme` subdomains).
      Accordingly, clients also have to [indicate the original service name](https://datatracker.ietf.org/doc/html/rfc9460#section-9.4)
      in the [SNI extension](#wireshark-sni) of TLS.
      Since the specification doesn't require [DNSSEC](#domain-name-system-security-extensions),
      it has to assume that [DNS records can be forged](#problems-with-plaintext-dns).
      By authenticating the endpoint with the service identity instead of the target name,
      the [public-key infrastructure](#public-key-infrastructure) prevents an attacker from injecting their own endpoint.
      This validation rule has to be followed [even if the `SVCB` record is DNSSEC-signed](https://datatracker.ietf.org/doc/html/rfc9460#section-12).
      If the target is [just a period](https://datatracker.ietf.org/doc/html/rfc9460#section-2.5.2) (`.`),
      it is replaced with the domain to which the `SVCB` record belongs.
      This [includes potential `_port` and `_scheme` subdomains](https://datatracker.ietf.org/doc/html/rfc9460#section-10.3).
      If the [owner name](https://datatracker.ietf.org/doc/html/rfc1034#section-3.6) includes a [wildcard](#wildcard-expansion),
      the [synthesized name](https://datatracker.ietf.org/doc/html/rfc9460#section-2.5.2) is used as the target.
    - **Parameters**:
      A [space-separated list](https://datatracker.ietf.org/doc/html/rfc9460#section-2.1) of `key=value` pairs,
      providing useful information for connecting to this endpoint.
      The `=value` part is optional, the pairs may appear in any order, and each key should appear only once.
      This is just the [presentation format](https://datatracker.ietf.org/doc/html/rfc9460#section-2.1);
      the parameters are [encoded differently](https://datatracker.ietf.org/doc/html/rfc9460#section-2.2),
      using their identifier from the ["SVCB Service Parameter Keys"](https://www.iana.org/assignments/dns-svcb/dns-svcb.xhtml) registry.
      By including the connection parameters in the `SVCB` record, different endpoints can have different capabilities.
      An example of a parameter is [`port`](https://datatracker.ietf.org/doc/html/rfc9460#section-7.2),
      which makes it possible to serve a service from non-default [ports](#port-numbers).
  - **Protocol upgrades**:
    Service endpoints can inform clients about the protocols that they support with the [`alpn` parameter](https://datatracker.ietf.org/doc/html/rfc9460#section-7.1).
    ALPN stands for [Application-Layer Protocol Negotiation](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation),
    which is a [TLS](#transport-layer-security) extension with which the client and the server can agree on which application-layer protocol to use
    without requiring additional round trips on the [application layer](#application-layer).
    The value of this parameter consists of a [comma-separated list](https://datatracker.ietf.org/doc/html/rfc9460#section-7.1.1) of ALPN identifiers
    from [this IANA registry](https://www.iana.org/assignments/tls-extensiontype-values/tls-extensiontype-values.xhtml#alpn-protocol-ids).
  - **Public key info**:
    As explained [earlier](#content-confidentiality),
    clients typically indicate the name of the server they want to connect to in plaintext during the TLS handshake.
    The proposal [Encrypted ClientHello (ECH)](https://datatracker.ietf.org/doc/html/draft-ietf-tls-esni-25)
    allows clients to encrypt the server name with the [public key](#public-key-encryption) of the server.
    This public key can be advertised to clients via the [`ech` parameter](https://datatracker.ietf.org/doc/html/draft-ietf-tls-svcb-ech-08#section-3)
    of `SVCB` and `HTTPS` records.
  - **Apex aliasing**:
    It's quite common on the Internet that you don't run the services provided under your domain yourself.
    Ideally, you want to leave the decision of how to provide a specific service to your service provider.
    In particular, the service provider shall decide under which addresses it provides the given service.
    If the service is served at a [subdomain](https://en.wikipedia.org/wiki/Subdomain) of your main domain (such as `www.`),
    you can use a [`CNAME` record](https://en.wikipedia.org/wiki/CNAME_record) at this subdomain
    to point this subdomain to the domain of the service provider.
    Anyone who resolves an address record (`A` or `AAAA`) of your subdomain will then query the domain of the service provider instead.
    Since DNS resolvers continue the resolution at the domain name referenced in the `CNAME` record for any record type,
    a domain name with a `CNAME` record cannot have any other resource records.
    Since there must be a [start of authority (SOA) record](https://en.wikipedia.org/wiki/SOA_record) at the root of a zone,
    you cannot use `CNAME` records on your main domain at the root of the zone, which is called the apex domain.
    For this reason, you typically had to replicate all address records of your service provider when you wanted to use the apex domain.
    (For example, see [these instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)
    for [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).)
    <br>
    `SVCB` and `HTTPS` records finally allow you to delegate operational control of apex domains.
    To do so, you set the priority value of the record to 0 and specify [the alias as the target](https://datatracker.ietf.org/doc/html/rfc9460#section-2.4.2).
    When the priority value is 0, the record is said to be in alias mode.
    In this mode, any service parameters [are ignored](https://datatracker.ietf.org/doc/html/rfc9460#section-2.4.2).
    When the priority value is greater than 0, the record is in service mode.
    All resource records of a domain [should have the same mode](https://datatracker.ietf.org/doc/html/rfc9460#section-2.4.1)
    and there should be [only one record in alias mode](https://datatracker.ietf.org/doc/html/rfc9460#section-2.4.2).
    When using alias mode, the resolution of other record types, such as `SOA`, [is not affected](https://datatracker.ietf.org/doc/html/rfc9460#section-2.4.2).
    Clients continue to resolve the target name only when accessing the specific service.
    The target name is queried for `SVCB` records [without adding subdomain prefixes](https://datatracker.ietf.org/doc/html/rfc9460#section-3).
    As long as the target name has address records, clients are supposed to use the target as an endpoint (with default connection parameters)
    even [when the target has no `SVCB` records](https://datatracker.ietf.org/doc/html/rfc9460#section-3).
    When an `SVCB` record is in alias mode, a period (`.`) as the target means
    that [the service is not available](https://datatracker.ietf.org/doc/html/rfc9460#section-2.5.1).
    Until most clients know how to follow `SVCB` records,
    you still need to replicate all the address records of your service provider at your domain, unfortunately.

{:#https-resource-records}
- `HTTPS` resource records:
  As explained in the [previous bullet point](#svcb-resource-records),
  `SVCB` records use subdomains for the scheme and the port to keep the records of different services apart.
  Since [HTTP](#hypertext-transfer-protocol) is such an important service,
  a special resource record type with the name `HTTPS` [has been introduced](https://datatracker.ietf.org/doc/html/rfc9460#section-9).
  `HTTPS` records have the same syntax and semantics as `SVCB` records.
  What makes them special is that no subdomains are used [for the default port 443](https://datatracker.ietf.org/doc/html/rfc9460#section-9.1).
  By attaching `HTTPS` records directly to the name of the service without any prefixes,
  they can be used on [wildcard domains](#wildcard-expansion), which are commonly used with HTTP.
  (The wildcard `*` can be used only as the leftmost DNS label, i.e. you cannot specify `_443._https.*.example.com`.)
  Another advantage of attaching `HTTPS` records directly to the service name is
  that the targets of existing `CNAME` delegations can return `HTTPS` records without requiring any changes from the owner of the delegating domain.
  If, [for example](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-a-subdomain),
  there's a `CNAME` from `www.example.com` to `github.io`,
  a client which looks for `HTTPS` records at `www.example.com` will find the `HTTPS` records at `github.io`.
  If there was no special `HTTPS` record type which doesn't require the use of subdomains,
  a client would look for `SVCB` records at `_443._https.www.example.com` and find nothing
  because the domain owner hasn't delegated `_443._https.www.example.com` to `_443._https.github.io`.
  Since `HTTPS` records have been introduced, clients [must not query `SVCB` records for the `https` scheme](https://datatracker.ietf.org/doc/html/rfc9460#section-9).
  Moreover, clients [must convert the scheme `http` to `https`](https://datatracker.ietf.org/doc/html/rfc9460#section-9.1) before looking up `HTTPS` records.
  If they find an `HTTPS` record, they should communicate [only over a secure transport protocol](https://datatracker.ietf.org/doc/html/rfc9460#section-9.5)
  (i.e. via `https` instead of `http`).
  This security opt-in is similar to [HTTP Strict Transport Security (HSTS)](/email/#http-strict-transport-security)
  and can be reason enough to use an `HTTPS` record of `1` `.` if your domain name registrar supports `HTTPS` records.
  If DNS responses are cryptographically protected (by using [DNSSEC](#domain-name-system-security-extensions)
  or one of the above [secure DNS protocols](#secure-dns-protocols)),
  clients should not connect to the service if the DNS resolution fails
  in order to [prevent downgrade attacks](https://datatracker.ietf.org/doc/html/rfc9460#section-3.1).
  [All major browsers query `HTTPS` records](https://blog.apnic.net/2023/12/18/use-of-https-resource-records/#current-use) before opening a connection.
  (We saw an [example of this](#wireshark-dns) when we [captured network traffic](#capturing-network-traffic).)
  <br>
  Let's look at a few examples of `HTTPS` records using the [DNS lookup tool](#dns-lookup-tool) from above:
  - **Protocol upgrades**: [google.com](#tool-lookup-dns-records&domainName=google.com&recordType=HTTPS) has an `HTTPS` record of `1 . alpn=h2,h3`,
    where `h2` stands for `HTTP/2` and `h3` for `HTTP/3`, which is also known as [QUIC](#quic).
    This allows clients to use `HTTP/3` from the first connection instead of discovering support for `HTTP/3`
    via the [`Alt-Svc` response header field](https://datatracker.ietf.org/doc/html/rfc7838) on an `HTTP/2` connection.
    You can see which protocol your browser uses to fetch a particular resource by opening the "Network" tab
    of your browser's [developer tools](https://en.wikipedia.org/wiki/Web_development_tools)
    and enabling the "Protocol" column by right-clicking on any column header in the request list.
  - **Public key info**: [cloudflare-ech.com](#tool-lookup-dns-records&domainName=cloudflare-ech.com&recordType=HTTPS)
    has an `HTTPS` record with an `ech` parameter for an [Encrypted ClientHello (ECH)](https://datatracker.ietf.org/doc/html/draft-ietf-tls-esni-25).
  - **Alias mode**: The [Estonian Public Broadcasting](https://en.wikipedia.org/wiki/Eesti_Rahvusringh%C3%A4%C3%A4ling) organization
    uses an `HTTPS` record at their apex domain [err.ee](#tool-lookup-dns-records&domainName=err.ee&recordType=HTTPS)
    to announce that its website is served at `www.err.ee`.
    Since such an alternative endpoint doesn't affect what's displayed in the [address bar](https://en.wikipedia.org/wiki/Address_bar) of your browser,
    they still redirect visitors to the `www` subdomain by using the [`Location` response header field](https://en.wikipedia.org/wiki/HTTP_location).


##### SVCB and HTTPS performance considerations

Ideally, your browser could ask for the `A` and the `HTTPS` records of the website you're visiting in the same query.
Unfortunately, DNS messages can contain at most one question for now.
(While it is syntactically possible to have more than one question in a DNS message,
[RFC 9619](https://datatracker.ietf.org/doc/html/rfc9619) forbids such messages because the semantics of the per-message flags isn't clear in this case.
There is a [proposal to allow clients to query several record types](https://datatracker.ietf.org/doc/draft-ietf-dnssd-multi-qtypes/)
in a single message, but so far this is just a proposal.)

The following three techniques are used in practice to increase the performance of `SVCB` and `HTTPS` lookups:
- **Parallel lookups**: Clients should query the address records of the predicted target name [in parallel](https://datatracker.ietf.org/doc/html/rfc9460#section-5).
- **Address hints**: `SVCB` and `HTTPS` records can include address hints
  in the [`ipv4hint` and `ipv6hint` parameters](https://datatracker.ietf.org/doc/html/rfc9460#section-7.3)
  so that clients can start connecting to the service without having to wait for the address lookups to complete.
- **Additional section**: [Authoritative servers](#administrative-zones) and [recursive resolvers](#dns-stub-resolvers)
  are encouraged to include `A`, `AAAA`, and `SVCB`/`HTTPS` records of the target name
  in the ["Additional" section of the DNS response](https://datatracker.ietf.org/doc/html/rfc9460#section-4).


##### SVCB records for DNS

Now that we know [what `SVCB` records are](#svcb-and-https-resource-records),
we can go back to [secure DNS protocols](#secure-dns-protocols) and how to discover them.
[RFC 9461](https://datatracker.ietf.org/doc/html/rfc9461) specifies how `SVCB` records are used for [DNS](#domain-name-system).
Since there's no default (secure) DNS protocol, the [`alpn` parameter](#svcb-resource-records)
[has to be provided](https://datatracker.ietf.org/doc/html/rfc9461#section-4.1).
The [ALPN](https://en.wikipedia.org/wiki/Application-Layer_Protocol_Negotiation) identifier is `dot` for [DoT](#secure-dns-protocols)
and `doq` for [DoQ](#secure-dns-protocols).
[DoH](#secure-dns-protocols) is indicated by providing the [HTTP](#hypertext-transfer-protocol) version `h2` or `h3`.
The [RFC](#request-for-comments) also introduces the parameter [`dohpath`](https://datatracker.ietf.org/doc/html/rfc9461#section-5),
which specifies the [DoH path](#secure-dns-protocols) and has to be provided when DoH is supported.


##### Discovery of Designated Resolvers (DDR) {#discovery-of-designated-resolvers}

[RFC 9462](https://datatracker.ietf.org/doc/html/rfc9462) introduces Discovery of Designated Resolvers (DDR).
DDR allows clients to query their [existing resolver](#dns-stub-resolvers) for a [secure DNS endpoint](#secure-dns-protocols).
If a client knows only the [IP address](#internet-protocol-version-4) of their current resolver, which is common,
it queries this resolver for [`SVCB` records](#svcb-and-https-resource-records) at the special name `_dns.resolver.arpa`{:.enable-click-to-copy}.
If the resolver supports DDR, it answers with [secure DNS endpoints](#svcb-records-for-dns).
The domain `resolver.arpa` doesn't exist in the [global DNS namespace](#name-registration)
and DNS resolvers [should not forward queries](https://datatracker.ietf.org/doc/html/rfc9462#section-6.1) for this domain name.
(Since the domain [`.arpa` is walkable](#tool-lookup-zone-domains&startDomain=arpa.&resultLimit=30),
it's easy to see that there's no `resolver.arpa` domain.)
As the client [cannot trust the received `SVCB` records](#problems-with-plaintext-dns)
([DNSSEC](#domain-name-system-security-extensions) cannot protect such [local domains](https://en.wikipedia.org/wiki/.local)),
the secure endpoint must either present a valid [TLS certificate](#public-key-infrastructure)
where the IP address of the original (insecure) resolver
is listed in the [Subject Alternative Name](https://datatracker.ietf.org/doc/html/rfc5280#section-4.2.1.6)
or have the same IP address as the insecure resolver.
The former is called [Verified Discovery](https://datatracker.ietf.org/doc/html/rfc9462#section-4.2),
the latter [Opportunistic Discovery](https://datatracker.ietf.org/doc/html/rfc9462#section-4.3).
These requirements prevent a local attacker from injecting a malicious resolver (while still being able to block the discovery).
Alternatively, a secure endpoint can be [confirmed explicitly by the user](https://datatracker.ietf.org/doc/html/rfc9462#section-4.1).
In a typical home network, the router [acts as the resolver](#dns-stub-resolvers) and also does [network address translation](#network-address-translation).
As a consequence, your devices address the router with a [private IP address](https://en.wikipedia.org/wiki/Private_network).
Since [certification authorities](#public-key-infrastructure) don't issue certificates for private IP addresses,
only Opportunistic Discovery can be used in such a network
and the client doesn't validate the TLS certificate at all.
Note that the client is supposed to upgrade only to a secure resolver
which is operated by the same (or at least a related) entity as the original resolver.
This is why the new (secure) resolver is called the Designated Resolver.
By auto-upgrading only to a resolver that your network admin intended you to use,
any existing policy regarding [internal network names](#side-effects), filtering, parental control, and logging is preserved.
If a [classic DNS resolver](#problems-with-plaintext-dns) is known with a domain name,
the client queries `_dns.<resolver-name>` instead of `_dns.resolver.arpa` for `SVCB` records
and validates that the TLS certificate of the secure endpoint covers the known `<resolver-name>`.

You can check whether your default resolver supports DDR by running `dig _dns.resolver.arpa SVCB +norecurse`{:.enable-click-to-copy}
on your [command-line interface](https://en.wikipedia.org/wiki/Command-line_interface).
(`+norecurse` tells the resolver not to ask other resolvers by switching off the Recursion Desired (RD) bit in the query, which is on by default.)
The [`dig` command](https://en.wikipedia.org/wiki/Dig_(command)) understands `SVCB`
only from [version 9.16.21](https://bind9.readthedocs.io/en/v9.16.21/notes.html#new-features).
(You can check your version with `dig -v`{:.enable-click-to-copy}).
Before that, you have to use `TYPE64` instead of `SVCB` (and `TYPE65` instead of `HTTPS`),
i.e. `dig _dns.resolver.arpa TYPE64 +norecurse`{:.enable-click-to-copy},
and the resource records are displayed in the generic representation format
as specified in [RFC 3597](https://datatracker.ietf.org/doc/html/rfc3597),
i.e. `\# <length> <hex-encoded data>`.
Note that you can [look up `_dns.resolver.arpa`](#tool-lookup-dns-records&domainName=_dns.resolver.arpa&recordType=SVCB)
with the [tool above](#dns-lookup-tool),
but unless you configured your computer to use [Google's DNS server](https://developers.google.com/speed/public-dns/docs/using),
the found records are not relevant for you.

[Windows 11](https://techcommunity.microsoft.com/blog/networkingblog/making-doh-discoverable-introducing-ddr/2887289)
and [Apple's](https://mailarchive.ietf.org/arch/msg/add/rMJOhpvh1zBpnjBMtT8tN4NQFtk/) [devices](https://developer.apple.com/videos/play/wwdc2022/10079/)
support DDR (and [DNR](#discovery-of-network-designated-resolvers)),
but even if DDR becomes more widespread on resolvers, you should [configure DNS yourself](#dns-configuration-recommendations) for better security.


##### Discovery of Network-designated Resolvers (DNR) {#discovery-of-network-designated-resolvers}

[RFC 9463](https://datatracker.ietf.org/doc/html/rfc9463) introduces Discovery of Network-designated Resolvers (DNR).
DNR extends [DHCP](#dynamic-host-configuration-protocol) and
[Router Advertisements (RA)](https://en.wikipedia.org/wiki/Neighbor_Discovery_Protocol) of [IPv6](#internet-protocol-version-6)
so that the network can designate a [resolver](#dns-stub-resolvers)
which supports one of the [secure DNS protocols](#secure-dns-protocols).
The information provided by the router includes a service priority, the domain name used for [TLS authentication](#transport-layer-security),
the [IP address](#internet-protocol-version-4) of the resolver,
and [service parameters](https://datatracker.ietf.org/doc/html/rfc9463#section-3.1.5),
such as the supported protocols, the [port number](#port-numbers), and the [DoH path](#secure-dns-protocols).
Whereas [DDR](#discovery-of-designated-resolvers) requires the client to query for secure DNS endpoints,
DNR lets the router announce them to the client (and the information is transported inside of DHCP/RA instead of [DNS](#domain-name-system)).
Since the client cannot authenticate the router,
DNR is vulnerable to [spoofing attacks](https://datatracker.ietf.org/doc/html/rfc9463#section-7.1).


##### Between recursive resolvers and authoritative servers

So far in this box, we have looked only at how to secure the [last mile from your device to the recursive (or forwarding) resolver](#dns-stub-resolvers).
However, the [privacy and security issues of the classic DNS protocol](#problems-with-plaintext-dns)
are also present in the communication between recursive resolvers and authoritative servers.
When [DNS over TLS (DoT)](#secure-dns-protocols) is used on this link,
it's called [Authoritative DoT (ADoT)](https://datatracker.ietf.org/doc/html/rfc9499#section-6-4.91).
Since one can also use [DNS over QUIC (DoQ)](#secure-dns-protocols) on this link,
which would correspondingly be called Authoritative DoQ (ADoQ),
some started to use the acronym ADoX [to stand for both](https://dnsprivacy.org/adox_status_and_deployment/).
[RFC 9539](https://datatracker.ietf.org/doc/html/rfc9539) suggests that recursive resolvers probe authoritative servers [on port 853](#secure-dns-protocols),
which is used by both DoT (over [TCP](#transmission-control-protocol)) and DoQ (over [UDP](#user-datagram-protocol)).
If the connection succeeds, the communication is protected from passive network observers.
Since this approach cannot protect from active attackers,
the authoritative server [isn't even authenticated](https://datatracker.ietf.org/doc/html/rfc9539#section-3.2).
There's also a [draft for how authoritative servers can signal their support](https://datatracker.ietf.org/doc/draft-johani-dnsop-transport-signaling/)
for [secure DNS protocols](#secure-dns-protocols).

</details>

<details markdown="block">
<summary markdown="span" id="dns-configuration-recommendations">
DNS configuration recommendations
</summary>

In the [previous box](#secure-dns-connections),
we discussed the [privacy and security issues of classic DNS](#problems-with-plaintext-dns),
what [secure DNS protocols](#secure-dns-protocols) exist,
and how your devices can [automatically discover](#discovery-of-designated-resolvers) [secure endpoints](#discovery-of-network-designated-resolvers).
The problem with the [two automatic](#discovery-of-designated-resolvers) [discovery mechanisms](#discovery-of-network-designated-resolvers)
is that [they are not secure](https://datatracker.ietf.org/doc/html/rfc9463#section-7.1)
and that there's no reason to [trust the router and default resolver](https://datatracker.ietf.org/doc/html/rfc7626#section-2.5.3) of the networks you join,
especially in public places like restaurants and airports.
While you still have to assume that others in the network can learn [what websites you visit](#content-confidentiality),
I highly recommend that you [configure all your devices](#how-to-configure-your-operating-system)
to use a [public recursive resolver](#public-recursive-resolver) for [security reasons](#problems-with-plaintext-dns).


##### Public recursive resolver

Many companies run [recursive resolvers](#dns-stub-resolvers), which you can use for free and without registration.
You find an [overview of such providers on Wikipedia](https://en.wikipedia.org/wiki/Public_recursive_name_server).
By far [the most popular one](https://stats.labs.apnic.net/rvrs) is
[Google Public DNS](https://developers.google.com/speed/public-dns/docs/using) with around 14% of all DNS queries,
followed by [Cloudflare](https://www.cloudflare.com/learning/dns/what-is-1.1.1.1/) with around 4%
and [Cisco OpenDNS](https://www.opendns.com/) with around 0.7%.
All of them publish clear retention policies, while many ISPs do not.
(The situation in China is different, but that's not relevant for the rest of the world.)
If you optimize for speed, [choose Cloudflare](https://www.dnsperf.com/#!dns-resolvers).
If you care about privacy and security, I recommend the Swiss-based non-profit [Quad9](https://quad9.net/) to you.
The name comes from the [IP address](#internet-protocol-version-4) of its name server,
which is `9.9.9.9`, i.e. [quad](https://en.wikipedia.org/wiki/Quad) 9.
This IP address [was gifted](https://quad9.net/news/blog/quad9-and-your-data/#construction-of-quad9-organization)
to the [Quad9 Foundation](https://en.wikipedia.org/wiki/Quad9) by [IBM](https://en.wikipedia.org/wiki/IBM).
Other public resolvers also have similar, easy to remember IP address:
Cloudflare has `1.1.1.1` and Google has `8.8.8.8`.
Google, Cloudflare, and Quad9 all validate [DNSSEC](#domain-name-system-security-extensions) (at least on the recommended endpoints),
whereas the [default resolver of your ISP](#dns-stub-resolvers) might not.
This is another reason not to rely on the default resolver of arbitrary networks.


##### Anycast addresses

Given what you've learned about [routing](#signal-routing) and [propagation delay](#propagation-delay),
you may think that it's a bad idea if users all over the globe use the same [IP address](#internet-protocol-version-4) to reach a service.
The memorable IP addresses from the [previous paragraph](#public-recursive-resolver) aren't normal IP addresses, though.
They are so-called [anycast addresses](https://en.wikipedia.org/wiki/Anycast),
for which [routers](#network-addresses) forward the [packets](#packet-switching) to the nearest server.
The largest [public recursive resolvers](#public-recursive-resolver) operate servers in hundreds of locations.
To give you an impression, [Quad9](https://quad9.net/) lists its locations on [this page](https://quad9.net/service/locations/).


##### EDNS Client Subnet (ECS) {#edns-client-subnet}

Before we look at [configuration](#how-to-configure-your-browser) [options](#how-to-configure-your-operating-system),
we need to discuss one more [Extension Mechanisms for DNS (EDNS)](https://en.wikipedia.org/wiki/Extension_Mechanisms_for_DNS).
[Content delivery networks (CDNs)](https://en.wikipedia.org/wiki/Content_delivery_network) and many large websites
let their domain names resolve to different [IP addresses](#internet-protocol-version-4) [based on the user's location](https://en.wikipedia.org/wiki/GeoDNS).
By routing the traffic of a user to a server which is close to them
(often within the network of their [Internet service provider (ISP)](https://en.wikipedia.org/wiki/Internet_service_provider);
see, for example, [Netflix Open Connect](https://openconnect.netflix.com/en/)),
[latency](#network-performance) and bandwidth costs can be reduced.
By default, your devices use a [recursive resolver of your ISP](#dns-stub-resolvers).
By configuring your devices to use a recursive resolver which is most likely not in your ISP's network,
your Internet traffic can get routed to less optimal servers.
To prevent this from happening, there's a DNS extension called
[EDNS Client Subnet (ECS)](https://en.wikipedia.org/wiki/EDNS_Client_Subnet),
which allows recursive resolvers to indicate to authoritative servers where the DNS query came from.
ECS is specified in [RFC 7871](https://datatracker.ietf.org/doc/html/rfc7871).
To improve the user's privacy, the [RFC](#request-for-comments) [encourages recursive resolvers to truncate](https://datatracker.ietf.org/doc/html/rfc7871#section-11.1)
[IPv4 addresses](#internet-protocol-version-4) to 24 bits (from a total of 32 bits)
and [IPv6 addresses](#internet-protocol-version-6) to 56 bits (from a total of 128 bits).
Moreover, recursive resolvers [should never send the ECS option](https://datatracker.ietf.org/doc/html/rfc7871#section-12.1)
when querying [root](https://en.wikipedia.org/wiki/DNS_root_zone),
[top-level](https://en.wikipedia.org/wiki/Top-level_domain),
and [effective top-level](https://publicsuffix.org/) domain servers.
When you join [another network](#internet-layers),
the [cache](https://en.wikipedia.org/wiki/Cache_(computing)) of your [stub resolver](#dns-stub-resolvers) is typically erased.
This (in combination with the often relatively short [time to live](#distributed-database) of DNS records)
ensures that DNS-based routing is re-evaluated [for your new IP address](#network-addresses).


##### Should you use ECS?

Whether or not [ECS](#edns-client-subnet) is being used is often decided by the operator of the [recursive resolver](#public-recursive-resolver).
Many [ISP](https://en.wikipedia.org/wiki/Internet_service_provider) recursive resolvers don't send ECS
because [CDNs](https://en.wikipedia.org/wiki/Content_delivery_network) already localize well using the resolver's own IP address,
which is inside the ISP's network and usually close to you.
From the public resolvers [mentioned above](#public-recursive-resolver),
[Cloudflare never sends ECS](https://developers.cloudflare.com/1.1.1.1/faq/#does-1111-send-edns-client-subnet-header) for privacy reasons,
while [Google always sends ECS](https://developers.google.com/speed/public-dns/docs/ecs#introduction) when querying authoritative name servers which make use of ECS.
(In principle, you can opt out of ECS [by setting the source prefix-length to 0](https://datatracker.ietf.org/doc/html/rfc7871#section-7.1.2) for your DNS queries,
which disallows recursive resolvers from adding a longer prefix of your [IP address](#internet-protocol-version-4) to its queries.
However, [operating systems](#operating-systems) provide no such option for their [stub resolver](#dns-stub-resolvers).
Only if your router runs [dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq),
you can configure your [forwarding resolver](#dns-stub-resolvers) to suppress ECS with [`--add-subnet=0,0`](https://thekelleys.org.uk/dnsmasq/docs/dnsmasq-man.html).)
[Quad9 provides a separate endpoint where ECS is enabled](https://quad9.net/service/service-addresses-and-features/),
which allows you to choose whether you want better privacy (with ECS disabled) or better DNS-based routing (with ECS enabled).
Since recursive resolvers have to partition their [cache](https://en.wikipedia.org/wiki/Cache_(computing)) by client prefix when using ECS,
ECS increases the chance that a query cannot be answered from the cache and that authoritative name servers have to be queried before an answer can be returned.
Therefore, you typically get the DNS reply faster when you disable ECS,
but you pay for this by potentially connecting to an endpoint with a higher [latency](#network-performance).
You may wonder what's the point in hiding your IP address when resolving a domain name if you connect to the service afterwards anyway.
On one side, authoritative name servers are often run by third parties in a different network from the site you visit,
which means that more parties learn about your site visit when you choose a recursive resolver which sends ECS.
On the other hand, not all DNS queries lead to connections,
which means that ECS lets others associate intent to you which they wouldn't be able to do without ECS.
In order to minimize the privacy impact of ECS,
the [RFC recommends](https://datatracker.ietf.org/doc/html/rfc7871#section-12.1)
that recursive resolvers remember which authoritative name servers didn't return the ECS option in their reply
and no longer send the IP address of their clients to those name servers in subsequent queries.
So should you choose a recursive resolver which sends ECS?
That's up to you.
I use [Quad9 with ECS](https://quad9.net/service/service-addresses-and-features/).


##### How to configure your browser

Since most apps on your computer use the Internet and therefore the [Domain Name System](#domain-name-system),
I recommend that you [configure your operating system](#how-to-configure-your-operating-system)
instead of your [web browser](https://en.wikipedia.org/wiki/Web_browser) to use a [secure DNS endpoint](#secure-dns-protocols).
Since [configuring your browser](https://developers.cloudflare.com/1.1.1.1/encryption/dns-over-https/encrypted-dns-browsers/)
is much easier than configuring your operating system,
I still want to mention how to configure some browsers on your computer
(these options don't exist in the corresponding mobile browsers on [iOS](https://en.wikipedia.org/wiki/IOS)):
- [**Google Chrome**](https://en.wikipedia.org/wiki/Google_Chrome):
  Open the settings of Chrome, click on "Privacy and security" in the [sidebar](https://en.wikipedia.org/wiki/Sidebar_(computing)) and then on "Security".
  Enable ["Use secure DNS"](https://support.google.com/chrome/answer/10468685?hl=en#zippy=%2Cuse-a-secure-connection-to-look-up-a-sites-ip-address) there.
  Under "Select DNS provider" right below, add a custom DNS service provider
  or choose a preconfigured one from the [drop-down menu](https://en.wikipedia.org/wiki/Drop-down_list).
  If you don't do this and leave the DNS provider at "OS default (when available)",
  Chrome upgrades to [DNS over HTTPS (DoH)](#secure-dns-protocols) only if it finds the [IP address](#internet-protocol-version-4) of the default resolver
  in its [hard-coded](https://en.wikipedia.org/wiki/Hard_coding)
  [list of DoH providers](https://chromium.googlesource.com/chromium/src.git/+/refs/heads/main/net/dns/public/doh_provider_entry.cc).
  Since the default resolver is [often your router](#dns-stub-resolvers),
  Chrome typically doesn't use secure DNS at all unless you select a specific provider in its settings.
- [**Microsoft Edge**](https://en.wikipedia.org/wiki/Microsoft_Edge):
  Open the settings of Edge, click on "Privacy, search, and services" in the [sidebar](https://en.wikipedia.org/wiki/Sidebar_(computing)) and then on "Security".
  Enable ["Use secure DNS"](https://support.microsoft.com/en-us/microsoft-edge/securely-browse-the-web-in-microsoft-edge-c7beb47a-de9e-4aec-839d-28224a13a5d2)
  and then choose a service provider from the list or enter a custom provider.
- [**Mozilla Firefox**](https://en.wikipedia.org/wiki/Firefox):
  Follow [these instructions](https://support.mozilla.org/en-US/kb/dns-over-https)
  to configure [DNS over HTTPS (DoH)](#secure-dns-protocols) in Firefox.
- [**Apple Safari**](https://en.wikipedia.org/wiki/Safari_(web_browser)):
  There is no such option in Safari. It uses the DNS configuration of the operating system.


##### How to configure your operating system

[Public recursive resolvers](#public-recursive-resolver) typically have guides for how to configure your devices to use them.
Since we want to configure a [secure DNS endpoint](#secure-dns-protocols),
I recommend you to follow the [set-up guides by Quad9](https://docs.quad9.net/)
instead of the [one by Google](https://developers.google.com/speed/public-dns/docs/using#change_your_dns_servers_settings).
Just click on your operating system on the left and follow the instructions.
(Ideally, the title of the guide ends with "(Encrypted)".)
Two remarks:
- [**Windows 11**](https://en.wikipedia.org/wiki/Windows_11):
  When following [these instructions](https://docs.quad9.net/Setup_Guides/Windows/Windows_11_%28Encrypted%29/),
  you have to click on "Hardware properties" before you can edit the DNS server assignment for all networks of the chosen connection type.
  (Above "Hardware properties", there's also a "&lt;Network name&gt; properties",
  where you can edit the "DNS server assignment" for this particular network, which is not what we want.)
- [**macOS**](https://en.wikipedia.org/wiki/MacOS):
  You can [enter the IP address of a DNS server](https://support.apple.com/guide/mac-help/enter-dns-and-search-domain-settings-on-mac-mh141272/26/mac/26)
  in the [System Settings](https://en.wikipedia.org/wiki/System_Settings)
  (under "Network" &gt; "Wi-Fi" or "Ethernet" &gt; "Details…" &gt; "DNS")
  and this setting applies to all networks of the same type
  ([Wi-Fi](https://en.wikipedia.org/wiki/Wi-Fi) or [Ethernet](https://en.wikipedia.org/wiki/Ethernet))
  as long as you don't use [network locations](https://support.apple.com/en-mk/guide/mac-help/mchlp1175/mac).
  However, with this approach you rely that macOS upgrades to a secure endpoint using [DDR](#discovery-of-designated-resolvers).
  What [Quad9 suggests instead](https://docs.quad9.net/Setup_Guides/MacOS/Big_Sur_and_later_%28Encrypted%29/)
  is to install a [device management profile](https://support.apple.com/guide/deployment/intro-to-device-management-profiles-depc0aadd3fe/web)
  which contains [DNS Settings](https://support.apple.com/en-az/guide/deployment/dep86469ba99/web).
  Since [DNS over HTTPS (DoH)](#secure-dns-protocols) is less likely to be blocked than [DNS over TLS (DoT)](#secure-dns-protocols),
  I recommend that you install the "HTTPS profile" for either `9.9.9.9` (without [ECS](#edns-client-subnet)) or `9.9.9.11` (with ECS).
  Once you have installed the profile, you find it in the "System Settings" under "General" &gt; "Device Management"
  as well as under "Network" &gt; "Filters".
  You can inspect the content of the installed profile by running `sudo /usr/bin/profiles -P -o stdout-xml`{:.enable-click-to-copy}
  in the [Terminal](https://en.wikipedia.org/wiki/Terminal_(macOS)).
  Please note that [Apple's App Store](https://en.wikipedia.org/wiki/App_Store_(Apple))
  as well as the [`dig` command](https://en.wikipedia.org/wiki/Dig_(command))
  and [`nslookup`](https://en.wikipedia.org/wiki/Nslookup)
  bypass the encrypted DNS settings in the device management profile,
  but they do use the resolver configured with an [IP address](#internet-protocol-version-4) in the DNS settings of your network.

To test whether you are using [Quad9](https://quad9.net/), visit [https://on.quad9.net/](https://on.quad9.net/).
With Quad9, you also get [blocking](https://quad9.net/service/threat-blocking/)
of [malware](https://en.wikipedia.org/wiki/Malware) and [phishing](https://en.wikipedia.org/wiki/Phishing).

If you use a [virtual private network (VPN)](https://en.wikipedia.org/wiki/Virtual_private_network)
or [Apple's Private Relay](https://en.wikipedia.org/wiki/ICloud#Private_Relay),
the DNS settings of your operating system are ignored.


##### Side effects

Configuring your [browser](#how-to-configure-your-browser) or [operating system](#how-to-configure-your-operating-system)
to use a [secure DNS endpoint](#secure-dns-protocols) can have the following, undesirable side effects:

- [**Captive portals**](https://en.wikipedia.org/wiki/Captive_portal):
  Many public Wi-Fis block access to the Internet until the user completes a process on a special website,
  such as authenticating themself with an access code that they might receive via [SMS](https://en.wikipedia.org/wiki/SMS)
  or accepting the provider's [terms of service](https://en.wikipedia.org/wiki/Terms_of_service).
  In order to show this so-called captive portal to you,
  the router often replies with the [IP address](#internet-protocol-version-4) of the captive portal to any DNS queries
  and redirects all [HTTP](#hypertext-transfer-protocol) requests to the captive portal.
  (Redirecting HTTPS requests requires that the user dismisses the error that the [certificate could not be validated](#transport-layer-security).)
  If you have [configured your device](#how-to-configure-your-operating-system)
  to use a [secure DNS protocol](#secure-dns-protocols) to an [external recursive resolver](#public-recursive-resolver),
  the router can only block but no longer reply to your DNS queries
  and your device might not be able to resolve the domain name of the captive portal (and the page you wanted to visit in the first place).
  For this reason, operating systems [and browsers](#how-to-configure-your-browser)
  typically ignore secure DNS configurations until a request to a special website, such as [http://captive.apple.com](http://captive.apple.com), succeeds.
  If a captive portal isn't detected and displayed automatically for some reason,
  you might have to disable your secure DNS configuration until you have unrestricted access to the Internet.
- **Internal domains**:
  Many companies use internal domain names which resolve only inside the corporate network
  (including via [VPN](https://en.wikipedia.org/wiki/Virtual_private_network)).
  (Sometimes, the same domains are resolved differently for internal and external users,
  which is known as [split-horizon DNS](https://en.wikipedia.org/wiki/Split-horizon_DNS).)
  If you configure your device not to use the company's recursive resolver, such internal domains no longer work.
  Therefore, the recommendations in this box are intended for your personally owned devices.
  (Many companies also use a so-called [search domain](https://en.wikipedia.org/wiki/Search_domain)
  so that employees can type shorter domain names.
  However, it's usually the employee's device which adds the company's DNS suffix to a relative domain name
  in order to form a [fully qualified domain name (FQDN)](https://en.wikipedia.org/wiki/Fully_qualified_domain_name),
  and this [can also be configured](https://en.wikipedia.org/wiki/Search_domain#Manually_configuring_domain_search_lists)
  when using an external recursive resolver.)
- **Router configuration**:
  Many [routers](#hubs-switches-and-routers) advertise a special domain name to manage them via a web interface.
  Since this domain name is no longer resolved by the router to its own IP address
  when you use a [public recursive resolver](#public-recursive-resolver),
  you can no longer access your router under this name.
  Instead of the special domain name, you have to enter the [IP address of the router](#dhcp-configuration)
  in the [address bar](https://en.wikipedia.org/wiki/Address_bar) of your browser.

</details>


## Internet history

There are many nice articles about the
[history of the Internet](https://en.wikipedia.org/wiki/History_of_the_Internet),
and there's no point in replicating their content here.
Instead, I would like to give you a timeline
of important milestones in the history of
[telecommunication](https://en.wikipedia.org/wiki/History_of_telecommunication)
and [computing](https://en.wikipedia.org/wiki/History_of_computing_hardware):

| Year | Description
|-
| 1816 | First working [electrical telegraph](https://en.wikipedia.org/wiki/Electrical_telegraph) built by the English inventor [Francis Ronalds](https://en.wikipedia.org/wiki/Francis_Ronalds).
| 1865 | Adoption of the [Morse code](https://en.wikipedia.org/wiki/Morse_code), which originated in 1837, as an international standard.
| 1876 | [Alexander Graham Bell](https://en.wikipedia.org/wiki/Alexander_Graham_Bell) receives the first patent for a [telephone](https://en.wikipedia.org/wiki/Telephone) in the United States.
| 1941 | Invention of the [Z3](https://en.wikipedia.org/wiki/Z3_(computer)), the first programmable computer, by [Konrad Zuse](https://en.wikipedia.org/wiki/Konrad_Zuse) in Germany.
| 1945 | Invention of the [ENIAC](https://en.wikipedia.org/wiki/ENIAC), the first computer with [conditional branching](https://en.wikipedia.org/wiki/Conditional_(computer_programming)), in the US.
| 1954 | Invention of [time-sharing](https://en.wikipedia.org/wiki/Time-sharing) (share expensive computing resources among several users).
| | Increased interest in remote access for users because computers were huge and rare.
| 1965 | Invention of [packet switching](#packet-switching) at the [National Physical Laboratory (NPL)](https://en.wikipedia.org/wiki/National_Physical_Laboratory_(United_Kingdom)) in the UK.
| 1969 | The [US Department of Defense](https://en.wikipedia.org/wiki/United_States_Department_of_Defense) initiates and funds the development of the [ARPANET](https://en.wikipedia.org/wiki/ARPANET).
| | Similar networks are built in London ([NPL](https://en.wikipedia.org/wiki/NPL_network)), Michigan ([MERIT](https://en.wikipedia.org/wiki/Merit_Network)), and France ([CYCLADES](https://en.wikipedia.org/wiki/CYCLADES)).
| 1972 | [Jon Postel](https://en.wikipedia.org/wiki/Jon_Postel) establishes himself as [the czar of socket numbers](https://datatracker.ietf.org/doc/html/rfc349), which leads to the [IANA](https://en.wikipedia.org/wiki/Internet_Assigned_Numbers_Authority).
| 1973 | [Bob Kahn](https://en.wikipedia.org/wiki/Bob_Kahn) and [Vint Cerf](https://en.wikipedia.org/wiki/Vint_Cerf) publish research on [internetworking](https://en.wikipedia.org/wiki/Internetworking) leading to IP and TCP.
| 1978 | Public discovery of the [first public-key cryptosystem](https://en.wikipedia.org/wiki/RSA_(cryptosystem)) for encryption and signing,<br>which was [already discovered](https://en.wikipedia.org/wiki/Public-key_cryptography#Classified_discovery) in 1973 at the British intelligence agency [GCHQ](https://en.wikipedia.org/wiki/Government_Communications_Headquarters).
| 1981 | Initial release of the text-based [MS-DOS](https://en.wikipedia.org/wiki/MS%2DDOS) by [Microsoft](https://en.wikipedia.org/wiki/Microsoft), licensed by [IBM](https://en.wikipedia.org/wiki/IBM) for its [PC](https://en.wikipedia.org/wiki/IBM_PC_compatible).
| 1982 | The US Department of Defense makes IP the [only approved protocol on ARPANET](https://en.wikipedia.org/wiki/Internet_protocol_suite#Adoption).
| 1982 | First definition of the [Simple Mail Transfer Protocol (SMTP)](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol) for email in [RFC 821](https://datatracker.ietf.org/doc/html/rfc821).
| 1983 | Creation of the [Domain Name System (DNS)](https://en.wikipedia.org/wiki/Domain_Name_System) as specified in [RFC 882](https://datatracker.ietf.org/doc/html/rfc882) and [RFC 883](https://datatracker.ietf.org/doc/html/rfc883).
| 1984 | Version 1 of the [Post Office Protocol (POP)](https://en.wikipedia.org/wiki/Post_Office_Protocol) to fetch emails from a mailbox ([RFC 918](https://datatracker.ietf.org/doc/html/rfc918)).
| 1985 | [First commercial registration](https://en.wikipedia.org/wiki/Domain_name#Domain_name_registration) of a domain name in the `.com` [top-level domain](https://en.wikipedia.org/wiki/Top-level_domain).
| 1986 | Design of the [Internet Message Access Protocol (IMAP)](https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol), documented in [RFC 1064](https://datatracker.ietf.org/doc/html/rfc1064).
| 1990 | Invention of the [World Wide Web](https://en.wikipedia.org/wiki/World_Wide_Web) by [Tim Berners-Lee](https://en.wikipedia.org/wiki/Sir_Timothy_John_Berners-Lee) at [CERN](https://en.wikipedia.org/wiki/CERN) in Switzerland,<br>which includes the [HyperText Transfer Protocol (HTTP)](https://en.wikipedia.org/wiki/Hypertext_Transfer_Protocol), the [HyperText Markup<br>Language (HTML)](https://en.wikipedia.org/wiki/Hypertext_Markup_Language), the [Uniform Resource Locator (URL)](https://en.wikipedia.org/wiki/Uniform_resource_locator), a [web server](https://en.wikipedia.org/wiki/Web_server), and a [browser](https://en.wikipedia.org/wiki/Web_browser).
| 1993 | Specification of the [Dynamic Host Configuration Protocol (DHCP)](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol) in [RFC 1541](https://datatracker.ietf.org/doc/html/rfc1541).
| 1995 | Release of the [Secure Sockets Layer (SSL)](https://en.wikipedia.org/wiki/Transport_Layer_Security) by [Netscape](https://en.wikipedia.org/wiki/Netscape), renamed to TLS in 1999.
| 1995 | Standardization of [IPv6](https://en.wikipedia.org/wiki/IPv6) by the IETF in [RFC 1883](https://datatracker.ietf.org/doc/html/rfc1883), obsoleted by [RFC 2460](https://datatracker.ietf.org/doc/html/rfc2460) in 1998.
| 1998 | [Google](https://en.wikipedia.org/wiki/Google) is founded by [Larry Page](https://en.wikipedia.org/wiki/Larry_Page) and [Sergey Brin](https://en.wikipedia.org/wiki/Sergey_Brin) at [Stanford University](https://en.wikipedia.org/wiki/Stanford_University) in California.
| 2005 | Specification of [DNSSEC](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions) in [RFC 4033](https://datatracker.ietf.org/doc/html/rfc4033), [4034](https://datatracker.ietf.org/doc/html/rfc4034) & [4035](https://datatracker.ietf.org/doc/html/rfc4035) after [earlier attempts](https://datatracker.ietf.org/doc/html/rfc2535) in 1995.
| 2007 | [Apple](https://en.wikipedia.org/wiki/Apple_Inc.) launches the [iPhone](https://en.wikipedia.org/wiki/IPhone) with the [iOS](https://en.wikipedia.org/wiki/IOS) operating system one year before [Android](https://en.wikipedia.org/wiki/Android_(operating_system)).
| 2010 | Deployment of DNSSEC [in the root zone](https://en.wikipedia.org/wiki/Domain_Name_System_Security_Extensions#Deployment_at_the_DNS_root), eliminating intermediary [trust anchors](https://en.wikipedia.org/wiki/Trust_anchor).
| 2018 | The [UN](https://en.wikipedia.org/wiki/International_Telecommunication_Union) estimates that [more than half](https://www.itu.int/en/ITU-D/Statistics/Documents/facts/FactsFigures2019.pdf) of the global population uses the Internet.


*[ADoQ]: Authoritative DNS over QUIC
*[ADoT]: Authoritative DNS over TLS
*[ADoX]: Authoritative DNS over TLS or QUIC
*[ALPN]: Application-Layer Protocol Negotiation
*[API]: Application Programming Interface
*[ARP]: Address Resolution Protocol
*[ARPANET]: Advanced Research Projects Agency Network
*[ASCII]: American Standard Code for Information Interchange
*[bps]: bits per second
*[CA]: Certification Authority
*[CAs]: Certification Authorities
*[CDN]: Content Delivery Network
*[CDNs]: Content Delivery Networks
*[CERN]: European Organization for Nuclear Research
*[CIA]: Confidentiality, Integrity, and Availability
*[CPU]: Central Processing Unit
*[DANE]: DNS-Based Authentication of Named Entities
*[DDR]: Discovery of Designated Resolvers
*[DHCP]: Dynamic Host Configuration Protocol
*[DNS]: Domain Name System
*[DNSSEC]: Domain Name System Security Extensions
*[Do53]: (Classic) DNS over UDP and TCP port 53
*[DoH]: DNS over HTTPS
*[DoQ]: DNS over QUIC
*[DoT]: DNS over TLS
*[DPP]: Device Provisioning Protocol
*[EAP]: Extensible Authentication Protocol
*[EAPOL]: Extensible Authentication Protocol over LAN
*[ECDSA]: Elliptic Curve Digital Signature Algorithm
*[ECH]: Encrypted ClientHello
*[ECS]: EDNS Client Subnet
*[EDE]: Extended DNS Errors
*[EDNS]: Extension Mechanisms for DNS
*[ENIAC]: Electronic Numerical Integrator and Computer
*[ETLA]: Extended Three-Letter Acronym
*[FAQ]: Frequently Asked Questions
*[FQDN]: Fully Qualified Domain Name
*[FTP]: File Transfer Protocol
*[FTPS]: File Transfer Protocol Secure
*[GCHQ]: Government Communications Headquarters
*[GPU]: Graphics Processing Unit
*[HSM]: Hardware Security Module
*[HSTS]: HTTP Strict Transport Security
*[HTML]: HyperText Markup Language
*[HTTP]: HyperText Transfer Protocol
*[HTTPS]: HyperText Transfer Protocol Secure
*[IANA]: Internet Assigned Numbers Authority
*[IBM]: International Business Machines Corporation
*[ICANN]: Internet Corporation for Assigned Names and Numbers
*[ICMP]: Internet Control Message Protocol
*[IEEE]: Institute of Electrical and Electronics Engineers
*[IETF]: Internet Engineering Task Force
*[IMAP]: Internet Message Access Protocol
*[IMAPS]: Internet Message Access Protocol Secure
*[IP]: Internet Protocol
*[IPoAC]: Internet Protocol over Avian Carriers
*[IPv4]: Internet Protocol version 4 with 32-bit addresses
*[IPv6]: Internet Protocol version 6 with 128-bit addresses
*[ISO]: International Organization for Standardization
*[ISOC]: Internet Society
*[ISP]: Internet Service Provider
*[ISPs]: Internet Service Providers
*[IT]: Information Technology
*[ITU]: International Telecommunication Union
*[I/O]: Input/Output
*[JSON]: JavaScript Object Notation
*[KSK]: Key-Signing Key
*[KSKs]: Key-Signing Keys
*[LAN]: local area network
*[LEO]: low Earth orbit
*[LLM]: Large Language Model
*[MAC]: Media Access Control
*[Mbit]: megabits (one million bits)
*[Mbps]: megabits per second
*[mDNS]: Multicast DNS
*[MERIT]: Michigan Educational Research Information Triad
*[MHz]: megahertz (a unit of frequency)
*[MITM]: Man-In-The-Middle Attack
*[ms]: milliseconds
*[MSDU]: MAC service data unit
*[MS-DOS]: Microsoft Disk Operating System
*[MTU]: Maximum Transmission Unit
*[NAT]: Network Address Translation
*[NPL]: National Physical Laboratory in the UK
*[OpenPGP]: The open standard for Pretty Good Privacy
*[OS]: Operating System
*[OWD]: One-Way Delay
*[OWE]: Opportunistic Wireless Encryption
*[PC]: Personal Computer
*[PDF]: Portable Document Format
*[PKI]: Public Key Infrastructure
*[PMF]: Protected Management Frames
*[POP]: Post Office Protocol
*[QNAME]: Query Name (the domain name being queried)
*[RA]: Router Advertisement
*[RD]: Recursion Desired (a DNS flag)
*[RFC]: Request for Comments, typically published by the Internet Engineering Task Force
*[RFCs]: Several Requests for Comments as published by the Internet Engineering Task Force
*[RIR]: Regional Internet Registry
*[RR]: Resource Record
*[RRL]: Response Rate Limiting
*[RRset]: Resource Record Set
*[RSA]: Rivest–Shamir–Adleman, a public-key cryptosystem
*[RTT]: Round-Trip Time
*[S/MIME]: Secure/Multipurpose Internet Mail Extensions
*[SHA]: Secure Hash Algorithm
*[SMTP]: Simple Mail Transfer Protocol
*[SMTPS]: Simple Mail Transfer Protocol Secure
*[SNI]: Server Name Indication
*[SOA]: Start Of Authority
*[SSD]: Solid-State Drive
*[SSH]: Secure Shell Protocol
*[SSL]: Secure Sockets Layer
*[TCP]: Transmission Control Protocol
*[TLA]: Three-Letter Acronym
*[TLD]: Top-Level Domain
*[TLS]: Transport Layer Security
*[TTL]: Time To Live
*[UDP]: User Datagram Protocol
*[UN]: United Nations
*[URI]: Uniform Resource Identifier
*[URL]: Uniform Resource Locator
*[UTF]: Unicode Transformation Format
*[VPN]: Virtual Private Network
*[Wi-Fi]: A family of wireless networking protocols (formally called IEEE 802.11)
*[WPA]: Wi-Fi Protected Access
*[WPA2]: Wi-Fi Protected Access version 2
*[WPA3]: Wi-Fi Protected Access version 3
*[WPS]: Wi‑Fi Protected Setup
*[WWW]: World Wide Web
*[X.509]: A standard defining the format of public key certificates
*[XML]: Extensible Markup Language
*[ZIP]: Zone Improvement Plan
*[ZSK]: Zone-Signing Key
*[ZSKs]: Zone-Signing Keys
