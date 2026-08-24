"use client";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";

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

export default function AddressBookPage() {
    const { setCurrentActivePage } = useAppState();
    const [fullname, setFullname] = useState("");
    const [phone, setPhone] = useState("");
    const [block_no, setBlock] = useState("");
    const [postal_code, setPostalCode] = useState("");
    const [street, setStreet] = useState("");
    const [building, setBuilding] = useState("");
    const [unit_no, setUnitNo] = useState("");
    const [is_default, setIsDefault] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isAddMode, setIsAddMode] = useState(true);
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.AddressBook);
        fetchAddresses();
    }, [setCurrentActivePage]);

    const clearForm = () => {
        setFullname("");
        setPhone("");
        setPostalCode("");
        setBlock("");
        setStreet("");
        setBuilding("");
        setUnitNo("");
        setIsDefault(false);
        setFormError("");
        setSelectedAddress(null);
    };

    const handleClose = () => {
        clearForm();
        onClose();
    };

    const fetchAddresses = () => {
        fetch(`${process.env.BACKEND_URL}/api/getAllAddresses`, {
            method: "GET",
            credentials: "include",
        })
            .then((r) => r.json())
            .then((data) => setAddresses(data.addresses || []))
            .catch(console.error);
    };

    const openAdd = () => {
        clearForm();
        setIsAddMode(true);
        onOpen();
    };

    const openEdit = (address: Address) => {
        setIsAddMode(false);
        setSelectedAddress(address);
        setFullname(address.fullname);
        setPhone(address.phone);
        setPostalCode(address.postal_code);
        setBlock(String(address.block_no));
        setStreet(address.street);
        setBuilding(address.building || "");
        setUnitNo(address.unit_no || "");
        setIsDefault(address.is_default);
        setFormError("");
        onOpen();
    };

    const validate = () => {
        if (!fullname.trim() || !phone.trim() || !postal_code.trim() || !street.trim() || !block_no.trim()) {
            setFormError("Please fill in all required fields.");
            return false;
        }
        if (!/^\d{6}$/.test(postal_code)) {
            setFormError("Postal code must be exactly 6 digits.");
            return false;
        }
        if (isNaN(parseInt(block_no))) {
            setFormError("Block number must be a number.");
            return false;
        }
        return true;
    };

    const saveAddress = () => {
        if (!validate()) return;
        if (isAddMode && addresses.length >= 4) {
            setFormError("You can only save up to 4 addresses.");
            return;
        }

        setIsSubmitting(true);
        setFormError("");

        const payload = { fullname, phone, postal_code, block_no, street, building, unit_no, is_default };
        const url = isAddMode
            ? `${process.env.BACKEND_URL}/api/addAddress`
            : `${process.env.BACKEND_URL}/api/editAddress`;
        const method = isAddMode ? "POST" : "PUT";
        const body = isAddMode ? payload : { ...payload, address_id: selectedAddress?.address_id };

        fetch(url, {
            method,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        })
            .then((r) => r.json())
            .then((data) => {
                if (data.error) {
                    setFormError(data.error);
                    return;
                }
                handleClose();
                fetchAddresses();
            })
            .catch(() => setFormError("Something went wrong. Please try again."))
            .finally(() => setIsSubmitting(false));
    };

    const deleteAddress = (address_id: number) => {
        setIsDeleting(address_id);
        fetch(`${process.env.BACKEND_URL}/api/deleteAddress`, {
            method: "DELETE",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ address_id }),
        })
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then(() => fetchAddresses())
            .catch(console.error)
            .finally(() => setIsDeleting(null));
    };

    return (
        <div className="w-full pb-8">
            {/* Header */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Account</p>
                        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Address Book</h1>
                        <p className="mt-2 text-sm text-slate-500">Save up to 4 delivery addresses for faster checkout.</p>
                    </div>
                    <button
                        type="button"
                        onClick={openAdd}
                        disabled={addresses.length >= 4}
                        className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <Plus className="h-4 w-4" />
                        Add Address
                    </button>
                </div>

                <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                        {addresses.length} / 4 saved
                    </span>
                </div>
            </section>

            {/* Address list */}
            {addresses.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                        <MapPin className="h-6 w-6 text-slate-400" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-slate-900">No addresses saved</h3>
                    <p className="mt-2 text-sm text-slate-500">Add your first delivery address to speed up checkout.</p>
                    <button
                        type="button"
                        onClick={openAdd}
                        className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-slate-900 px-5 text-sm font-semibold text-white"
                    >
                        <Plus className="h-4 w-4" />
                        Add Address
                    </button>
                </div>
            ) : (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {[...addresses].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0)).map((address) => (
                        <div
                            key={address.address_id}
                            className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${address.is_default ? "border-slate-900" : "border-slate-200"}`}
                        >
                            <div className={`flex items-center justify-between border-b px-5 py-3 ${address.is_default ? "border-slate-200 bg-slate-900" : "border-slate-100 bg-slate-50"}`}>
                                <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${address.is_default ? "text-slate-300" : "text-slate-400"}`}>
                                    {address.is_default ? "Default Address" : "Saved Address"}
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(address)}
                                        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${address.is_default ? "text-slate-300 hover:bg-white/10 hover:text-white" : "text-slate-400 hover:bg-white hover:text-slate-900"}`}
                                    >
                                        <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => deleteAddress(address.address_id)}
                                        disabled={isDeleting === address.address_id}
                                        className={`flex h-8 w-8 items-center justify-center rounded-full transition ${address.is_default ? "text-red-300 hover:bg-white/10 hover:text-red-400" : "text-slate-400 hover:bg-red-50 hover:text-red-500"}`}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-5">
                                <p className="font-semibold text-slate-900">{address.fullname}</p>
                                <p className="mt-0.5 text-sm text-slate-500">{address.phone}</p>
                                <div className="mt-3 space-y-1 text-sm text-slate-600">
                                    <p>Blk {address.block_no}, {address.street}</p>
                                    {(address.unit_no || address.building) && (
                                        <p>{[address.unit_no, address.building].filter(Boolean).join(", ")}</p>
                                    )}
                                    <p>Singapore {address.postal_code}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            <Modal size="lg" isOpen={isOpen} onClose={handleClose} scrollBehavior="inside">
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="border-b border-slate-100">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{isAddMode ? "New" : "Edit"}</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">{isAddMode ? "Add Address" : "Edit Address"}</p>
                                </div>
                            </ModalHeader>

                            <ModalBody className="py-5">
                                <div className="space-y-4">
                                    {formError && (
                                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                            {formError}
                                        </div>
                                    )}

                                    {[
                                        { label: "Full Name *", value: fullname, onChange: setFullname, placeholder: "e.g. John Tan" },
                                        { label: "Phone Number *", value: phone, onChange: setPhone, placeholder: "e.g. 91234567" },
                                        { label: "Postal Code *", value: postal_code, onChange: setPostalCode, placeholder: "6-digit postal code" },
                                        { label: "Block No. *", value: block_no, onChange: setBlock, placeholder: "e.g. 123" },
                                        { label: "Street Name *", value: street, onChange: setStreet, placeholder: "e.g. Orchard Road" },
                                        { label: "Building Name (Optional)", value: building, onChange: setBuilding, placeholder: "e.g. The Atrium" },
                                        { label: "Unit No. (Optional)", value: unit_no, onChange: setUnitNo, placeholder: "e.g. #08-08" },
                                    ].map((field) => (
                                        <label key={field.label} className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                                            {field.label}
                                            <input
                                                type="text"
                                                value={field.value}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                placeholder={field.placeholder}
                                                className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                            />
                                        </label>
                                    ))}

                                    <label className="flex cursor-pointer items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={is_default}
                                            onChange={(e) => setIsDefault(e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                                        />
                                        <span className="text-sm font-medium text-slate-700">Set as default address</span>
                                    </label>
                                </div>
                            </ModalBody>

                            <ModalFooter className="border-t border-slate-100">
                                <Button
                                    className="rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700"
                                    onClick={handleClose}
                                    isDisabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="rounded-full bg-slate-900 text-sm font-semibold text-white"
                                    onClick={saveAddress}
                                    isDisabled={isSubmitting}
                                >
                                    {isSubmitting ? "Saving…" : isAddMode ? "Save Address" : "Update Address"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
