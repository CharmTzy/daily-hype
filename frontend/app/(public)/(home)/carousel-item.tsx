"use client";

import { URL } from "@/enums/global-enums";
import { capitaliseWord, formatMoney } from "@/functions/formatter";
import Image from "next/image";
import Link from "next/link";

export default function CarouselItem({ data, currentActiveNo }: { data: any; currentActiveNo: number }) {
  let type = "",
    category = "",
    description = "",
    colour: { colourid: number; colour: string; hex: string }[] = [],
    size: { sizeid: number; size: string }[] = [],
    sizeText = "",
    price = "",
    productName = "",
    url = "";

  if (data && data.length > currentActiveNo) {
    const currentItem = data[currentActiveNo];
    type = capitaliseWord(currentItem.typename);
    category = capitaliseWord(currentItem.categoryname);
    price = formatMoney(currentItem.unitprice);
    productName = currentItem.productname;
    url = currentItem.url[0];
    description = currentItem.description;

    colour = currentItem.detail.map((d: any) => ({ colourid: d.colourid, colour: capitaliseWord(d.colour), hex: d.hex }));
    colour = colour.filter((item: { colourid: number; colour: string; hex: string }, index: number) => colour.findIndex((c) => c.colourid === item.colourid) === index);

    size = currentItem.detail.map((d: any) => ({ sizeid: d.sizeid, size: d.size.toUpperCase() }));
    size = size.filter((item: { sizeid: number; size: string }, index: number, arr) => {
      return size.findIndex((s) => s.sizeid === item.sizeid) === index;
    });
    let tempSize = size.map((s) => s.size);
    sizeText = tempSize.join(", ");
  }

  let colourRender = () => {
    const items: JSX.Element[] = [];
    colour.forEach((item, index) => {
      items.push(<div key={index} title={item.colour} className={`w-4 h-4 border-1 mr-3 rounded-full laptop-3xl:w-5 laptop-3xl:h-5`} style={{ backgroundColor: `#${item.hex}` }}></div>);
    });
    return items;
  };

  return (
    <div className="flex w-full h-88 justify-center items-center my-8 px-16">
      <div className="flex flex-col self-start mr-56">
        <Link href={URL.Man} className="mt-2 h-16 min-w-[400px] max-w-[400px] text-lg font-semibold tracking-wider w-fit text-black dark:text-white laptop-3xl:text-2xl laptop-3xl:min-w-[500px] laptop-3xl:h-16 laptop-3xl:max-w-[500px] laptop-xl:h-12">
          {productName}
        </Link>
        <div className="flex mt-6">
          <div className="flex flex-col mr-8">
            <label className="laptop-3xl:text-large">Type:</label>
            <label className="mt-2 laptop-3xl:text-large">Category:</label>
            <label className="mt-2 laptop-3xl:text-large">Colours:</label>
            <label className="mt-2 laptop-3xl:text-large">Sizes:</label>
            <label className="mt-2 laptop-3xl:text-large">Price:</label>
          </div>
          <div className="flex flex-col">
            <label>{type}</label>
            <label className="mt-2 laptop-3xl:text-large">{category}</label>
            <div className="mt-3 flex items-center laptop-3xl:mt-4">{colourRender()}</div>
            <label className="mt-3 laptop-3xl:text-large">{sizeText}</label>
            <label className="mt-2 laptop-3xl:text-large">${price}</label>
          </div>
        </div>
        <label className="mt-6 h-20 w-[450px] overflow-hidden text-justify laptop-3xl:text-large laptop-2xl:h-[78px] laptop-xl:h-[74px]">{description}</label>
      </div>
      <div className="flex justify-center">
        <div className="w-[200px] h-[250px] overflow-hidden rounded-xl laptop-3xl:w-[230px] laptop-3xl:h-[280px]">
          <Image priority={true} fetchPriority="high" className="w-full h-full" width={200} height={250} src={url} alt={productName} loading="eager" />
        </div>
      </div>
    </div>
  );
}
