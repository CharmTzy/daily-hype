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
    if (loading) {
        return null;
    }

    return (
        <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Colour</label>
            <select
                className="min-h-[44px] w-full rounded-[16px] border border-[#e8e1d8] bg-white px-4 text-sm capitalize text-slate-700 outline-none transition focus:border-[#fb6050]"
                value={value}
                title="Colour"
                onChange={(event) => {
                    onChange(parseInt(event.target.value, 10));
                }}
            >
                {data.map((item, index) => (
                    <option value={item.colourid} className="capitalize" key={index}>
                        {item.colour}
                    </option>
                ))}
            </select>
        </div>
    );
}
