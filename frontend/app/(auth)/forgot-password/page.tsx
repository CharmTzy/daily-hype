"use client";
import { JSX, SVGProps, useEffect, useState } from "react";
import Link from "next/link"
import { Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button } from "@nextui-org/react";
import { useRouter } from "next/navigation";
export default function Page() {
    const [email,setEmail] = useState("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [showAdditional, setShowAdditional] = useState<boolean>(false);
    const { isOpen, onOpenChange } = useDisclosure();
    const [showModal, setModal] = useState(false);
    const [code, setCode] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");
    
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

    const isPasswordValid = passwordRegex.test(password);
    const doPasswordsMatch = password === confirmPassword;

    const router = useRouter();
    const handleForgotPassword = (email: string) => {
        fetch(`${process.env.BACKEND_URL}/api/forgot-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        })
          .then((response) => {
            return response.json();
          })
          .then((result) => {
            if (result.success) {
                onOpenChange();
                setModal(true);
            } else {
                alert("Email not found. Please check your email address or signup.");
            }
        })
          .catch((error) => {
            console.error(error);
          });
      };

      const handleVerificationCode = (code: number) => {
        fetch(`${process.env.BACKEND_URL}/api/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            code
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((verificationResult) => {
            console.log("Verification Result:", verificationResult);
            alert("Account verification successful");
            setShowAdditional(true);
            setModal(false);
          })
          .catch((error) => {
            alert("Verification code is wrong");
            console.error("Error during verification:", error.message);
            
          });
      };
    
      const PasswordReset = (email:string, password:string) =>{
        fetch(`${process.env.BACKEND_URL}/api/password-reset`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password
            }),
          })
            .then((response) => {
              return response.json();
            })
            .then((passwordResetResult) => {
                console.log("Password Reset Result:", passwordResetResult);
                alert("Password reset successful");
                router.push("/signin");
              })
            .catch((error) => {
            alert("Password Error");
            });
        };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FB6050]">
        
      <div className="text-center text-3xl font-bold text-white">DailyHype </div>
      {!showAdditional && (
      <div className="mt-8 w-full max-w-md rounded-lg bg-white p-8">
        <div className="flex items-center justify-center">
          <AlertCircleIcon className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold">Forgot Password</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>
        <form className="mt-4">
            <div className="mt-1">
                <Input placeholder="dailyhypeteam2023@gmail.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mt-4 flex items-center justify-center">
                <Button className="bg-green-500 text-white" onClick ={()=>{handleForgotPassword(email);}}>Submit</Button>
            </div>
        </form>
        <div className="mt-4 text-center">
          <Link className="text-sm text-blue-500" href="./signin">
            Back to Login
          </Link>
        </div>
      </div>
      )}
      {showAdditional && (
      <div className="mt-8 w-full max-w-md rounded-lg bg-white p-8">
        <div className="flex items-center justify-center">
          <AlertCircleIcon className="h-12 w-12 text-blue-500" />
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold">Forgot Password</h2>
        <form className="mt-4">
            <div className="mt-1">
            <Input isRequired type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={` ${isPasswordValid ? '' : 'border-red-500'}`} />
            </div>
            <div className="mt-4">
            <Input isRequired type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={` ${doPasswordsMatch ? '' : 'border-red-500'}`} />
            </div>
            <div className="mt-4 flex items-center justify-center">
                <Button className="bg-green-500 text-white" onClick={() => {
                if (!isPasswordValid) {
                    setPasswordError("Password must be at least 8 characters long and include a number and a special character.");
                } else if (!doPasswordsMatch) {
                    setConfirmPasswordError("Passwords do not match.");
                } else {
                    onOpenChange();
                    setModal(true);
                    PasswordReset(email,password)
                }
            }}>Submit</Button>
            </div>
        </form>
        {passwordError && <p className="text-red-500">{passwordError}</p>}
        {confirmPasswordError && <p className="text-red-500">{confirmPasswordError}</p>}        
        <div className="mt-4 text-center">
          <Link className="text-sm text-blue-500" href="./signin">
            Back to Login
          </Link>
        </div>
      </div>
      )}

      <div className="mt-8 text-center text-xs text-white">
        Copyright © 2023 DailyHype Team
      </div>

      {showModal && (
       <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
       <ModalContent>
         {(onClose) => (
           <>
             <ModalHeader className="flex flex-col gap-1">Verify your account</ModalHeader>
             <ModalBody>
               <p>6-digit code has been sent to your email account</p>
               <Input
                 type="text"
                 label="Code"
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
               />
             </ModalBody>
             <ModalFooter>
               <Button color="primary" onPress={() => handleVerificationCode(Number(code))}>
                 Verify
               </Button>
             </ModalFooter>
           </>
         )}
       </ModalContent>
     </Modal>
      )}
    </div>
    
  )
}

function AlertCircleIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}
