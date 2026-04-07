"use client";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { Button, Checkbox, Input, Link, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react";
import { JSX, SVGProps, useEffect, useState } from "react";

export default function Component() {
  interface Address {
    block_no: number;
    address_id: number;
    fullname: string;
    phone: string;
    street: string;
    building: string;
    unit_no: string;
    postal_code: string;
    is_default: boolean;
  }

  const { setCurrentActivePage } = useAppState();
  const [fullname, setfullName] = useState("");
  const [phone, setPhone] = useState("");
  const [block_no, setBlock] = useState("");
  const [postal_code, setPostal_code] = useState("");
  const [street, setStreet] = useState("");
  const [building, setBuilding] = useState("");
  const [unit_no, setUnit_no] = useState("");
  const [region, setRegion] = useState("");
  const [is_default, setDefault] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddMode, setAddMode] = useState(true);
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.AddressBook);
    fetchAddress();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      if (!isAddMode) {
        setEmpty();
      }
    }
  }, [isOpen]);

  const setEmpty = () => {
    setfullName("");
    setPhone("");
    setPostal_code("");
    setBlock("");
    setStreet("");
    setBuilding("");
    setUnit_no("");
    setRegion("");
    setDefault(false);
  };

  const addAddress = () => {
    if (addresses.length >= 4) {
      alert("You can only add up to four addresses.");
      return;
    }
    if(!(fullname && phone && postal_code && street && block_no)){
      alert("Please fill in all field");
      return;
    }
    
    if (!/^\d{6}$/.test(postal_code)) {
      alert("Please enter a 6-digit postal code.");
      return;
    }

    const blockNoInteger = parseInt(block_no);
    if (isNaN(blockNoInteger)) {
      alert("Block number must be an integer.");
      return;
    }

    fetch(`${process.env.BACKEND_URL}/api/addAddress`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fullname, phone, postal_code, block_no, street, building, unit_no, region, is_default }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error == "Address already exists") {
          alert("Address already exists. Add a new one!");
        }
        console.log("Address added successfully:", data);
        onClose();
        fetchAddress();
      })
      .catch((error) => {
        console.error("Error adding address:", error);

        alert("Failed to add address. Please try again.");
      });
  };

  const fetchAddress = () => {
    fetch(`${process.env.BACKEND_URL}/api/getAllAddresses`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (!response.ok) {
          alert("Address Error");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.addresses)
        setAddresses(data.addresses);
      
      })
      .catch((error) => {
        console.error("Error fetching addresses", error);
      });
  };

  const deleteAddress = (address_id: number) => {
    fetch(`${process.env.BACKEND_URL}/api/deleteAddress`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address_id }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete address");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        window.location.reload();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const openEditModal = (address_id: number) => {
    setAddMode(false);
    // getAddress(address_id);
    onOpen();
  };

  const getAddress = (address_id: number) => {
    console.log(address_id);
    fetch(`${process.env.BACKEND_URL}/api/getAddress/${address_id}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch address details");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        setSelectedAddress(data.address);
        setfullName(data.address.fullname);
        setPhone(data.address.phone);
        setPostal_code(data.address.postal_code);
        setBlock(data.address.block_no);
        setStreet(data.address.street);
        setUnit_no(data.address.unit_no);
        setRegion(data.address.region);
        setDefault(data.address.is_default );
        if (data.address.is_default) {
          setDefault(data.address.is_default);
        }
        if(data.address.building){
          console.log(data.address.building);
          setBuilding(data.address.building);
        }else{
          setBuilding("");
        }
      })
      .catch((error) => {
        console.error("Error fetching address details:", error);
      });
  };

  const editAddress = () => {
    if (!selectedAddress) {
      console.error("No address selected for editing");
      return;
    }
    if (!/^\d{6}$/.test(postal_code)) {
      alert("Please enter a 6-digit postal code.");
      return;
    }

    const blockNoInteger = parseInt(block_no);
    if (isNaN(blockNoInteger)) {
      alert("Block number must be an integer.");
      return;
    }
    fetch(`${process.env.BACKEND_URL}/api/editAddress`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address_id: selectedAddress.address_id, fullname, phone, postal_code,block_no, street, building, unit_no, region, is_default }),
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.error == "Address already exists") {
          alert("Address already exists. Edit with new one!");
        }
        console.log("Address edited successfully:", data);
        onClose();
        fetchAddress();
        setSelectedAddress(null);
      })
      .catch((error) => {
        console.error("Error editing address:", error);
      });
  };

  const addOrEditAddress = () => {
    console.log("Inside addOrEditAddress");
    if (isAddMode) {
      addAddress();
    } else {
      editAddress();
    }
  };

  const renderAddress = (address: Address) => (
    <>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-semibold">{`${address.fullname} ${address.phone}`}</h4>
        {address.is_default && <div className="text-blue-600">Default Address</div>}
      </div>
      <p>Block {`${address.block_no} ${address.street}`}</p>
      <p>{`${address.unit_no ? address.unit_no :""} ${address.building ? address.building :""}`}</p>
      <p>Singapore {`${address.postal_code}`}</p>
      <div className="flex justify-end mt-4">
        <Button className="mr-2 bg-red-500 text-white hover:bg-red-700" onClick={() => deleteAddress(address.address_id)}>
          Delete
        </Button>
        <Button
          className="bg-black text-white"
          onClick={() => {
            openEditModal(address.address_id);
            setAddMode(false);
            getAddress(address.address_id);
          }}
        >
          Edit
        </Button>
      </div>
    </>
  );
  
  const defaultAddress = addresses.find((address) => address.is_default);

  return (
    <div className="container mx-auto pb-8">
      <div className="grid grid-cols-4 gap-8">
        <div className="col-span-3">
          <div className=" p-4 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">MY ADDRESS BOOK</h2>
            <Button
              className="mb-4"
              variant="bordered"
              onClick={() => {
                onOpen();
                setAddMode(true);
              }}
            >
              + ADD NEW ADDRESS
            </Button>

            {defaultAddress && <div className="border p-4 rounded-lg mb-4">{renderAddress(defaultAddress)}</div>}

            {addresses
              .filter((address) => !address.is_default)
              .map((address) => (
                <div key={address.address_id} className="border p-4 rounded-lg mb-4">
                  {renderAddress(address)}
                </div>
              ))}
                </div>
              </div>
            </div>
            
      {isOpen && (
        <>
          <Modal size="4xl" isOpen={isOpen} onOpenChange={onOpenChange} backdrop="blur" scrollBehavior="inside">
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader>Shipping Address</ModalHeader>
                  <ModalBody>
                    <form className="space-y-4 my-8">
                      <div className="flex flex-col">
                        <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} label="Location*" placeholder="Singapore" isReadOnly />
                      </div>
                      <div className="flex flex-col">
                        <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} value={fullname} onChange={(e) => setfullName(e.target.value)} label="Full Name*" />
                      </div>
                      <div className="flex">
                        <div className="flex flex-col">
                          <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 w-24 rounded-md rounded-none" }} placeholder="SG +65" isReadOnly />
                        </div>
                        <div className="flex flex-col w-full">
                          <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 w-full rounded-none" }} value={phone} onChange={(e) => setPhone(e.target.value)} label="Phone Number*" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} value={postal_code} onChange={(e) => setPostal_code(e.target.value)} label="Postal Code*" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                          <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} value={block_no} onChange={(e) => setBlock(e.target.value)} label="Block*" />
                        </div>
                        <div className="flex flex-col">
                          <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} value={street} onChange={(e) => setStreet(e.target.value)} label="Street Name*" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col">
                        <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} value={building} onChange={(e) => setBuilding(e.target.value)} label="Building Name(Optional)" />
                      </div>
                      <div className="flex flex-col">
                        <Input classNames={{ inputWrapper: "bg-white border-grey border-1 dark:bg-white dark:border-black dark:border-2 rounded-none" }} value={unit_no} onChange={(e) => setUnit_no(e.target.value)} label="Unit No.(Optional)" />
                      </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          
                          <input className = "ml-1" type="checkbox" id="makeDefault" checked={is_default} onChange={(e) => setDefault(e.target.checked)} />
                          <label className="font-medium">Make Default</label>
                        </div>
                        <div className="flex space-x-2 ">
                          <Link className="text-blue-600 hover:underline" href="#">
                            Privacy & Cookie Policy
                          </Link>
                        </div>
                      </div>
                      <div className="flex items-center" style={{ marginTop: "3xrem" }}>
                        <ShieldCheckIcon className="w-6 h-6 text-green-600 mr-3" />
                        <p className="text-sm text-green-600">Security & Privacy</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">We maintain industry-standard physical, technical, and administrative measures to safeguard your personal information.</p>
                      <div className="flex justify-center">
                        <Button className="w-52 h-10 bg-black dark:bg-white text-white dark:text-black rounded-none text-lg" onClick={addOrEditAddress}>
                          {isAddMode ? "Save" : "Edit"}
                        </Button>
                      </div>
                    </form>
                  </ModalBody>
                </>
              )}
            </ModalContent>
          </Modal>
        </>
      )}
    </div>
  );
}

function ShieldCheckIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function XIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
