import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";

export function useCart() {
  return useQuery<CartItem[], AxiosError>("cart", async () => {
    return [
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
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    []
  );
}

export function useUpsertCart() {
  return useMutation((values: CartItem) => Promise.resolve(true)
  );
}
