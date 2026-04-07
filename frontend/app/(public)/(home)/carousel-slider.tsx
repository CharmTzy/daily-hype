import clsx from "clsx";

export default function CarouselSlider({
  start,
  current,
  total,
  func,
}: {
  start: number;
  current: number;
  total: number;
  func?: (clickedIndex: number) => void;
}) {
  const render = () => {
    const items = [];
    for (let i = start; i < start + total; i++) {
      items.push(
        <div
          key={i}
          onClick={() => {
            if (func) func(i);
          }}
          className={clsx(
            "w-4 h-4 rounded-full cursor-pointer mr-6 border-black dark:border-white laptop-3xl:w-5 laptop-3xl:h-5",
            current !== i && "border-1",
            current === i && "bg-black border-1 dark:bg-white"
          )}
        ></div>
      );
    }
    return items;
  };

  return (
    <div className="flex w-full justify-center mt-4 mb-12 laptop-3xl:mt-10">{render()}</div>
  );
}
