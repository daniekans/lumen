import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Keys and references',
  summary:
    'A primary key identifies each row, and a foreign key points from a row to the key of another table. The pointers form a many-to-one function, and referential integrity forbids pointers to rows that do not exist.',
  tags: ['primary key', 'foreign key', 'referential integrity', 'one to many', 'orphan', 'cascade'],
  level: 'intro',
  order: 2,
  skills: ['keys'],
  steps: [
    {
      id: 'primary-key',
      title: 'A primary key',
      caption:
        'No two customers share an id, and no id is NULL, so id identifies each row. The database rejects a second row with id $2$.',
    },
    {
      id: 'foreign-key',
      title: 'A foreign key',
      caption:
        'orders.customer_id holds values of customers.id. Each value is a reference: an arrow from an order to the customer who placed it.',
    },
    {
      id: 'many-to-one',
      title: 'Many orders, one customer each',
      caption:
        'Every order has exactly one arrow, so the references form a function from orders to customers. Several orders may share a customer. Click a customer to see its orders.',
    },
    {
      id: 'one-to-many',
      title: 'Read the arrows backward',
      caption:
        'From the customer side the relationship is one to many: a customer has zero, one or several orders. Caio has none.',
    },
    {
      id: 'orphan',
      title: 'A reference to nothing',
      caption:
        'Order $106$ names customer $9$, which does not exist. Referential integrity means every non-NULL foreign key matches a key, so the database rejects this row.',
    },
    {
      id: 'on-delete',
      title: 'Deleting a referenced row',
      caption:
        'Deleting Ana would leave two orders pointing at nothing. The foreign key decides what happens: reject the delete, delete the orders too, or set their references to NULL.',
    },
  ],
})
