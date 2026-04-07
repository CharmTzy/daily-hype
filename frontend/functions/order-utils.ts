// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import { MonthValue, OrderStatusValue } from "@/enums/order-enums";

/**
 *
 * This will map input value to MonthValue enum
 * @param value (string)
 * @returns MonthValue (enum)
 * @example
 * const month = mapStringToMonthValue("1");
 * console.log(month);    // MonthValue.Jan (enum)
 */
export function mapStringToMonthValue(value: string): MonthValue {
  switch (value) {
    case "0":
      return MonthValue.All;
    case "1":
      return MonthValue.Jan;
    case "2":
      return MonthValue.Feb;
    case "3":
      return MonthValue.Mar;
    case "4":
      return MonthValue.Apr;
    case "5":
      return MonthValue.May;
    case "6":
      return MonthValue.Jun;
    case "7":
      return MonthValue.Jul;
    case "8":
      return MonthValue.Aug;
    case "9":
      return MonthValue.Sep;
    case "10":
      return MonthValue.Oct;
    case "11":
      return MonthValue.Nov;
    case "12":
      return MonthValue.Dec;
    default:
      return MonthValue.All;
  }
}

/**
 *
 * This will map the input value to OrderStatusValue enum
 * @param value (string)
 * @returns OrderStatusValue (enum)
 */
export function mapStringToOrderStatusValue(value: string): OrderStatusValue {
  switch (value) {
    case "all":
      return OrderStatusValue.All;
    case "inprogress":
      return OrderStatusValue.InProgressValue;
    case "confirmed":
      return OrderStatusValue.Confirmed;
    case "delivered":
      return OrderStatusValue.Delivered;
    case "received":
      return OrderStatusValue.Received;
    case "cancelled":
      return OrderStatusValue.Cancelled;
    case "returned":
      return OrderStatusValue.Returned;
    default:
      return OrderStatusValue.All;
  }
}

export function mapStringToNoOfOrder(value: string): number {
  switch (value) {
    case "5":
      return 5;
    case "10":
      return 10;
    case "15":
      return 15;
    default:
      return 5;
  }
}
