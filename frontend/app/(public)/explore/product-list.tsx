"use client";

import { IProductDataFilter } from "@/enums/product-interfaces";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import { Card, CardBody, CardFooter } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { URL } from "@/enums/global-enums";

export default function ProductList({ data }: { data: IProductDataFilter[] }) {
  const router = useRouter();
  let colourRender = (details: { hex: string; colourname: string }[]) => {
    const items: JSX.Element[] = [];
    const colours: string[] = [];
    details.forEach((item, index) => {
      console.log(item);
      if (!colours.some((c) => c === item.hex)) {
        items.push(<div key={index} title={capitaliseWord(item.colourname)} className={`w-4 h-4 border-1 mr-1 rounded-full laptop-3xl:w-5 laptop-3xl:h-5`} style={{ backgroundColor: `#${item.hex}` }}></div>);
        colours.push(item.hex);
      }
    });
    return items;
  };

  return (
    <div className="ps-20 justify-start flex flex-wrap w-full max-w-[1200px] h-fit">
      {data.map((item, index) => {
        return (
          <Card
            shadow="sm"
            className="w-[200px] mr-5 mb-5"
            key={index}
            isPressable
            onPress={() => {
              alert(item.productname);
              router.push(URL.ProductDetail + item.productid)
              // console.log("item pressed");
              //go to product detail
            }}
          >
            <CardBody className="overflow-visible p-0">
              <div className="w-full h-[180px]">
                <Image priority={true} fetchPriority="high" loading="eager" width={100} height={150} alt={item.productname} className="w-full object-cover h-full" src={item.url[0]} />
              </div>
            </CardBody>
            <CardFooter className="text-small flex flex-col">
              <b className="h-10 self-start text-left text-[14px] overflow-hidden">{item.productname}</b>
              <div className="self-start mt-2 flex w-full">
                <p className="text-slate-400 dark:text-slate-600 text-[13px] font-semibold capitalize">{item.typename}</p>
                <p className="text-slate-400 ms-auto dark:text-slate-600 text-[13px] font-semibold capitalize">{item.categoryname}</p>
              </div>
              <div className="flex self-start w-full mt-2">
                <div className="flex">{colourRender(item.detail)}</div>
                <div className="ms-auto flex items-center">
                  <span className="text-[gold] text-[20px] -mt-[2px] mr-1">&#9733;</span>
                  <p className="tracking-wide text-slate-600 dark:text-slate-400">{parseFloat(item.rating).toFixed(1)}</p>
                </div>
              </div>
              <p className="mt-2 self-start font-semibold text-slate-600 dark:text-slate-400">${formatMoney(item.unitprice)}</p>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
