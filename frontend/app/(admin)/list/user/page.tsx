"use client";
import { useAppState } from "@/app/app-provider";
import CustomTable from "@/components/ui/table";
import { CurrentActivePage, ErrorMessage, URL } from "@/enums/global-enums";
import { formatDateByMonthDayYear24Hour } from "@/functions/formatter";
import { getAdminUser, getAdminUserCount, handleDeleteButton } from "@/functions/user-functions";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
const columns = ["User ID", "Profile Pic", "Email", "Customer Name", "Phone", "Account Created Time", "Default Address", "Default Region", "Role", "Status", "Action"];
interface IAdminUserRow {
    userid: string;
    url: string;
    email: string;
    name: string;
    createdat: string;
    rolename: string;
    phone: string;
    building: string;
    street: string;
    unit_no: string;
    postal_code: string;
    region: string;
    status: string;
}
export default function Page() {
    const { setCurrentActivePage } = useAppState();
    const [users, setUsers] = useState<IAdminUserRow[]>([]);
    const [userData, setUserData] = useState<[
        string,
        ...React.ReactNode[]
    ][]>([]);
    const [userCount, setUserCount] = useState<number>(1);
    const [pageNo, setPageNo] = useState<number>(0);
    const [limit, setLimit] = useState<number>(10);
    const [selectedUser, setSelectedUser] = useState<IAdminUserRow | null>(null);
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const router = useRouter();
    const handleUpdateButton = (userID: string) => {
        router.push(`/list/user-update?userId=${userID}`);
    };
    const formatAddress = (item: IAdminUserRow) => {
        const address = [item.building, item.street, item.unit_no, item.postal_code].filter((value) => value && value.trim() !== "").join(" ");
        return address || "No default address";
    };
    const formatRows = (data: IAdminUserRow[]): [
        string,
        ...React.ReactNode[]
    ][] => {
        return data.map((item, index) => {
            return [
                item.userid.toString(),
                <Image key={`image-${index}`} className="mx-auto" src={item.url ? item.url : "http://ssl.gstatic.com/accounts/ui/avatar_2x.png"} width={60} height={80} alt={item.name}/>,
                <label key={`email-${index}`} className="text-[14px] flex justify-center text-center">
          {item.email}
        </label>,
                <label key={`name-${index}`} className="text-[14px] flex justify-center text-center">
          {item.name}
        </label>,
                <label key={`phone-${index}`} className="text-[14px] flex justify-center">
          {item.phone || "-"}
        </label>,
                <label key={`created-${index}`} className="text-[14px] flex justify-center text-center">
          {formatDateByMonthDayYear24Hour(item.createdat)}
        </label>,
                <label key={`address-${index}`} className="text-[14px] flex justify-center text-center">
          {formatAddress(item)}
        </label>,
                <label key={`region-${index}`} className="text-[14px] flex justify-center text-center">
          {item.region || "-"}
        </label>,
                <label key={`role-${index}`} className="text-[14px] flex justify-center text-center capitalize">
          {item.rolename}
        </label>,
                <label key={`status-${index}`} className="text-[14px] flex justify-center text-center capitalize">
          {item.status}
        </label>,
                <div className="flex flex-col" key={`action-${index}`}>
          <Button color="primary" className="mb-2" size="sm" onClick={(event) => {
                        event.stopPropagation();
                        handleUpdateButton(item.userid);
                    }}>
            Update
          </Button>
          <Button color="danger" size="sm" onClick={(event) => {
                        event.stopPropagation();
                        handleDeleteButton(item.userid).then((result) => {
                            if (result.error) {
                                alert(result.error);
                                return;
                            }
                            void loadUsers(pageNo, limit);
                        });
                    }}>
            Delete
          </Button>
        </div>,
            ] as [
                string,
                ...React.ReactNode[]
            ];
        });
    };
    const loadUsers = useCallback(async (currentPage: number, currentLimit: number) => {
        const [countResult, userResult] = await Promise.all([getAdminUserCount(), getAdminUser(currentPage, currentLimit)]);
        if (countResult.error) {
            console.error(countResult.error);
            if (countResult.error === ErrorMessage.UNAURHOTIZED) {
                alert(ErrorMessage.UNAURHOTIZED);
                router.push(URL.SignOut);
            }
            return;
        }
        if (userResult.error) {
            console.error(userResult.error);
            return;
        }
        const nextUsers = userResult.data || [];
        setUserCount(countResult.data || 1);
        setUsers(nextUsers);
        setUserData(formatRows(nextUsers));
    }, [router, pageNo, limit]);
    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.UserList);
    }, [setCurrentActivePage]);
    useEffect(() => {
        void loadUsers(pageNo, limit);
    }, [pageNo, limit, loadUsers]);
    return (<>
      <div className="w-full max-w-full px-4 py-2">
        <div className="py-5">
          <label className="text-large font-semibold">User List</label>
        </div>
        <div className="mb-5">
          <CustomTable columns={columns} onClick={(clickedValue) => {
            const clickedUser = users.find((item) => item.userid.toString() === clickedValue);
            if (clickedUser) {
                setSelectedUser(clickedUser);
                onOpen();
            }
        }} rows={userData} setRowsPerPage={setLimit} page={pageNo} setPage={setPageNo} totalCount={userCount}/>
        </div>
      </div>

      {selectedUser && (<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            {(onCloseModal) => (<>
                <ModalHeader className="flex flex-col gap-1">User Summary</ModalHeader>
                <ModalBody>
                  <div className="space-y-3 text-sm text-slate-700">
                    <div>
                      <p className="font-semibold text-slate-900">{selectedUser.name}</p>
                      <p>{selectedUser.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-slate-500">Role</p>
                        <p className="capitalize">{selectedUser.rolename}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Status</p>
                        <p className="capitalize">{selectedUser.status}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Phone</p>
                        <p>{selectedUser.phone || "-"}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Region</p>
                        <p>{selectedUser.region || "-"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-500">Default Address</p>
                      <p>{formatAddress(selectedUser)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Created</p>
                      <p>{formatDateByMonthDayYear24Hour(selectedUser.createdat)}</p>
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onCloseModal}>
                    Close
                  </Button>
                  <Button color="primary" onPress={() => {
                    onCloseModal();
                    handleUpdateButton(selectedUser.userid);
                }}>
                    Update user
                  </Button>
                </ModalFooter>
              </>)}
          </ModalContent>
        </Modal>)}
    </>);
}

