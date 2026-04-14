"use client";
interface ICartItemColourProps {
    data: {
        colourid: number;
        colour: string;
    }[];
    value: number;
    loading: boolean;
    onChange: (colourid: number) => void;
}
export default function CartItemColour({ data, value, loading, onChange }: ICartItemColourProps) {
    return (!loading && (<select className="p-2 text-sm rounded-lg outline-none ms-8 cursor-pointer border-r-[15px] border-r-transparent shadow-input laptop-3xl:p-2 laptop-2xl:p-2 laptop-2xl:w-[140px] laptop-2xl:ms-12 laptop-xl:w-[120px] laptop-xl:py-[6px] laptop-xl:text-[13px] capitalize" value={value} title="Colour" onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            onChange(value);
        }}>
        {data.map((item, index) => (<option value={item.colourid} className="capitalize" key={index}>
            {item.colour}
          </option>))}
      </select>));
}

