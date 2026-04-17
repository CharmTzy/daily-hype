"use client";

interface ICartItemSizeProps {
    data: {
        sizeid: number;
        size: string;
    }[];
    value: number;
    loading: boolean;
    onChange: (sizeid: number) => void;
}

export default function CartItemSize({ data, value, loading, onChange }: ICartItemSizeProps) {
    if (loading) {
        return null;
    }

    return (
        <div className="space-y-2">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Size</label>
            <select
                className="min-h-[44px] w-full rounded-[16px] border border-[#e8e1d8] bg-white px-4 text-sm uppercase text-slate-700 outline-none transition focus:border-[#fb6050]"
                value={value}
                title="Size"
                onChange={(event) => {
                    onChange(parseInt(event.target.value, 10));
                }}
            >
                {data.map((item, index) => (
                    <option value={item.sizeid} className="uppercase" key={index}>
                        {item.size}
                    </option>
                ))}
            </select>
        </div>
    );
}
