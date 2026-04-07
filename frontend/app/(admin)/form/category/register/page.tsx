// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import { Input, Button } from "@nextui-org/react";
import {ICreateFetch} from "@/enums/admin-product-interfaces";



export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [name, setName] = useState<string>("");

  interface ICategory { categoryname: string }

  function createCategory(category: ICategory) {
    console.log("INSIDE createCategory")
    return fetch(`${process.env.BACKEND_URL}/api/categoryAdmin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(category),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log(result.error)
        if (result.error) {
          return { data: null, error: result.error } as ICreateFetch;
        } else {
          return { data: result, error: null } as ICreateFetch;
        }
      });
  }

  const saveCategory = () => {
    // Construct the final JSON object to be sent to the backend
    const category: ICategory = {
      categoryname: name
    };
    createCategory(category)
      .then((result) => {
        console.log(result)
        if (result.error) {
          if (result.error == "Category with the same name already exists") {

            alert("Duplicate Category submitted");
          }
        } else {

          alert("Category submitted successfully!");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.CategoryForm);
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center gap-5 p-5">
        <div className="font-semibold	text-2xl	pb-5">Category Registration</div>
        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Input type="text" size={"lg"} label="Category Name" classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px]" variant="bordered" value={name} onValueChange={setName} />
          </div>
        </div>
        <div className="flex justify-around font-medium text-lg pb-5 items-start w-full">
          <div className="w-[150px]">
            <Button
              variant="ghost"
              size="md"
              onClick={saveCategory}
              className="bg-custom-color1 ms-6 text-white"
            >
              SAVE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
