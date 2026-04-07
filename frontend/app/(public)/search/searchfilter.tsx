"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { RadioGroup, Radio, Button } from '@nextui-org/react';
import { capitaliseWord } from "@/functions/formatter";

interface SearchFilterProps {
    onFilterChange: (selectedOptions: SelectedOptions) => void;
}

interface ButtonStates {
    sort: boolean;
    type: boolean;
    category: boolean;
    colour: boolean;
    price: boolean;
    size: boolean;
};

interface Options {
    sort: { sortid: string; sortname: string }[];
    type: { typeid: string; typename: string }[];
    category: { categoryid: string; categoryname: string }[];
    colour: { colourid: string; colourname: string }[];
    price: { priceid: string; pricename: string }[];
    size: { sizeid: string; sizename: string }[];
};

interface SelectedOptions {
    sort: string;
    type: string;
    category: string;
    colour: string;
    price: string;
    size: string;
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


export default function SearchFilter({ onFilterChange }: SearchFilterProps) {
    const [buttonStates, setButtonStates] = useState<ButtonStates>(initialButtonStates);
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
        sort: '',
        type: '',
        category: '',
        colour: '',
        price: '',
        size: '',
    });

    const [options, setOptions] = useState<Options>({
        sort: [
            { sortid: 'unitprice ASC', sortname: 'price-low-to-high' },
            { sortid: 'unitprice DESC', sortname: 'price-high-to-low' },
            { sortid: 'createdat DESC', sortname: 'newest' },
            { sortid: 'soldqty DESC', sortname: 'trending' },
        ],
        type: [],
        category: [],
        colour: [],
        price: [
            { priceid: '0,19.99', pricename: '< 19.99' },
            { priceid: '20.00,39.99', pricename: '20.00-39.99' },
            { priceid: '40.00,59.99', pricename: '40.00-59.99' },
            { priceid: '60.00,79.99', pricename: '60.00-79.99' },
            { priceid: '80,1000', pricename: '80.00 and above' },
        ],
        size: [],
    });

    const handleButtonClick = (category: keyof ButtonStates) => {
        console.log('Button clicked:', category);
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

        return fetch(`${process.env.BACKEND_URL}/api/filterOptions`)
            .then((response) => response.json())
            .then((result) => result);
    }, []);

    const getOptionName = (category: string, option: string): string => {
        switch (category) {
            case 'sort':
                return options.sort.find((item) => item.sortid === option)?.sortname || '';
            case 'price':
                return options.price.find((item) => item.priceid === option)?.pricename || '';
            default:
                return option;
        }
    };

    useEffect(() => {
        onFilterChange(selectedOptions);
    }, [selectedOptions, onFilterChange])

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

    const renderObjectArrayRadioGroup = (category: string, data: { id: string; name: string }[]) => (
        <RadioGroup
            orientation="horizontal"
            value={selectedOptions[(category)]}
            onValueChange={handleRadioChange(
                (value) => setSelectedOptions({ ...selectedOptions, [(category)]: value }),
                (category)
            )}
        >
            {data.map((item) => (
                <Radio key={item.id} value={item.id}>
                    {capitaliseWord(item.name)}
                </Radio>
            ))}
        </RadioGroup>
    );

    return (
        <div className='flex flex-col items-center gap-5 min-h-[160px]'>
            <div className='flex gap-2'>
                {Object.keys(initialButtonStates).map((category) => (
                    <Button
                        className={buttonStates[category as keyof ButtonStates] ? 'font-semibold text-white bg-custom-color4' : 'bg-gray-100'}
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
                                    {(category).toUpperCase()}: {(getOptionName(category, option)).toUpperCase()}
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
                {buttonStates.sort && renderObjectArrayRadioGroup('sort', options.sort.map((item) => ({ id: item.sortid, name: item.sortname })))}
                {buttonStates.price && renderObjectArrayRadioGroup('price', options.price.map((item) => ({ id: item.priceid, name: item.pricename })))}
                {buttonStates.type && renderObjectArrayRadioGroup('type', options.type.map(item => ({ id: item.typename, name: item.typename })))}
                {buttonStates.category && renderObjectArrayRadioGroup('category', options.category.map(item => ({ id: item.categoryname, name: item.categoryname })))}
                {buttonStates.colour && renderObjectArrayRadioGroup('colour', options.colour.map(item => ({ id: item.colourname, name: item.colourname })))}
                {buttonStates.size && renderObjectArrayRadioGroup('size', options.size.map(item => ({ id: item.sizename, name: item.sizename })))}
            </div>
        </div>
    );
};
