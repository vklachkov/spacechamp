import { Order } from './api/order.enum';
import { Sort } from './api/sort.enum';

export interface ParticipantsQuery {
  order: Order;
  sort: Sort;
  search?: string | null;
  deleted: boolean;
}
