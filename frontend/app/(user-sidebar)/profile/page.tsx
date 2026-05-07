"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import ResilientImage from "@/components/ui/resilient-image";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { DEFAULT_PROFILE_IMAGE, normaliseProfileImage } from "@/functions/profile-image";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { Camera } from "lucide-react";

interface UserData {
    email: string;
    name: string;
    phone: string;
    gender: string;
    url: string;
}

export default function ProfilePage() {
    const { setCurrentActivePage, setUserInfo } = useAppState();
    const router = useRouter();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const { isOpen: isDeleteOpen, onOpen: openDelete, onClose: closeDelete } = useDisclosure();

    const [userData, setUserData] = useState<UserData>({ email: "", name: "", phone: "", gender: "", url: "" });
    const [selectedImage, setSelectedImage] = useState<string>(DEFAULT_PROFILE_IMAGE);
    const [file, setFile] = useState<File | null>(null);
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        setCurrentActivePage(CurrentActivePage.Profile);
    }, [setCurrentActivePage]);

    useEffect(() => {
        fetch(`${process.env.BACKEND_URL}/api/profile`, { method: "GET", credentials: "include" })
            .then((r) => { if (r.status === 403) throw new Error("Unauthorized"); return r.json(); })
            .then((data) => {
                setUserData(data);
                const img = normaliseProfileImage(data.url);
                setSelectedImage(img);
                setUserInfo((prev) => {
                    if (!prev) return null;
                    const next = { ...prev, image: img };
                    localStorage.setItem("user", JSON.stringify(next));
                    return next;
                });
            })
            .catch((err) => setErrorMessage(err.message || "Failed to load profile."))
            .finally(() => setIsLoading(false));
    }, [setUserInfo]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = e.target.files?.[0];
        if (!picked) return;
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) setSelectedImage(ev.target.result as string); };
        reader.readAsDataURL(picked);
        setFile(picked);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            if (file) {
                const formData = new FormData();
                formData.append("photo", file, file.name);
                formData.append("email", userData.email);
                const photoRes = await fetch(`${process.env.BACKEND_URL}/api/upload-photo`, {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                });
                if (!photoRes.ok) throw new Error("Photo upload failed.");
                const photoData = await photoRes.json();
                const newImage = normaliseProfileImage(photoData.url || userData.url);
                setSelectedImage(newImage);
                setUserInfo((prev) => {
                    if (!prev) return null;
                    const next = { ...prev, image: newImage };
                    localStorage.setItem("user", JSON.stringify(next));
                    return next;
                });
            }

            const profileRes = await fetch(`${process.env.BACKEND_URL}/api/update-profile`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: userData.email, name: userData.name, phone: userData.phone, gender: userData.gender }),
            });
            if (!profileRes.ok) throw new Error("Profile update failed.");

            setFile(null);
            setUserInfo((prev) => {
                if (!prev) return null;
                const next = { ...prev, name: userData.name, email: userData.email };
                localStorage.setItem("user", JSON.stringify(next));
                return next;
            });
            setSuccessMessage("Profile updated successfully.");
        } catch (err: any) {
            setErrorMessage(err.message || "Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!password.trim()) { setDeleteError("Please enter your password."); return; }
        setIsDeleting(true);
        setDeleteError("");
        try {
            const res = await fetch(`${process.env.BACKEND_URL}/api/deleteAccount`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.status === 403) throw new Error("Incorrect password.");
            if (!res.ok) throw new Error("Account deletion failed.");
            closeDelete();
            router.push(URL.SignOut);
        } catch (err: any) {
            setDeleteError(err.message || "Failed to delete account.");
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
            </div>
        );
    }

    return (
        <div className="w-full pb-8">
            {/* Header */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Account</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Profile Settings</h1>
                <p className="mt-2 text-sm text-slate-500">Update your name, photo, and personal details.</p>
            </section>

            <div className="mt-4 grid gap-4 xl:grid-cols-[240px_minmax(0,1fr)]">
                {/* Avatar */}
                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div
                        className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border-2 border-slate-200"
                        onClick={() => fileRef.current?.click()}
                    >
                        <ResilientImage
                            src={selectedImage}
                            fallbackSrc={DEFAULT_PROFILE_IMAGE}
                            alt="Profile photo"
                            fill
                            sizes="128px"
                            className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition hover:opacity-100">
                            <Camera className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="mt-4 text-sm font-semibold text-[#d45540] transition hover:text-[#b84335]"
                    >
                        Change photo
                    </button>
                    <p className="mt-1 text-center text-xs text-slate-400">Click photo or link to upload</p>
                </div>

                {/* Form */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    {successMessage && (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            {successMessage}
                        </div>
                    )}
                    {errorMessage && (
                        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    <div className="space-y-4">
                        {[
                            { label: "Email", key: "email" as const, type: "email" },
                            { label: "Full Name", key: "name" as const, type: "text" },
                            { label: "Phone", key: "phone" as const, type: "tel" },
                        ].map((field) => (
                            <label key={field.key} className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                                {field.label}
                                <input
                                    type={field.type}
                                    value={userData[field.key]}
                                    onChange={(e) => setUserData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                />
                            </label>
                        ))}

                        <div>
                            <p className="text-xs font-semibold text-slate-500">Gender</p>
                            <div className="mt-2 flex gap-4">
                                {[{ value: "M", label: "Male" }, { value: "F", label: "Female" }].map((opt) => (
                                    <label key={opt.value} className="flex cursor-pointer items-center gap-2">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value={opt.value}
                                            checked={userData.gender === opt.value}
                                            onChange={(e) => setUserData((prev) => ({ ...prev, gender: e.target.value }))}
                                            className="accent-slate-900"
                                        />
                                        <span className="text-sm text-slate-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                        <Button
                            className="h-11 rounded-full bg-slate-900 px-6 text-sm font-semibold text-white"
                            onClick={handleSave}
                            isDisabled={isSaving}
                        >
                            {isSaving ? "Saving…" : "Save Changes"}
                        </Button>
                        <Button
                            className="h-11 rounded-full border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700"
                            onClick={() => { setErrorMessage(""); setSuccessMessage(""); setFile(null); }}
                            isDisabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="ml-auto h-11 rounded-full border border-red-200 bg-white px-6 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            onClick={openDelete}
                            isDisabled={isSaving}
                        >
                            Delete Account
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            <Modal isOpen={isDeleteOpen} onClose={closeDelete}>
                <ModalContent>
                    {() => (
                        <>
                            <ModalHeader className="border-b border-slate-100">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-400">Danger Zone</p>
                                    <p className="mt-1 text-lg font-semibold text-slate-900">Delete Account</p>
                                </div>
                            </ModalHeader>
                            <ModalBody className="py-5">
                                <p className="text-sm text-slate-600">
                                    This action is permanent and cannot be undone. Enter your password to confirm.
                                </p>
                                {deleteError && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {deleteError}
                                    </div>
                                )}
                                <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                                    Password
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => { setPassword(e.target.value); setDeleteError(""); }}
                                        className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                                        placeholder="Enter your password"
                                    />
                                </label>
                            </ModalBody>
                            <ModalFooter className="border-t border-slate-100">
                                <Button
                                    className="rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-700"
                                    onClick={() => { closeDelete(); setPassword(""); setDeleteError(""); }}
                                    isDisabled={isDeleting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="rounded-full bg-red-600 text-sm font-semibold text-white"
                                    onClick={handleConfirmDelete}
                                    isDisabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting…" : "Delete Account"}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
