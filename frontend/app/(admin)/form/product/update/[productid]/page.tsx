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

import CloudinaryFileInput from "@/components/ui/cloudinary-file-input";
import DetailUpdate from "./detail-update";

interface ProductFormProps {
  params: { productid: string };
}

interface IUploadedImages {
  imageid: string;
  imagename: string;
  url: string;
}

export default function Page({ params }: ProductFormProps) {
  const productid: string = params.productid;
  const { setCurrentActivePage } = useAppState();
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [unitPrice, setUnitPrice] = useState<string>("");
  const [defaultType, setDefaultType] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const [types, setTypes] = useState<IType[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [colours, setColours] = useState<IColour[]>([]);
  const [sizes, setSizes] = useState<ISize[]>([]);

  const [uploadedImages, setUploadedImages] = useState<IUploadedImages[]>([]);

  const [productDetails, setProductDetails] = useState<IProductDetailsWithNames[]>([]);
  const [selectedColour, setSelectedColour] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [dataToModal, setDataToModal] = useState<IProductDetailsWithNames>();
  const [buttonClicked, setButtonClicked] = useState(false);



  const saveProduct = () => {
    // Construct the final JSON object to be sent to the backend
    const product: IProductUpdate = {
      productid: productid,
      name: name,
      description: description,
      unitprice: unitPrice,
      typeid: selectedType,
      categoryid: selectedCategory,
      images: uploadedImages,
    };
    console.log("Product to send:", product);
    updateProduct(product).then(() => {
      alert("Product updated successfully!");
    }).catch((error) => {
      console.error(error);
    });
    setUploadedImages([]);
    setButtonClicked(!buttonClicked);
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
          setDefaultType(productDetailsResult.data[0].typeid);
          setSelectedType(productDetailsResult.data[0].typeid);
          setSelectedCategory(productDetailsResult.data[0].categoryid);
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
        }

      })
      .catch((error) => {
        console.error(error);
      });
  }, [buttonClicked]);

  return (
    <div>
      <div className="flex flex-col items-center gap-5 p-5">
        <div className="font-semibold	text-2xl	pb-5">Product Update</div>

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
            {types && selectedType &&
              <Select
                isRequired
                label="Type"
                classNames={{ base: "bg-custom-color1 rounded-lg", trigger: 'bg-custom-color5' }}
                // popoverProps={{
                //   classNames: {
                //     base: "before:bg-custom-color1",
                //     content: "p-0 border-small border-divider bg-custom-color1 ",
                //   }}}
                selectedKeys={[selectedType + ""]}
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                }}
              >
                {types.map((types) => (
                  <SelectItem key={types.typeid} value={types.typeid}>
                    {capitaliseWord(types.typename)}
                  </SelectItem >
                ))}
              </Select>
            }
          </div>
        </div>

        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Select
              isRequired
              label="Category"
              classNames={{ base: "bg-custom-color1 rounded-lg", trigger: 'bg-custom-color5' }}
              selectedKeys={[selectedCategory + ""]}
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

        <div className="flex">
          {images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Uploaded Image ${index}`}
              style={{ width: '100px', height: '100px', marginRight: '10px' }}
            />
          ))}
          <CloudinaryFileInput limit={9} uploadedImages={uploadedImages} setUploadedImages={setUploadedImages} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-5  m-[15px] border-2">

        <div className="font-semibold	text-2xl	pb-5 items-start p-5	w-full">Product Details</div>


        <div className="flex justify-around font-bold	text-lg	pb-5 items-start	w-full">

          <div className="w-[150px] ">Colour</div>
          <div className="w-[150px] ">Size</div>
          <div className="w-[150px] ">Quantity</div>
          <div className="w-[250px] pl-[50px]">Action</div>
        </div>

        {productDetails.map((detail, index) => (
          <div key={index} className="flex justify-around font-medium text-lg pb-5 items-start w-full">
            <div className="w-[150px] ">
              {capitaliseWord(detail.colour)}
              <div
                key={index}
                title={capitaliseWord(detail.colour)}
                className={`w-4 h-4 border-1 mr-1 rounded-full laptop-3xl:w-5 laptop-3xl:h-5`}
                style={{ backgroundColor: `#${detail.hex}` }}
              ></div>

            </div>

            <div className="w-[150px] ">{capitaliseWord(
              detail.size
            )}</div>
            <div className="w-[150px] ">{detail.quantity}</div>
            <div className="w-[250px] ">
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setDataToModal(detail);
                  onOpen();
                  setButtonClicked(!buttonClicked);
                  //<DetailUpdate isOpen={isOpen} onClose={onClose} productDetails={detail} />
                }}
                className="border-custom-color1 ms-6 text-custom-color1"
              >
                EDIT
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  deleteProductDetail(detail.productdetailid)
                    .then(() => {
                      alert(`Product detail with ID ${detail.productdetailid} deleted successfully.`);
                      setButtonClicked(!buttonClicked);
                    })
                    .catch((error) => {
                      alert("Error deleting product detail");
                    });
                  // const updatedDetails = [...productDetails];
                  // updatedDetails.splice(index, 1);
                  // setProductDetails(updatedDetails);
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
                <SelectItem style={{ backgroundColor: `#${colour.hex}`, margin: '3px' }} key={colour.colourid} value={colour.colourid}>
                  {capitaliseWord(colour.colourname)}
                </SelectItem>
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
          <div className="w-[250px] ">
            <Button variant="ghost" size="md"
              onClick={() => {
                const productdetail = {
                  productid: productid,
                  colourid: selectedColour,
                  sizeid: selectedSize,
                  quantity: quantity
                };

                createProductDetail(productdetail).then((result) => {
                  alert(`A new Product detail is created successfully.`);
                  setButtonClicked(!buttonClicked);
                }).catch((error) => {
                  alert("Error creating product detail");
                });
              }}
              className="border-custom-color1 ms-6 text-custom-color1">
              ADD
            </Button>
          </div>
        </div>

      </div>
      <div className="flex justify-around font-medium text-lg p-5 items-start w-full">
        <div className="w-[150px] ">
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
      {dataToModal && <DetailUpdate isOpen={isOpen} onClose={onClose} productDetails={dataToModal}
        onModalClose={() => {
          setButtonClicked(!buttonClicked);
          // You can add more actions to be performed on modal close
        }} />}
    </div>);
}
