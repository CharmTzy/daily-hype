// Name: Wai Yan Aung
// Admin No: 2234993
// Class: DIT/FT/2B/02

"use client";

import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { useEffect, useState } from "react";
import { getAdminUser, getAdminUserCount, handleDeleteButton } from "@/functions/user-functions";
import { formatDateByMonthDayYear24Hour } from "@/functions/formatter";

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import CustomTable from "@/components/ui/table";
import { useAppState } from "@/app/app-provider";
import Image from "next/image";

const columns = ["User ID", "Profile Pic", "Email", "Customer Name", "Phone", "Account Created Time", "Default Address", "Default Region", "Role", "Status", "Action"];

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [userData, setUserData] = useState<[string, ...React.ReactNode[]][]>([]);
  const [userCount, setUserCount] = useState<number>(1);
  const [pageNo, setPageNo] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const router = useRouter();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.UserList);
    Promise.all([getAdminUserCount(), getAdminUser(0, limit)]).then(([result1, result2]) => {
      if (result1.error) {
        console.error(result1.error);
        if (result1.error === ErrorMessage.UNAURHOTIZED) {
          alert(ErrorMessage.UNAURHOTIZED);
          router.push(URL.SignOut);
        }
      } else {
        const data = result1.data || 1;
        setUserCount(data);
        if (result2.error) {
        } else {
          const data = result2.data || [];
          setUserData(
            data.map((item, index) => {
              return [
                item.userid.toString(),
                <Image key={index} className="mx-auto" src={item.url ? item.url : "http://ssl.gstatic.com/accounts/ui/avatar_2x.png"} width={60} height={80} alt={item.name} />,
                <label key={index} className="text-[14px] flex justify-center text-center">
                  {item.email}
                </label>,
                <label key={index} className="text-[14px] flex justify-center text-center">
                  {item.name}
                </label>,
                <label key={index} className="text-[14px] flex justify-center">
                  {item.phone}
                </label>,
                <label key={index} className="text-[14px] flex justify-center text-center">
                  {formatDateByMonthDayYear24Hour(item.createdat)}
                </label>,
                <label key={index} className="text-[14px] flex justify-center text-center">
                  {item.postal_code}
                </label>,
                <label key={index} className="text-[14px] flex justify-center text-center">
                  {item.region}
                </label>,
                <label key={index} className="text-[14px] flex justify-center text-center">
                  {item.status}
                </label>,
                <label key={index} className="text-[14px] flex justify-center text-center capitalize">
                  {item.rolename}
                </label>,
                <div className="flex flex-col" key={index}>
                  <Button color="primary" className="mb-2" size="sm" onClick={() => {handleUpdateButton(item.userid)}}>
                    Update
                  </Button>

                  <Button color="danger" size="sm" onClick={() => handleDeleteButton(item.userid)}>
                    Delete
                  </Button>
                </div>,
              ];
            })
          );
        }
      }
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
  }, [pageNo]);

  useEffect(() => {
    setPageNo(0);
    setIsLoading(true);
  }, [limit]);

  useEffect(() => {
    if (isLoading) {
      getAdminUser(pageNo, limit).then((result) => {
        const data = result.data || [];
        console.log(data);
        setUserData(
          data.map((item, index) => {
            return [
              item.userid.toString(),
              <Image key={index} className="mx-auto" src={item.url ? item.url : "http://ssl.gstatic.com/accounts/ui/avatar_2x.png"} width={60} height={80} alt={item.name} />,
              <label key={index} className="text-[14px] flex justify-center text-center">
                {item.email}
              </label>,
              <label key={index} className="text-[14px] flex justify-center text-center">
                {item.name}
              </label>,
              <label key={index} className="text-[14px] flex justify-center">
                {item.phone}
              </label>,
              <label key={index} className="text-[14px] flex justify-center text-center">
                {formatDateByMonthDayYear24Hour(item.createdat)}
              </label>,
              <label key={index} className="text-[14px] flex justify-center text-center">
                {item.building} {item.street} {item.unit_no} {item.postal_code}
              </label>,
              <label key={index} className="text-[14px] flex justify-center text-center">
                {item.region}
              </label>,
              <label key={index} className="text-[14px] flex justify-center text-center capitalize">
                {item.rolename}
              </label>,
              <label key={index} className="text-[14px] flex justify-center text-center">
                {item.status}
              </label>,
              <div className="flex flex-col" key={index}>
                <Button color="primary" className="mb-2" size="sm" onClick={() => {handleUpdateButton(item.userid)}}>
                  Update
                </Button>
                <Button color="danger" size="sm" onClick={()=> {handleDeleteButton(item.userid); window.location.reload()}}>
                  Delete
                </Button>
              </div>,
            ];
          })
        );
        setIsLoading(false);
      });
    }
  }, [isLoading]);

  const handleRowClick = (userID: string) => {
    onOpen();
  };

  const handleUpdateButton = (userID:string) => {
    router.push(`/list/user-update?userId=${userID}`);
  }
  return (
    <>
      <div className="w-full max-w-full px-4 py-2">
        <div className="py-5">
          <label className="text-large font-semibold">User List</label>
        </div>
        <div className="mb-5">
          <CustomTable columns={columns} onClick={(clickedValue) => handleRowClick(clickedValue)} rows={userData} setRowsPerPage={setLimit} page={pageNo} setPage={setPageNo} totalCount={userCount} />
        </div>
      </div>

      {isOpen && (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onCloseModal) => (
              <>
                <ModalHeader className="flex flex-col gap-1">Modal Title</ModalHeader>
                <ModalBody>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam pulvinar risus non risus hendrerit venenatis. Pellentesque sit amet hendrerit risus, sed porttitor quam.</p>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onCloseModal}>
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
