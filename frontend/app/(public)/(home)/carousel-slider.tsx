import clsx from "clsx";
export default function CarouselSlider({ start, current, total, func, }: {
    start: number;
    current: number;
    total: number;
    func?: (clickedIndex: number) => void;
}) {
    const render = () => {
        const items = [];
        for (let i = start; i < start + total; i++) {
            items.push(<div key={i} onClick={() => {
                    if (func)
                        func(i);
                }} className={clsx("w-4 h-4 rounded-full cursor-pointer mr-6 border-black dark:border-white laptop-3xl:w-5 laptop-3xl:h-5", current !== i && "border-1", current === i && "bg-black border-1 dark:bg-white")}></div>);
        }
        return items;
    };
    return (<div className="mx-auto mb-10 mt-5 flex w-full max-w-7xl justify-center px-4 sm:px-6 lg:mb-14 lg:mt-6 lg:px-8">{render()}</div>);
}
