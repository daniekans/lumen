import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Consistent hashing',
  summary:
    'Bend the range of the hash into a ring, hash the nodes onto it too, and give each key to the next node clockwise. A node that joins takes keys from one neighbor only, a node that leaves hands its keys to one neighbor, and virtual nodes even out the arcs.',
  tags: ['consistent hashing', 'hash ring', 'virtual nodes', 'rebalancing', 'Cassandra', 'Dynamo'],
  level: 'core',
  order: 9,
  skills: ['consistent-hashing'],
  steps: [
    {
      id: 'ring',
      title: 'The hash range as a ring',
      caption:
        'Bend the values of $h$, $0$ to $2^{32} - 1$, into a circle: $0$ at the top, values growing clockwise, and the largest value next to $0$ again. A hash value is now a point on the ring.',
    },
    {
      id: 'nodes',
      title: 'Nodes on the ring',
      caption:
        'The nodes get points too, by hashing their names: $h(\\text{node-A})$ and so on. Nothing about the number of nodes enters the hash, so a node keeps its point whoever else joins.',
    },
    {
      id: 'owner',
      title: 'The next node clockwise',
      caption:
        'Each key goes to the first node at or after its point, walking clockwise and wrapping past the top. $24$ customer ids, colored by their node. Drag the key.',
    },
    {
      id: 'arcs',
      title: 'Each node owns an arc',
      caption:
        'A node owns the arc that ends at it, from the node before. Four random points cut uneven arcs: node-B owns $53.5\\%$ of the ring and $15$ of the $24$ keys, node-D $5.7\\%$ and none.',
    },
    {
      id: 'join',
      title: 'A node joins',
      caption:
        'node-E hashes into the arc of node-B and splits it. The keys between node-A and node-E move to node-E, $9$ of them; every other key keeps its node. Modulo, from $4$ to $5$ buckets, moved $19$.',
    },
    {
      id: 'leave',
      title: 'A node leaves',
      caption:
        'node-A leaves. Its arc joins the arc of the next node clockwise, node-E, so its $8$ keys move there and no other key moves.',
    },
    {
      id: 'virtual',
      title: 'Virtual nodes',
      caption:
        'Give each node $V$ points by hashing node-A, node-A#1, node-A#2, and so on. A node owns many short arcs, and their total evens out: at $V = 32$ the shares are $22\\%$ to $28\\%$. Drag $V$.',
    },
    {
      id: 'virtual-join',
      title: 'Joining with virtual nodes',
      caption:
        'With $V = 32$, node-E brings $32$ points, and each one takes a short arc from whichever node follows it. It ends up with $24.6\\%$ of the ring, close to its fair $\\frac{1}{5}$, taken in small pieces from the other nodes.',
    },
  ],
})
