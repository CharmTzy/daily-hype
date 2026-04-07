// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { TAdminRefundCount, TGetAdminRefund } from "@/enums/admin-refund-interfaces";
import { ErrorMessage } from "@/enums/global-enums";

export function getAdminRefund(pageNo: number, limit: number): Promise<TGetAdminRefund> {
  return fetch(`${process.env.BACKEND_URL}/api/refund/admin?offset=${pageNo * limit}&limit=${limit}`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { data: null, error: result.error } as TGetAdminRefund;
      } else {
        if (result.data) {
          return { data: result.data, error: null } as TGetAdminRefund;
        } else {
          return { data: null, error: ErrorMessage.INVALID_DATA } as TGetAdminRefund;
        }
      }
    })
    .catch((error) => {
      console.error(error);
      return { data: null, error: ErrorMessage.FetchError } as TGetAdminRefund;
    });
}

export function getAdminRefundCount(): Promise<TAdminRefundCount> {
  return fetch(`${process.env.BACKEND_URL}/api/refund/count/admin`, {
    method: "GET",
    credentials: "include",
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        return { count: null, error: result.error } as TAdminRefundCount;
      } else {
        if (!result.count || isNaN(result.count)) {
          return { count: null, error: ErrorMessage.INVALID_DATA } as TAdminRefundCount;
        }
        return { count: parseInt(result.count, 10), error: null } as TAdminRefundCount;
      }
    })
    .catch((error) => {
      console.error(error);
      return { count: null, error: ErrorMessage.FetchError } as TAdminRefundCount;
    });
}
