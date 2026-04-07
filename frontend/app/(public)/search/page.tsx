"use client";

import { CurrentActivePage } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import { useEffect, useState } from "react";
import SearchIcon from "@/icons/search-icon";
import { Button, Input } from "@nextui-org/react";
import SearchFilter from "./searchfilter";
import SearchList from "./searchlist";
import { capitaliseWord } from "@/functions/formatter";

interface SelectedFilters {
  sort: string;
  type: string;
  category: string;
  colour: string;
  price: string;
  size: string;
}

export default function SearchProduct() {
  const { setCurrentActivePage } = useAppState();
  const [searchInput, setSearchInput] = useState<string>("");
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    sort: "",
    type: "",
    category: "",
    colour: "",
    price: "",
    size: "",
  });
  const handleFilterChange = (filters: SelectedFilters) => {
    setSelectedFilters(filters);
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.Search);
    console.log(selectedFilters);
  }, []);

  return (
    <div className="flex flex-col ">
      {/* search bar */}
      <div className="flex justify-center mt-10">
        <div className="w-[600px]">
          <Input type="text" placeholder="Search ..." classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px]" variant="bordered" startContent={<SearchIcon width={17} height={17} />} value={searchInput} onValueChange={setSearchInput} />
          <p className="text-xs p-1 font-medium">Start typing to search</p>
        </div>
        <Button variant="ghost" size="md" onClick={() => { setSearchInput("") }} className="border-custom-color1 ms-6 text-custom-color1">
          Cancel
        </Button>
      </div>

      {/* filter operation */}
      <SearchFilter onFilterChange={handleFilterChange} />
      <SearchList searchInput={searchInput} selectedFilters={selectedFilters} />

      <div className="gap-5 m-5 grid sm:grid-cols-2 lg:grid-cols-4 md:grid-cols-3">
        
      </div>
    </div>
  );
}
