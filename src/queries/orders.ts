import axios, { AxiosError } from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { OrderStatus } from "~/constants/order";
import { Order } from "~/models/Order";

export function useOrders() {
  return useQuery<Order[], AxiosError>("orders", async () => {
    return [
      {
        id: "1",
        address: {
          address: "some address",
          firstName: "Name",
          lastName: "Surname",
          comment: "",
        },
        items: [
          { productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa", count: 2 },
          { productId: "7567ec4b-b10c-45c5-9345-fc73c48a80a1", count: 5 },
        ],
        statusHistory: [
          { status: OrderStatus.Open, timestamp: Date.now(), comment: "New order" },
        ],
      },
      {
        id: "2",
        address: {
          address: "another address",
          firstName: "John",
          lastName: "Doe",
          comment: "Ship fast!",
        },
        items: [{ productId: "7567ec4b-b10c-48c5-9345-fc73c48a80aa", count: 3 }],
        statusHistory: [
          {
            status: OrderStatus.Sent,
            timestamp: Date.now(),
            comment: "Fancy order",
          },
        ],
      },
    ];    
  });
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("orders", { exact: true }),
    []
  );
}

export function useUpdateOrderStatus() {
  return useMutation(
    (values: { id: string; status: OrderStatus; comment: string }) => Promise.resolve(true)
  );
}

export function useSubmitOrder() {
  return useMutation((values: Omit<Order, "id">) => Promise.resolve(true))
}

export function useInvalidateOrder() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id: string) =>
      queryClient.invalidateQueries(["order", { id }], { exact: true }),
    []
  );
}

export function useDeleteOrder() {
  return useMutation((id: string) =>
    Promise.resolve(true)
  );
}
