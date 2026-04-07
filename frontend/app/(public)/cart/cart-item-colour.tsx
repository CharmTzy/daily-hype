// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

interface ICartItemColourProps {
  data: { colourid: number; colour: string }[];
  value: number;
  loading: boolean;
  onChange: (colourid: number) => void;
}

export default function CartItemColour({ data, value, loading, onChange }: ICartItemColourProps) {
  return (
    !loading && (
      <select
        className="p-2 text-sm rounded-lg outline-none ms-8 cursor-pointer border-r-[15px] border-r-transparent shadow-input laptop-3xl:p-2 laptop-2xl:p-2 laptop-2xl:w-[140px] laptop-2xl:ms-12 laptop-xl:w-[120px] laptop-xl:py-[6px] laptop-xl:text-[13px] capitalize"
        value={value}
        title="Colour"
        onChange={(e) => {
          const value = parseInt(e.target.value, 10);
          onChange(value);
          // if (!isNaN(value)) {
          //   const filteredArr = data.detail.filter((d) => d.colourid === value);
          //   if (filteredArr && filteredArr.length > 0) {
          //     const condition = filteredArr.some((f) => f.sizeid === selected.sizeid);
          //     const tempSelected = { sizeid: selected.sizeid, colourid: value };
          //     // console.log("\nColour Changes");
          //     if (condition) {
          //       // check max qty here
          //     } else {
          //       tempSelected.sizeid = filteredArr[0].sizeid;
          //       // check max qty here
          //     }
          //     const productDetailID = filteredArr.find((f) => f.colourid === value && f.sizeid === tempSelected.sizeid)?.productdetailid;
          //     // console.log("SIZE ID:" + tempSelected.sizeid);
          //     // console.log("COLOUR ID: " + tempSelected.colourid);
          //     // console.log(productDetailID);
          //     if (productDetailID) {
          //       updateCartData(isAuthenticated, { productdetailid: productDetailID, qty: qty }, cart[index].productdetailid).then((result) => {
          //         if (result) {
          //           setSelected((prev) => (prev ? { ...prev, colourid: value, sizeid: tempSelected.sizeid } : null));
          //         } else {
          //           alert("Error in changing product colour!");
          //         }
          //       });
          //     } else {
          //     }
          //   }
          // }
        }}
      >
        {data.map((item, index) => (
          <option value={item.colourid} className="capitalize" key={index}>
            {item.colour}
          </option>
        ))}
      </select>
    )
  );
}
