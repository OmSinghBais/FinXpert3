export type ProductType = "MUTUAL_FUND" | "LOAN" | "INSURANCE";

export interface ProductSnapshot {
  clientId: string;
  productCode: string;
  productName: string;
  type: ProductType;
  amountInvested: number;
  currentValue: number;
  metadata?: Record<string, unknown>;
}

export interface AdapterResult {
  adapter: string;
  data: ProductSnapshot[];
  fetchedAt: string;
}

export type AdapterFetcher = () => Promise<AdapterResult>;

export const PRODUCT_POSITIONS_TABLE = "product_positions";

export type ProductPositionRow = {
  client_id: string;
  product_code: string;
  product_name: string;
  type: ProductType;
  amount_invested: number;
  current_value: number;
  metadata?: Record<string, unknown> | null;
};

