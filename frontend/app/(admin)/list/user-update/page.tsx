"use client"
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { Input, Button, Link, Dropdown,DropdownTrigger,DropdownMenu,DropdownItem, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure} from "@nextui-org/react";
import { JSX, SVGProps, useEffect, useState } from "react";
import { useAppState } from "@/app/app-provider";
import { useRouter, useSearchParams } from "next/navigation";

interface Address {
  address_id: string;
  block_no: string;
  building: string;
  fullname: string;
  is_default: boolean;
  phone: string;
  postal_code: string;
  region: string;
  street: string;
  unit_no: string;
  userid: string;
}
export default function Component() {
    const { setCurrentActivePage } = useAppState();
    const roles = ["customer", "admin", "manager"];
    const [selectedRole,setSelectedRole] = useState("");
    const [userId, setUserId] = useState("");
    const [userData, setUserData] = useState({
        userId: "",
        email: "",
        name: "",
        phone: "",
        gender: "",
        role: "",
        status: ""
    });
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [fullname, setfullName] = useState("");
    const [phone, setPhone] = useState("");
    const [block_no, setBlock] = useState("");
    const [postal_code, setPostal_code] = useState("");
    const [street, setStreet] = useState("");
    const [building, setBuilding] = useState("");
    const [unit_no, setUnit_no] = useState("");
    const [region, setRegion] = useState("");
    const [is_default, setDefault] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isAddMode, setAddMode] = useState(true);
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
    const router = useRouter();
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.UserList);
        const urlParams = new URLSearchParams(window.location.search);
        const userIdParam = urlParams.get("userId");
        if (userIdParam) {
            setUserId(userIdParam);
            fetchUserData(userIdParam);
          }
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

    
    const fetchUserData = (userId: string) => {
        // Fetch user data from backend using userId
        fetch(`${process.env.BACKEND_URL}/api/user/${userId}`,{
            method:"GET",
            credentials:"include"
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error("Failed to fetch user data");
            }
            return response.json();
          })
          .then((data) => {
            console.log(data);
            setUserData(data);
            setAddresses(data.addresses);
            setSelectedRole(data.role);
            console.log(data.addresses);
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
      };

      const handleBack = () =>{
        router.push("/list/user");
      }
      const handleUpdate = () => {
        console.log(userData.status);
        fetch(`${process.env.BACKEND_URL}/api/user/${userId}`, {
          method: "PUT",
          credentials:"include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({userData: userData}),
        })
          .then((response) => {
            if (!response.ok) {
              console.log(response);
              throw new Error("Failed to update user data");
            }
            return response.json();
          })
          .then((updatedUserData) => {
            setUserData(updatedUserData);
            console.log("User data updated successfully:", updatedUserData);
            alert("User updated successfully");
            router.push("/list/user");
          })
          .catch((error) => {
            console.error("Error updating user data:", error);
          });
      };
     
      const handleRoleChange = (value: string) => {
        setUserData(prevUserData => ({
            ...prevUserData,
            role: value
        }));
        setSelectedRole(value);
    };
    
      const statusOptions = ["active", "deleted"];

      const handleStatusChange = (status: string) => {
        // Update the status in the userData state
        setUserData((prevUserData) => ({
          ...prevUserData,
          status: status,
        }));
      };
      
      const addAddress = (userid: string) => {
        console.log(userid);
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
    
        fetch(`${process.env.BACKEND_URL}/api/addAddressAdmin`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fullname, phone, postal_code, block_no, street, building, unit_no, region, is_default,userid }),
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
            fetchUserData(userId);
          })
          .catch((error) => {
            console.error("Error adding address:", error);
    
            alert("Failed to add address. Please try again.");
          });
      };

      
      const deleteAddress = (address_id: string, userid: string) => {
        fetch(`${process.env.BACKEND_URL}/api/deleteAddressAdmin`, {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address_id,userid }),
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


  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-6">Update User Information</h1>
        <div className="space-y-6">
          <div className="p-4 bg-blue-100 rounded">
            <h2 className="text-lg font-medium mb-4">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
              <Input type="email" label="Email" value={userData.email} isReadOnly /> 
              <Input type="name" label="Name" value={userData.name} onChange = {(e)=> setUserData({ ...userData, name: e.target.value })} />
              <Input type="phone" label="Phone" value={userData.phone} onChange = {(e)=> setUserData({ ...userData, phone: e.target.value })}/>
              <div className="mt-4">
                  <div className="flex items-center justify-center space-x-4 text-white">
                  <label className="flex items-center">
                        <input 
                            type="radio" 
                            id="male" 
                            name="gender" 
                            value="M" 
                            checked={userData.gender === "M"} 
                            onChange={(e) => setUserData({ ...userData, gender: e.target.value })} 
                            className="form-radio text-black" 
                        />
                        <span className="ml-2 text-black">Male</span>
                        </label>

                        <label className="flex">
                        <input 
                            type="radio" 
                            id="female" 
                            name="gender" 
                            value="F" 
                            checked={userData.gender === "F"} 
                            onChange={(e) => setUserData({ ...userData, gender: e.target.value })} 
                            className="form-radio text-black" 
                        />
                        <span className="ml-2 text-black">Female</span>
                        </label>

                  </div>
                </div>
              <div className="space-y-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">
                      Role: {selectedRole}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Role Selection">
                    {roles.map((role) => (
                      <DropdownItem key={role} onClick={() => handleRoleChange(role)}>
                        {role}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </div>
          <div className="p-4 bg-blue-100 rounded">
            <h2 className="text-lg font-medium mb-4">Account Details</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                <label className="font-medium">Status</label>
                <Dropdown>
                    <DropdownTrigger>
                    <Button variant="bordered">
                        {userData.status}
                    </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Status Selection">
                    {statusOptions.map((status) => (
                        <DropdownItem key={status} onClick={() => handleStatusChange(status)}>
                        {status}
                        </DropdownItem>
                    ))}
                    </DropdownMenu>
                </Dropdown>
                </div>
            </div>
            </div>

            <div className="p-4 bg-blue-100 rounded">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Address Book</h2>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-md hover:bg-blue-600" onClick={onOpen}>
                  Add Address
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {addresses.map((address) => (
                  <div key={address.address_id} className="relative p-4 bg-white rounded shadow">
                    <button className="absolute top-2 right-2 text-gray-500" onClick={()=>deleteAddress(address.address_id,address.userid)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <p className="mt-2 font-semibold">{address.fullname} {address.phone}</p>
                    <p>Block {address.block_no} {address.street} <span className="truncate">{address.building}</span></p>
                    <p>Postal Code: {address.postal_code}</p>
                    <p>{address.unit_no} {address.region}</p>
                    <p>Default: {address.is_default ? "Yes" : "No"}</p>
                  </div>
                ))}
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
                        <Button className="w-52 h-10 bg-black dark:bg-white text-white dark:text-black rounded-none text-lg" onClick={()=>addAddress(userData.userId)}>
                          Save
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
            
          <div className="flex justify-between">
            <Button variant="bordered" onClick={handleBack}>Back</Button>
            
            <Button color="primary" onClick={handleUpdate}>Update</Button>
           
          </div>
        </div>
      </div>
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