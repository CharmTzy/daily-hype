import { ICheckOutCart } from "@/enums/cart-interfaces";
import { ICheckOutProductDetail } from "@/enums/product-interfaces";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import Image from "next/image";

interface IProductSummaryProps {
  productData: ICheckOutProductDetail[];
  cartData: ICheckOutCart[];
  totalAmount: number;
}

export default function OrderSummary({ productData, cartData, totalAmount }: IProductSummaryProps) {
  let subTotal = 0;
  cartData.forEach((item, index) => {
    subTotal += item.qty * parseFloat(productData[index].unitprice);
  });

  return (
    <div className="flex flex-col w-full">
      {cartData.map((c, index) => (
        <div className="flex mt-4" key={index}>
          <Image src={productData[index].image} width={80} height={90} alt={productData[index].productname} />
          <div className="flex flex-col min-w-[300px] max-w-[300px] ms-4 me-auto">
            <label className="text-[15px] w-fit">{productData[index].productname}</label>
            <label className="mt-2 text-[13px]">Colour: {capitaliseWord(productData[index].colour)}</label>
            <label className="mt-1 text-[13px]">Size: {capitaliseWord(productData[index].size)}</label>
          </div>
          <label className="self-center text-[14px]">x{c.qty}</label>
          <label className="self-center ms-auto font-semibold">${formatMoney(productData[index].unitprice)}</label>
        </div>
      ))}
      {cartData.length > 0 && (
        <div className="flex justify-end mt-12 w-full">
          <div className="flex flex-col mr-16 text-right">
            <label className="text-[15px]">Shipping Fees:</label>
            <label className="text-[15px] mt-2">GST (9%):</label>
            <label className="text-[15px] mt-2">Sub Total:</label>
            <label className="text-[18px] mt-4 font-semibold">Total:</label>
          </div>
          <div className="flex flex-col text-right">
            <label className="text-[15px]">$1.50</label>
            <label className="text-[15px] mt-2">${formatMoney((0.09 * subTotal).toString())}</label>
            <label className="text-[15px] mt-2">${formatMoney(subTotal.toString())}</label>
            <label className="text-[18px] mt-4 font-semibold">${formatMoney((totalAmount / 100).toString())}</label>
          </div>
        </div>
      )}
    </div>
  );
}
