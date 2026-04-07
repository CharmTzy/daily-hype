"use client";

import { CurrentActivePage, URL } from "@/enums/global-enums";
import { useAppState } from "@/app/app-provider";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Input, Button, user } from "@nextui-org/react";
import UserIcon from "@/icons/user-icon";
import { Router } from "react-router-dom";

interface UserData {
  email: string;
  name: string;
  phone: string;
  gender: string;
  url: string;
}

export default function Profile() {
  const { setCurrentActivePage, setUserInfo } = useAppState();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    email: "",
    name: "",
    phone: "",
    gender: "",
    url: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | string>("http://ssl.gstatic.com/accounts/ui/avatar_2x.png");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password,setPassword] = useState("");
  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.Profile);
  }, []);

  useEffect(() => {
    console.log("LOADING: " + loading);
    if (loading) {
      fetchUserProfile();
    }
  }, [loading]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    const file = event.target.files?.[0];

    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string | null;
        if (result) {
          setSelectedImage(result);
        }
      };

      reader.readAsDataURL(file);
      setFile(file);
    }
  };

  const handleSave = (userData: UserData, file: File | null) => {
    const formData = new FormData();

    if (file) {
      formData.append("photo", file, file.name);
    }
    formData.append("email", userData.email);
    formData.append("name", userData.name);
    formData.append("phone", userData.phone);
    formData.append("gender", userData.gender);

    console.log("formData details:");
    formData.forEach((value, key) => {
      console.log(key, value);
    });

    const uploadPhotoPromise = file
      ? fetch(`${process.env.BACKEND_URL}/api/upload-photo`, {
          method: "POST",
          credentials: "include",
          body: formData,
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`Photo Upload failed with status ${response.status}`);
          } else {
            setTimeout(() => {
              window.location.reload();
              alert("Profile Updated successful");
            }, 5000);
          }
          return response.json();
        })
      : Promise.resolve(null);

    const updateUserPromise = fetch(`${process.env.BACKEND_URL}/api/update-profile`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        phone: userData.phone,
        gender: userData.gender,
      }),
    }).then((response) => {
      if (!response.ok) {
        throw new Error(`Update Profile failed with status ${response.status}`);
      } else {
        setTimeout(() => {
          window.location.reload();
          alert("Profile Updated Successful");
        }, 5000);
      }
      return response.json();
    });
  };

  const handleReset = () => {
    window.location.reload();
  };

  const handleDeleteAccount = () => {
    console.log("Delete Account button clicked");
    // Open the modal box
    setIsModalOpen(true);
  };

  const handleConfirmDelete = (password: string) => {
    fetch(`${process.env.BACKEND_URL}/api/deleteAccount`,{
      method:'PUT',
      credentials:'include',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password
      })

    }).then((response) =>{
      if(response.status === 403){
        throw new Error("Unauthorized Access");
      }
      alert("Delete account successfully");
      router.push(URL.SignOut);
    })
    setIsModalOpen(false);
  };

  const handleCancelDelete = () => {
    // Cancel deletion and close the modal box
    setIsModalOpen(false);
  };

  const fetchUserProfile = () => {
    fetch(`${process.env.BACKEND_URL}/api/profile`, {
      method: "GET",
      credentials: "include",
    })
      .then((response) => {
        if (response.status === 403) {
          throw new Error("Unauthorized Access");
        }
        return response.json();
      })
      .then((userData) => {
        console.log("User Profile Data:", userData);
        setUserData(userData);
        if (userData.url) {
          setSelectedImage(userData.url);
          setUserInfo((prev) => {
            if (prev) {
              const newObj = { ...prev };
              newObj.image = userData.url;
              localStorage.setItem("user", JSON.stringify(newObj));
              return newObj;
            } else {
              return null;
            }
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching user profile data:", error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClick = () => {
    if (fileRef.current) fileRef.current.click();
  };

  return (
    <div className="container mx-auto mb-8 p-4">
      <div className="flex">
        <div className="w-1/4 p-4">
          <div className="text-center mb-4">
            <Image src={typeof selectedImage === "string" ? selectedImage : window.URL.createObjectURL(selectedImage)} className="rounded-full border-2 cursor-pointer border-gray-300" alt="avatar" width={200} height={200} style={{ width: "200px", height: "200px" }} onClick={handleClick} />
            <br />
            <input type="file" ref={fileRef} className="text-center hidden center-block file-upload" id="photoInput" accept="image/*" onChange={handleFileChange} />
          </div>
        </div>

        <div className="w-3/4 p-4">
          <h2>Your Information</h2>
          <hr className="my-4" />
          <form className="form">
            <div className="form-group">
              <div className="col-xs-6">
                <label htmlFor="name"></label>
                <Input isRequired type="email" label="Email" value={userData.email} onChange={(e) => setUserData({ ...userData, email: e.target.value })} className="max-w-xs mb-8" />

                <Input isRequired type="name" label="Name" value={userData.name} onChange={(e) => setUserData({ ...userData, name: e.target.value })} className="max-w-xs mb-8" />
                <Input isRequired type="phone" label="Phone" value={userData.phone} onChange={(e) => setUserData({ ...userData, phone: e.target.value })} className="max-w-xs mb-8" />

                <div className="mb-12">
                  <div className="flex items-center space-x-4 text-black dark:text-white">
                    <label className="flex items-center">
                      <input type="radio" id="male" name="gender" value="M" onChange={(e) => setUserData({ ...userData, gender: e.target.value })} checked={userData.gender === "M"} className="form-radio text-white" />
                      <span className="ml-2">Male</span>
                    </label>

                    <label className="flex items-center">
                      <input type="radio" id="female" name="gender" value="F" onChange={(e) => setUserData({ ...userData, gender: e.target.value })} checked={userData.gender === "F"} className="form-radio text-white" />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Button onClick={() => handleSave(userData, file)} className="mr-4" color="success">
                Save
              </Button>
              <Button onClick={handleReset} className="mr-4">
                Reset
              </Button>
              <div className="flex-grow" />
              <Button onClick={handleDeleteAccount} color="danger" variant="bordered" startContent={<UserIcon />} className="ml-4">
                Delete user
              </Button>
            </div>
            {isModalOpen && (
                <div className="fixed z-10 inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Confirm Account Deletion</h2>
                    <p className="mb-4">Please enter your password to confirm deletion:</p>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border rounded-md px-3 py-2 mb-4" required/>
                    <div className="flex justify-end">
                      <Button onClick={handleCancelDelete} className="mr-2">
                        Cancel
                      </Button>
                      <Button onClick={() => handleConfirmDelete(password)} color="danger">
                        Confirm Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
      
          </form>
        </div>
      </div>
    </div>
  );
}
