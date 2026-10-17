import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const cup=sqliteTable('cup',{id:text('id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull().default(0)});
