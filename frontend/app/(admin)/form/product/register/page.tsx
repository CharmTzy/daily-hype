// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import React, { useEffect, useState } from "react";
import { ICategory, IColour, IOptionsFetch, IOptions, ISize, IType, ISelectedDetails } from "@/enums/product-interfaces";
import { IProduct } from "@/enums/admin-product-interfaces";
import { capitaliseWord } from "@/functions/formatter";
import { getFilterOptions } from "@/functions/product-functions";
import { Input, Textarea, Select, SelectItem, Button } from "@nextui-org/react";
import { createProduct } from "@/functions/admin-product-functions";
import  FileInput  from "@/components/ui/file-input";
//import CloudinaryFileInput from "@/components/ui/cloudinary-file-input";

interface IUploadedImages {
  imageid: string;
  imagename: string;
  url: string;
}

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [types, setTypes] = useState<IType[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [colours, setColours] = useState<IColour[]>([]);
  const [sizes, setSizes] = useState<ISize[]>([]);

  
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  //const [uploadedImages, setUploadedImages] = useState<IUploadedImages[]>([]);

  const [productDetails, setProductDetails] = useState<ISelectedDetails[]>([]);
  const [selectedColour, setSelectedColour] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const isDetailAlreadyAdded = (newDetail: ISelectedDetails) => {
    return productDetails.some((detail) => detail.colourid === newDetail.colourid && detail.sizeid === newDetail.sizeid);
  };

  const handleAddButtonClick = () => {
    const newDetail = {
      colourid: selectedColour,
      sizeid: selectedSize,
      quantity: quantity,
    };
    if (!isDetailAlreadyAdded(newDetail)) {
      setProductDetails([...productDetails, newDetail]);
    } else {
      // You can show an error message or handle the duplicate entry as needed
      console.log("Duplicate entry: Color and size combination already exists!");
    }
  };

  const saveProduct = () => {
    // Construct the final JSON object to be sent to the backend
    const product: IProduct = {
      name: name,
      description: description,
      unitPrice: unitPrice,
      typeid: selectedType,
      categoryid: selectedCategory,
      productDetails: productDetails,
      images: uploadedImages,
    };
    console.log("Product to send:", product);
    createProduct(product)
      .then(() => {
        alert("Product submitted successfully!");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.ProductForm);
    getFilterOptions()
      .then((filterOptions) => {
        if (filterOptions.data) {
          console.log(filterOptions);
          const { type, category, colour, size } = filterOptions.data;
          // Update state variables with the fetched data
          setTypes(type);
          setCategories(category);
          setColours(colour);
          setSizes(size);
        } else {
          console.error(filterOptions.error);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center gap-5 p-5">
        <div className="font-semibold	text-2xl	pb-5">Product Registration</div>

        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Input type="text" size={"lg"} label="Product Name" classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px]" variant="bordered" value={name} onValueChange={setName} />
          </div>
        </div>

        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Textarea label="Description" classNames={{ inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px] max-h-[500px]" variant="bordered" value={description} onValueChange={setDescription} />
          </div>
        </div>

        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Input type="number" size={"lg"} label="Unit Price" min="0" classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px]" variant="bordered" value={unitPrice} onValueChange={setUnitPrice} />
          </div>
        </div>

        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Select
              isRequired
              label="Type"
              classNames={{ base: "bg-custom-color1 rounded-lg", trigger: "bg-custom-color5" }}
              // popoverProps={{
              //   classNames: {
              //     base: "before:bg-custom-color1",
              //     content: "p-0 border-small border-divider bg-custom-color1 ",
              //   }}}
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
              }}
            >
              {types.map((types) => (
                <SelectItem key={types.typeid} value={types.typeid}>
                  {capitaliseWord(types.typename)}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Select
              isRequired
              label="Category"
              classNames={{ base: "bg-custom-color1 rounded-lg", trigger: "bg-custom-color5" }}
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
            >
              {categories.map((category) => (
                <SelectItem key={category.categoryid} value={category.categoryid}>
                  {capitaliseWord(category.categoryname)}
                </SelectItem>
              ))}
            </Select>
          </div>
        </div>

        <div>
          {/* <CloudinaryFileInput limit={9} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} /> */}
          <FileInput limit={6} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-5 m-[15px]">

        <div className="font-semibold	text-2xl	p-5 items-start	w-full">Product Details</div>


        <div className="flex justify-around font-medium	text-lg	pb-5 items-start	w-full">

          <div className="w-[150px] ">Colour</div>
          <div className="w-[150px] ">Size</div>
          <div className="w-[150px] ">Quantity</div>
          <div className="w-[150px] ">Action</div>
        </div>

        {productDetails.map((detail, index) => (
          <div key={index} className="flex justify-around font-medium text-lg pb-5 items-start w-full">
            <div className="w-[150px] ">
              {capitaliseWord(
              colours.find((colour) => colour.colourid.toString() == detail.colourid)?.colourname || ""
            )}
            </div>
            <div className="w-[150px] ">{capitaliseWord(
              sizes.find((size) => size.sizeid.toString() == detail.sizeid)?.sizename || ""
            )}</div>
            <div className="w-[150px] ">{detail.quantity}</div>
            <div className="w-[150px] ">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  const updatedDetails = [...productDetails];
                  updatedDetails.splice(index, 1);
                  setProductDetails(updatedDetails);
                }}
                className="border-custom-color1 ms-6 text-custom-color1"
              >
                DELETE
              </Button>
            </div>
          </div>
        ))}

        <div className="flex justify-around font-medium	text-lg	pb-5 items-start	w-full">
          <div className="w-[150px] ">
            <Select
              isRequired
              label="Colour"
              value={selectedColour}
              onChange={(e) => {
                setSelectedColour(e.target.value);
              }}
            >
              {colours.map((colour) => (
                <SelectItem style={{ backgroundColor: `#${colour.hex}`, margin:'3px' }} key={colour.colourid} value={colour.colourid}>
                {capitaliseWord(colour.colourname)}
              </SelectItem >
              ))}
            </Select>
          </div>
          <div className="w-[150px] ">
            <Select
              isRequired
              label="Size"
              value={selectedType}
              onChange={(e) => {
                setSelectedSize(e.target.value);
              }}
            >
              {sizes.map((size) => (
                <SelectItem key={size.sizeid} value={size.sizeid}>
                  {(size.sizename).toLocaleUpperCase()}
                </SelectItem >
              ))}
            </Select>
          </div>
          <div className="w-[150px] ">
            <Input type="number"
              size={"lg"}
              label="Quantity"
              min="0"
              classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }}
              className="max-w-[600px]" variant="bordered"
              value={quantity}
              onValueChange={setQuantity} />
          </div>
          <div className="w-[150px] ">
            <Button variant="ghost" size="md" onClick={handleAddButtonClick} className="border-custom-color1 ms-6 text-custom-color1">
              ADD
            </Button>
          </div>
        </div>

        <div className="flex justify-around font-medium text-lg pb-5 items-start w-full">
          <div className="w-[150px]">
            <Button
              variant="ghost"
              size="md"
              onClick={saveProduct}
              className="bg-custom-color1 ms-6 text-white"
            >
              SAVE PRODUCT
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
