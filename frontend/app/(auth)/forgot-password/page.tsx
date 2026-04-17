"use client";
import { JSX, SVGProps, useState } from "react";
import Link from "next/link";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/auth-shell";
import { URL } from "@/enums/global-enums";

export default function Page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showAdditional, setShowAdditional] = useState<boolean>(false);
    const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
    const [code, setCode] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
    const [requestError, setRequestError] = useState<string>("");
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    const isPasswordValid = passwordRegex.test(password);
    const doPasswordsMatch = password === confirmPassword;
    const router = useRouter();

    const handleForgotPassword = (email: string) => {
        setRequestError("");
        fetch(`${process.env.BACKEND_URL}/api/forgot-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
        })
            .then((response) => response.json())
            .then((result) => {
            if (result.success) {
                onOpen();
            }
            else {
                setRequestError("Email not found. Please check the address or sign up first.");
            }
        })
            .catch((error) => {
            console.error(error);
            setRequestError("We couldn't send a verification code right now.");
        });
    };

    const handleVerificationCode = (code: number) => {
        fetch(`${process.env.BACKEND_URL}/api/verify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, code }),
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
            .then(() => {
            alert("Account verification successful");
            setShowAdditional(true);
            onClose();
        })
            .catch((error) => {
            alert("Verification code is wrong");
            console.error("Error during verification:", error.message);
        });
    };

    const PasswordReset = (email: string, password: string) => {
        fetch(`${process.env.BACKEND_URL}/api/password-reset`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        })
            .then((response) => response.json())
            .then(() => {
            alert("Password reset successful");
            router.push(URL.SignIn);
        })
            .catch(() => {
            alert("Password Error");
        });
    };

    return (<>
      <AuthShell title={showAdditional ? "Create a new password" : "Reset your password"} description={showAdditional ? "Choose a new password for your DailyHype account." : "Enter your account email and we'll send a verification code so you can safely reset your password."} panelTitle="Recover your access smoothly" panelDescription="We keep password recovery simple: verify your email, choose a fresh password, and get back to your orders and saved cart." panelContent={<div className="grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="font-medium text-white">Verified recovery</p>
                <p className="mt-1 text-white/70">A verification code is sent to your inbox before any password change is allowed.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                <p className="font-medium text-white">Quick return to checkout</p>
                <p className="mt-1 text-white/70">Once updated, you can jump straight back into your account and cart.</p>
              </div>
            </div>} footer={<p>Remembered your password? <Link href={URL.SignIn} className="font-medium text-[#FB6050]">Back to sign in</Link></p>}>
        {!showAdditional ? (<div className="space-y-5">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <AlertCircleIcon className="h-5 w-5 text-[#FB6050]"/>
              <span>Use the email address linked to your DailyHype account.</span>
            </div>
            <Input placeholder="you@example.com" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} variant="bordered" labelPlacement="outside"/>
            {requestError ? <p className="text-sm font-medium text-red-500">{requestError}</p> : null}
            <Button className="h-12 w-full rounded-full bg-[#111827] text-sm font-semibold uppercase tracking-[0.18em] text-white" onClick={() => { handleForgotPassword(email); }}>
              Send Code
            </Button>
          </div>) : (<div className="space-y-5">
            <Input isRequired type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} variant="bordered" labelPlacement="outside" placeholder="New password"/>
            <Input isRequired type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} variant="bordered" labelPlacement="outside" placeholder="Confirm new password"/>
            {passwordError ? <p className="text-sm font-medium text-red-500">{passwordError}</p> : null}
            {confirmPasswordError ? <p className="text-sm font-medium text-red-500">{confirmPasswordError}</p> : null}
            <Button className="h-12 w-full rounded-full bg-[#111827] text-sm font-semibold uppercase tracking-[0.18em] text-white" onClick={() => {
                setPasswordError("");
                setConfirmPasswordError("");
                if (!isPasswordValid) {
                    setPasswordError("Password must be at least 8 characters long and include a number and a special character.");
                    return;
                }
                if (!doPasswordsMatch) {
                    setConfirmPasswordError("Passwords do not match.");
                    return;
                }
                PasswordReset(email, password);
            }}>
              Reset Password
            </Button>
          </div>)}
      </AuthShell>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (<>
              <ModalHeader className="flex flex-col gap-1">Verify your account</ModalHeader>
              <ModalBody>
                <p>6-digit code has been sent to your email account</p>
                <Input type="text" label="Code" value={code} onChange={(e) => setCode(e.target.value)}/>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => handleVerificationCode(Number(code))}>
                  Verify
                </Button>
              </ModalFooter>
            </>)}
        </ModalContent>
      </Modal>
    </>);
}

function AlertCircleIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
    return (<svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" x2="12" y1="8" y2="12"/>
      <line x1="12" x2="12.01" y1="16" y2="16"/>
    </svg>);
}
