import { CartItem } from "../models/CartItem";
import { Product } from "../models/Product"
import { Stock } from "../types/types";

export const products: Product[] = [
  {
    description: "Short Product Description1",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    price: 24,
    title: "ProductOne",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductTitle",
  },
  {
    description: "Short Product Description2",
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    price: 23,
    title: "Product",
  },
  {
    description: "Short Product Description4",
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    price: 15,
    title: "ProductTest",
  },
  {
    description: "Short Product Descriptio1",
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    price: 23,
    title: "Product2",
  },
  {
    description: "Short Product Description7",
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    price: 15,
    title: "ProductName",
  },
];

export const cart: CartItem[] = [
  {
    product: {
      description: "Short Product Description1",
      id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
      price: 24,
      title: "ProductOne",
    },
    count: 2,
  },
  {
    product: {
      description: "Short Product Description7",
      id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
      price: 15,
      title: "ProductName",
    },
    count: 5,
  },
];

export const stocks: Stock[] = [
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
    count: 24,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
    count: 15,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
    count: 23,
  },
  {
    id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
    count: 15,
  },
  {
    id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
    count: 23,
  },
  {
    id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
    count: 15,
  },
]
