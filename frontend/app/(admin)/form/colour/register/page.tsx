// Name: Thu Htet San
// Admin No: 2235022
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { ICreateFetch } from "@/enums/admin-product-interfaces";



export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [name, setName] = useState<string>("");
  const [hex, setHex] = useState<string>("");

  interface IColour { colourname: string, hex: string }

  function createColour(colour: IColour) {
    console.log("INSIDE createColour")
    return fetch(`${process.env.BACKEND_URL}/api/colourAdmin`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(colour),
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

  const saveColour = () => {
    // Construct the final JSON object to be sent to the backend
    const colour: IColour = {
      colourname: name,
      hex: hex,
    };
    createColour(colour)
      .then((result) => {
        console.log(result)
        if (result.error) {
          if (result.error == "Colour with the same name already exists") {

            alert("Duplicate Colour submitted");
          }
        } else {

          alert("Colour submitted successfully!");
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.ColourForm);
  }, []);

  return (
    <div>
      <div className="flex flex-col items-center gap-5 p-5">
        <div className="font-semibold	text-2xl	pb-5">Colour Registration</div>
        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Input type="text" size={"lg"} label="Colour Name" classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px]" variant="bordered" value={name} onValueChange={setName} />
          </div>
        </div>
        <div className="flex gap-5 items-center">
          <div className="flex w-[400px]">
            <Input type="text" size={"lg"} label="Hex" classNames={{ input: "text-sm", inputWrapper: "border-custom-color1 h-6 rounded-lg" }} className="max-w-[600px]" variant="bordered" value={hex} onValueChange={setHex} />
          </div>
        </div>
        <div className="flex justify-around font-medium text-lg pb-5 items-start w-full">
          <div className="w-[150px]">
            <Button
              variant="ghost"
              size="md"
              onClick={saveColour}
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
