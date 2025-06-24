import { Tables } from "../database.types";

export type DbPrice = Tables<'prices'> & { metadata?: { minutes?: string } };
export type DbSubscription = Tables<'subscriptions'>;