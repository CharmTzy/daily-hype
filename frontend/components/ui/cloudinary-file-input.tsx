"use client";

import { ChangeEvent, useEffect, useRef } from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Image from "next/image";
import clsx from "clsx";
import { useAppState } from "@/app/app-provider";
import { SuccessMessage } from "@/enums/global-enums";

interface IUploadedImages {
  imageid: string;
  imagename: string;
  url: string;
}

interface IFileInputProps {
  limit: number;
  className?: string;
  uploadedImages: IUploadedImages[];
  setUploadedImages: React.Dispatch<React.SetStateAction<IUploadedImages[]>>;
}

export default function CloudinaryFileInput({ limit, className, uploadedImages, setUploadedImages }: IFileInputProps) {
  const { userInfo } = useAppState();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const images = Array.from(event.target.files);

      if (images.length + uploadedImages.length > limit) {
        alert("You cannot upload more than " + limit + " images!");
      } else {
        const formData = new FormData();

        images.forEach((image) => {
          formData.append("image", image);
        });

        fetch(`${process.env.BACKEND_URL}/api/image/upload/multiple/cloudinary/1200/1200`, {
          method: "POST",
          body: formData,
          credentials: "include",
        })
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
            if (result.message === "Upload Success") {
              let newFiles = [...uploadedImages];
              result.images.forEach((item: IUploadedImages) => {
                newFiles.push(item);
              });
              setUploadedImages(newFiles);

              if (fileRef.current) {
                fileRef.current.value = "";
              }
            }
          })
          .catch((error) => {
            console.error(error);
            alert("Error in uploading images!");
          });
      }
    }
  };

  const handleDelete = (index: number) => {
    fetch(`${process.env.BACKEND_URL}/api/image/upload/cloudinary/${uploadedImages[index].imageid}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.message === "Delete Success") {
          setUploadedImages((prev) => prev.filter((item, i) => i !== index));
        } else {
          alert("Error in deleting images!");
        }
      })
      .catch((error) => {
        console.error(error);
        alert("Error in deleting images!");
      });
  };

  const handleClick = () => {
    if (fileRef.current) fileRef.current.click();
  };

  return (
    <>
      <input className="hidden" multiple ref={fileRef} type="file" accept="image/*" onChange={handleUpload} />
      <div className="flex max-w-full">
        {uploadedImages.map((item, index) => (
          <div key={index} className="flex mr-2 cursor-pointer relative flex-col items-center w-[100px] h-[100px] max-w-[100px] max-h-[100px] border-1 border-slate-700 dark:border-slate-300 border-dotted p-4">
            {userInfo != null && <Image fill={true} src={item.url} alt={item.imagename} />}
            <div onClick={() => handleDelete(index)} className={clsx("absolute cursor-pointer -right-2 -top-2 px-[7px] bg-[#eee] dark:bg-[#111] rounded-full border-1 border-slate-700 dark:border-slate-300", className)}>
              <label className="cursor-pointer select-none">x</label>
            </div>
          </div>
        ))}

        {uploadedImages.length < limit && (
          <div className="flex cursor-pointer h-[100px] w-[100px] justify-center flex-col items-center max-w-[100px] max-h-[100px] border-1 border-slate-700 dark:border-slate-300 border-dotted p-4" title="Upload Photo" onClick={handleClick}>
            <CameraAltIcon className="dark:text-slate-300 text-slate-700 cursor-pointer" />
            <label className="text-[13px] mt-2 dark:text-slate-300 text-slate-700 cursor-pointer">Add Photo</label>
          </div>
        )}
      </div>
    </>
  );
}
