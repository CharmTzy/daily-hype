// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import React, { useEffect, useState } from "react";
import { ICategory, IColour, IOptionsFetch, IOptions, ISize, IType, IProductDetails, IProduct, IProductDetailsWithNames } from "@/enums/product-interfaces";
import { IProductUpdate } from "@/enums/admin-product-interfaces";
import { capitaliseWord } from "@/functions/formatter";
import { getFilterOptions, getProductAndDetail } from "@/functions/product-functions";
import { updateProduct, deleteProductDetail, createProductDetail } from "@/functions/admin-product-functions";
import { Input, Textarea, Select, SelectItem, Button, useDisclosure } from "@nextui-org/react";



interface ProductFormProps {
  params: { productid: string };
}

interface IUploadedImages {
  imageid: string;
  imagename: string;
  url: string;
}

interface IProductDetailsGrouped {
  [key: string]: ISize[];
}



export default function Page({ params }: ProductFormProps) {
  const productid: string = params.productid;
  const { setCurrentActivePage } = useAppState();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const [types, setTypes] = useState<IType[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [colours, setColours] = useState<IColour[]>([]);
  const [sizes, setSizes] = useState<ISize[]>([]);

  const [uploadedImages, setUploadedImages] = useState<IUploadedImages[]>([]);

  const [productDetails, setProductDetails] = useState<IProductDetailsWithNames[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [buttonClicked, setButtonClicked] = useState(false);
  const [groupedDetails, setGroupedDetails] = useState<IProductDetailsGrouped>();
  const [selectedColour, setSelectedColour] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<ISize[]>([]);
  const [addToCartColour, setAddToCartColour] = useState<string | null>(null);
  const [addToCartSize, setAddToCartSize] = useState<ISize | null>(null);

  const handleColourClick = (colour: string, sizes: ISize[]) => {
    // Set the selected colour and its sizes
    setSelectedColour(colour);
    setSelectedSizes(sizes);
  };


  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.None);

    Promise.all([getProductAndDetail(productid), getFilterOptions()])
      .then(([productDetailsResult, filterOptions]) => {


        // Handle getFilterOptions response
        if (filterOptions.data) {
          const { type, category, colour, size } = filterOptions.data;
          setTypes(type);
          setCategories(category);
          setColours(colour);
          setSizes(size);
        } else {
          console.error(filterOptions.error);
        }

        // Handle getProductAndDetail response
        if (productDetailsResult.data) {
          setName(productDetailsResult.data[0].productname);
          setDescription(productDetailsResult.data[0].description);
          setUnitPrice(productDetailsResult.data[0].unitprice);
          setSelectedType(productDetailsResult.data[0].type);
          setSelectedCategory(productDetailsResult.data[0].category);
          setImages(productDetailsResult.data[0].urls);


          const detailsArray: IProductDetailsWithNames[] = productDetailsResult.data.map((detail) => ({
            productdetailid: detail.productdetailid,
            colourid: detail.colourid,
            colour: detail.colour,
            hex: detail.hex,
            sizeid: detail.sizeid,
            size: detail.size,
            quantity: detail.qty,
          }));
          setProductDetails(detailsArray);

          // Group product details by color and list corresponding sizes
          const updatedGroupedDetails: IProductDetailsGrouped = { ...groupedDetails };

          detailsArray.forEach(detail => {
            if (!updatedGroupedDetails[detail.colour]) {
              updatedGroupedDetails[detail.colour] = [];
            }
            updatedGroupedDetails[detail.colour].push({
              sizeid: parseInt(detail.sizeid),
              sizename: detail.size,
            });
          });

          setGroupedDetails(updatedGroupedDetails);
          console.log(groupedDetails)
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, [buttonClicked]);

  return (
    <div>
      <div className="flex flex-col items-center gap-5 p-5">

        <div className="font-semibold text-2xl pb-5">Product Detail</div>
        <div className="flex  gap-[50px]">
          <div className="flex">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Uploaded Image ${index}`}
                style={{ width: '100px', height: '100px', marginRight: '10px' }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-[20px]">
            <div className="flex gap-5 items-center">
              <div className="flex w-[800px] gap-5">
                <span className="w-full text-xl font-bold">{name}</span>
              </div>
            </div>

            <div className="flex gap-5 items-center">
              <div className="flex w-[800px] gap-5">
                <span>{description}</span>
              </div>
            </div>

            <div className="flex gap-5 items-center">
              <div className="flex w-[800px] gap-5">
                <span className="font-bold">${unitPrice}</span>
              </div>
            </div>

            <div className="flex gap-5 items-center">
              <div className="flex w-[800px] gap-5">
                <span>{capitaliseWord(selectedType)}</span>
              </div>
            </div>

            <div className="flex gap-5 items-center">
              <div className="flex w-[800px] gap-5">
                <span>{capitaliseWord(selectedCategory)}</span>
              </div>
            </div>
            <div className="flex">
              {groupedDetails && Object.entries(groupedDetails).map(([colour, sizes], index) => (
                <div key={index} className="font-medium text-lg pb-5 gap-5">
                  <div className="w-[50px] flex justify-around">
                    <div
                      key={index}
                      title={capitaliseWord(colour)}
                      onClick={() => handleColourClick(colour, sizes)}
                      className={`w-4 h-4 border-1 mr-1 rounded-full laptop-3xl:w-5 laptop-3xl:h-5`}
                      style={{ backgroundColor: `#${colours.find(c => c.colourname === colour)?.hex}` }}
                    ></div>
                  </div>
                  {selectedColour === colour && (
                    <div>
                      {selectedSizes.map((size, idx) => (
                        <button
                          key={idx}
                          className={`bg-gray-200 rounded-md p-3 m-2 cursor-pointer`}
                          onClick={() => {
                            setAddToCartColour(selectedColour);
                            setAddToCartSize(size);
                          }}
                        >
                          {size.sizename}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="flex flex-col items-center m-[15px] ">

          <Button
            variant="ghost"
            size="md"
            onClick={() => {
              // Add your onClick logic here
            }}
            className="border-custom-color1 ms-6 text-custom-color1"
          >
            ADD TO CART
          </Button>

        </div>
      </div>
    </div>

  );
}