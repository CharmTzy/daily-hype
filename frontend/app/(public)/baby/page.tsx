"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { RadioGroup, Radio, Button } from '@nextui-org/react';

type ButtonStates = {
  sort: boolean;
  type: boolean;
  category: boolean;
  colour: boolean;
  price: boolean;
  size: boolean;
};

type Options = {
  sort: string[];
  type: { typeid: string; typename: string }[];
  category: { categoryid: string; categoryname: string }[];
  colour: { colourid: string; colourname: string }[];
  price: string[];
  size: { sizeid: string; sizename: string }[];
};

type SelectedOptions = {
  Sort: string;
  Type: string;
  Category: string;
  Color: string;
  Price: string;
  Size: string;
  [key: string]: string;
};

const initialButtonStates: ButtonStates = {
  sort: false,
  type: false,
  category: false,
  colour: false,
  price: false,
  size: false,
};


const SearchProduct: React.FC = () => {
  const [buttonStates, setButtonStates] = useState<ButtonStates>(initialButtonStates);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    Sort: '',
    Type: '',
    Category: '',
    Color: '',
    Price: '',
    Size: '',
  });

  const [options, setOptions] = useState<Options>({
    sort: ['price-low-to-high', 'price-high-to-low', 'newest', 'trending'],
    type: [],
    category: [],
    colour: [],
    price: ['< 19.99', '20.00-39.99', '40.00-59.99', '60.00-79.99', '80.00 and above'],
    size: [],
  });

  const handleButtonClick = (category: keyof ButtonStates) => {
    setButtonStates((prevButtonStates) => ({
      ...initialButtonStates,
      [category]: !prevButtonStates[category],
    }));
  };

  const handleRadioChange = useCallback((setFunction: (value: string) => void, category: keyof SelectedOptions) => (value: string) => {
    setFunction(value);

    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [category]: value,
    }));
  }, []);

  const handleCancelClick = useCallback((category: keyof SelectedOptions) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [category]: '',
    }));
  }, []);

  const handleClearClick = useCallback((category: keyof SelectedOptions) => {
    setSelectedOptions((prevOptions) => ({
      ...prevOptions,
      [category]: '',
    }));
  }, []);

  const getFilterOptions = useCallback(() => {
    const typeid = 1; // men typeid=1
    return fetch(`${process.env.BACKEND_URL}/api/filterOptions`)
      .then((response) => response.json())
      .then((result) => result);
  }, []);

  useEffect(() => {
    getFilterOptions().then((filterOptions) => {
      setOptions((prevOptions) => ({
        ...prevOptions,
        type: filterOptions.type,
        category: filterOptions.category,
        colour: filterOptions.colour,
        size: filterOptions.size,
      }));
    }).catch((error) => {
      console.error(error);
    });
  }, [getFilterOptions]);

  const renderRadioGroup = (category: keyof ButtonStates, data: string[]): JSX.Element => (
    <RadioGroup
      orientation="horizontal"
      value={selectedOptions[(category).toUpperCase()]}
      onValueChange={handleRadioChange(
        (value) => setSelectedOptions({ ...selectedOptions, [category.toUpperCase()]: value }),
        category.toUpperCase()
      )}
    >
      {data.map((item) => (
        <Radio key={item} value={item}>
          {item}
        </Radio>
      ))}
    </RadioGroup>
  );
  const renderObjectArrayRadioGroup = (category: string, data: { id: string; name: string }[]) => (
    <RadioGroup
      orientation="horizontal"
      value={selectedOptions[(category).toUpperCase()]}
      onValueChange={handleRadioChange(
        (value) => setSelectedOptions({ ...selectedOptions, [(category).toUpperCase()]: value }),
        (category).toUpperCase()
      )}
    >
      {data.map((item) => (
        <Radio key={item.id} value={item.name}>
          {item.name}
        </Radio>
      ))}
    </RadioGroup>
  );

  return (
    <div className='flex flex-col items-center gap-5'>
      <div className='flex gap-2'>
        {Object.keys(initialButtonStates).map((category) => (
          <Button
            className={buttonStates[category as keyof ButtonStates] ? 'font-semibold text-white bg-custom-colour4' : 'bg-gray-100'}
            key={category} onClick={() => handleButtonClick(category as keyof ButtonStates)}>
            {(category).toUpperCase()}
            <img
              src={buttonStates[category as keyof ButtonStates] ? "/icons/chevron-up-slate-white.svg" : "/icons/chevron-down-slate.svg"}
              alt={buttonStates[category as keyof ButtonStates] ? "Up Arrow" : "Down Arrow"}
            />
          </Button>
        ))}
      </div>

      <div className="flex gap-5">
        {Object.entries(selectedOptions).map(([category, option]) => (
          <div key={category}>
            {option && (
              <div className="selected-option flex gap-2 border-1.5 py-1.5 px-3 rounded">
                <p>
                  {(category).toUpperCase()}: {option}
                </p>
                <button className="cancel-icon" onClick={() => handleCancelClick(category as keyof SelectedOptions)}>
                  &#10005;
                </button>
                <button className="clear-icon" onClick={() => handleClearClick(category as keyof SelectedOptions)}>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        {buttonStates.sort && renderRadioGroup('sort', options.sort)}
        {buttonStates.price && renderRadioGroup('price', options.price)}
        {buttonStates.type && renderObjectArrayRadioGroup('type', options.type.map(item => ({ id: item.typeid, name: item.typename })))}
        {buttonStates.category && renderObjectArrayRadioGroup('category', options.category.map(item => ({ id: item.categoryid, name: item.categoryname })))}
        {buttonStates.colour && renderObjectArrayRadioGroup('colour', options.colour.map(item => ({ id: item.colourid, name: item.colourname })))}
        {buttonStates.size && renderObjectArrayRadioGroup('size', options.size.map(item => ({ id: item.sizeid, name: item.sizename })))}
      </div>
    </div>
  );
};

export default SearchProduct;
