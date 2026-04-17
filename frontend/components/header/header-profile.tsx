"use client";
import { URL } from "@/enums/global-enums";
import { IUserInfo } from "@/enums/global-interfaces";
import { DEFAULT_PROFILE_IMAGE, normaliseProfileImage } from "@/functions/profile-image";
import ResilientImage from "@/components/ui/resilient-image";
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { useRouter } from "next/navigation";
export default function HeaderProfile({ userInfo }: {
    userInfo: IUserInfo | null;
}) {
    const router = useRouter();
    const profileImage = normaliseProfileImage(userInfo?.image);
    return (<>
      {userInfo !== null && (<Dropdown placement="bottom-end" className="select-none">
          <DropdownTrigger>
            <div className="w-9 h-9 transition-transform border-2 border-gray-400 select-none overflow-hidden cursor-pointer rounded-full laptop-3xl:ms-9 laptop-3xl:w-10 laptop-3xl:h-10 laptop-2xl:ms-8 laptop-xl:ms-7">
              <ResilientImage className="w-full h-full object-cover" src={profileImage} fallbackSrc={DEFAULT_PROFILE_IMAGE} width={150} height={150} alt="User Profile Picture"/>
            </div>
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem aria-label="User Information" href={URL.Personal} key="info" className="h-14 gap-2">
              <p className="font-medium">Signed in as</p>
              <p className="font-medium">{userInfo.email}</p>
            </DropdownItem>
            <DropdownItem aria-label="Profile" href={URL.Profile} key="profile">
              Profile
            </DropdownItem>
            <DropdownItem aria-label="Order" href={URL.AllOrder} key="order">
              Order
            </DropdownItem>
            <DropdownItem aria-label="Delivery" href={URL.Delivery} key="delivery">
              Delivery
            </DropdownItem>
            <DropdownItem aria-label="Sign Out" onClick={() => {
                router.push(URL.SignOut);
            }} key="logout" color="danger">
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>)}
    </>);
}
