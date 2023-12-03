export type Product = {
	id?: string,
	title: string,
	description: string,
	price: number,
}

export type Stock = {
	id: string,
	count: number,
}

export interface StockProduct extends Product {
	count: number,
}