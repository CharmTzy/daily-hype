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

  interface ISize { sizename: string }

  function createSize(size: ISize) {
    console.log("INSIDE createSize")
    return fetch(`${process.env.BACKEND_URL}/api/sizeAdmin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(size),
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

  const saveSize = () => {
    // Construct the final JSON object to be sent to the backend
    const size: ISize = {
      sizename: name
    };
    createSize(size)
      .then((result) => {
        console.log(result)
        if (result.error) {
          if (result.error == "Size with the same name already exists") {

            alert("Duplicate Size submitted");
          }
        } else {

          alert("Size submitted successfully!");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.SizeForm);
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center gap-5 p-5">
        <div className="font-semibold	text-2xl	pb-5">Size Registration</div>
        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Input type="text" size={"lg"} label="Size Name" classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px]" variant="bordered" value={name} onValueChange={setName} />
          </div>
        </div>
        <div className="flex justify-around font-medium text-lg pb-5 items-start w-full">
          <div className="w-[150px]">
            <Button
              variant="ghost"
              size="md"
              onClick={saveSize}
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