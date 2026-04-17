"use client";
import React, { useEffect, useState } from "react";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/react";
import { URL } from "@/enums/global-enums";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import { getCart } from "@/functions/cart-functions";
import BrandLogo from "@/components/brand/brand-logo";
import { normaliseProfileImage } from "@/functions/profile-image";

export default function Page() {
    const { setUserInfo, setCart } = useAppState();
    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [isValidEmail, setIsValidEmail] = useState(true);
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [showAdditional, setShowAdditional] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [gender, setGender] = useState<string>("");
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [user, setUser] = useState<TokenResponse[]>([]);
    const [verificationCode, setVerificationCode] = useState<string>("");
    const router = useRouter();
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    const isPasswordValid = passwordRegex.test(password);
    const doPasswordsMatch = password === confirmPassword;

    const buildUserInfo = (user: any) => ({
        id: user.userid,
        method: "google" as const,
        name: user.name,
        email: user.email,
        image: normaliseProfileImage(user.url),
        role: user.rolename,
    });

    const login = useGoogleLogin({
        onSuccess: (codeResponse: TokenResponse) => setUser([codeResponse]),
        onError: (error) => console.log("Login Failed:", error),
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            router.push(URL.Dashboard);
        }
    }, [router]);

    useEffect(() => {
        if (user.length <= 0) {
            return;
        }
        const currentUser = user[0];
        axios
            .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${currentUser.access_token}`, {
            headers: {
                Authorization: `Bearer ${currentUser.access_token}`,
                Accept: "application/json",
            },
        })
            .then((res) => {
            const res_id = res.data.id;
            const res_name = res.data.name;
            const res_email = res.data.email;
            const res_verified_email = res.data.verified_email;
            const res_picture = res.data.picture;
            return fetch(`${process.env.BACKEND_URL}/api/signupGoogle`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ res_id, res_name, res_email, res_verified_email, res_picture }),
                credentials: "include",
            });
        })
            .then((response) => {
            if (!response || !response.ok) {
                throw new Error(`HTTP error! Status: ${response?.status}`);
            }
            return response.json();
        })
            .then((data) => {
            const user = data.user;
            const nextUserInfo = buildUserInfo(user);
            localStorage.setItem("user", JSON.stringify(nextUserInfo));
            setUserInfo(nextUserInfo);
            getCart()
                .then((result) => {
                if (!result.error) {
                    const data = result.data || [];
                    setCart(data);
                    localStorage.setItem("cart", JSON.stringify(data));
                }
                router.push(URL.Home);
            })
                .catch((error) => {
                console.error(error);
                router.push(URL.Home);
            });
        })
            .catch((error) => {
            console.error("Error posting user data:", error);
            alert("Sign In failed!");
        });
    }, [router, setCart, setUserInfo, user]);

    const isValidEmailFn = (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        setIsValidEmail(isValidEmailFn(newEmail));
    };

    const handleNextButtonClick = () => {
        if (name && email && isPasswordValid && doPasswordsMatch) {
            fetch(`${process.env.BACKEND_URL}/api/checkExistingUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })
                .then((response) => {
                if (response.ok) {
                    setShowAdditional(true);
                    setErrorMessage("");
                }
                else {
                    setErrorMessage("Email already exists.Please login");
                }
            })
                .catch((error) => {
                console.error("Error checking existing user:", error);
                setErrorMessage("Server Error");
            });
        }
        else {
            let nextErrorMessage = "";
            if (!name || !email || !password || !confirmPassword) {
                nextErrorMessage = "Please fill in all fields";
            }
            else if (!isValidEmail) {
                nextErrorMessage = "Invalid email address";
            }
            else if (!doPasswordsMatch) {
                nextErrorMessage = "Password do not match";
            }
            else if (!isPasswordValid) {
                nextErrorMessage = "Password must have at least 8 characters with one number and special character";
            }
            setErrorMessage(nextErrorMessage);
        }
    };

    const handleVerification = async () => {
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    phone,
                    gender,
                }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            await response.json();
            return true;
        }
        catch (signupError: any) {
            console.error("Error during signup:", signupError.message);
            setErrorMessage("Unable to create account right now");
            return false;
        }
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
            .then((verificationResult) => {
            console.log("Verification Result:", verificationResult);
            alert("Account verification successful");
            router.push(URL.SignIn);
        })
            .catch((error) => {
            alert("Verification code is wrong");
            console.error("Error during verification:", error.message);
        });
    };

    return (<div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="left w-full min-h-[34vh] md:min-h-screen flex justify-center items-center flex-col p-8 bg-white">
        <a href={URL.Home} className="logo-box">
          <BrandLogo size="lg" tagline="Curated fashion, elevated daily"/>
        </a>
        <p className="text-center mt-4">Stay Tuned, stay Hyped!</p>
      </div>
	
      <div className="right w-full min-h-screen flex flex-col justify-center items-center gap-10 bg-[#FB6050] text-white px-6 py-12">
        {!showAdditional ? (<>
            <h2 className="text-3xl text-center">Create your account</h2>
            <div className="w-full max-w-xl">
              <div className="mb-10">
                <Input isRequired type="email" label="Email" value={email} onChange={handleEmailChange} className={`w-full h-10 border-none rounded-md text-base px-4 md:px-10 block mx-auto ${isValidEmail ? "" : "border-red-500"}`}/>
              </div>
              <div className="mb-10">
                <Input isRequired type="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full h-10 border-none rounded-md text-base px-4 md:px-10 block mx-auto"/>
              </div>
              <div className="mb-10">
                <Input isRequired type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full h-10 border-none rounded-md text-base px-4 md:px-10 block mx-auto ${isPasswordValid ? "" : "border-red-500"}`}/>
              </div>
              <div className="mb-12">
                <Input isRequired type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full h-10 border-none rounded-md text-base px-4 md:px-10 block mx-auto ${doPasswordsMatch ? "" : "border-red-500"}`}/>
              </div>
              <div className="w-full flex flex-col items-center gap-4 md:flex-row md:justify-center">
                <button className="bg-white text-black px-6 py-3 uppercase rounded-md hover:bg-gray-200 min-w-[124px]" onClick={handleNextButtonClick}>
                  Next
                </button>
                <a href={URL.SignIn} className="hover:text-gray-200 text-center">
                  Log in your account ➡
                </a>
              </div>
              <div className="text-center mt-4 min-h-[24px]">{errorMessage}</div>
            </div>
            <div className="grid">
              <button onClick={() => login()} className="group h-12 px-9 border-2 border-gray-300 rounded-full transition duration-300 hover:border-blue-400 focus:bg-blue-50 active:bg-blue-100 bg-white">
                <div className="relative flex items-center space-x-4 justify-center">
                  <img src="/icons/google.svg" width={20} height={20} alt="Google Logo"/>
                  <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-blue-600 sm:text-base">Continue with Google</span>
                </div>
              </button>
            </div>
            <div className="space-y-3 text-black text-center">
              <p className="text-xs max-w-md">
                By proceeding, you agree to our{" "}
                <a href="#" className="underline text-color-white">
                  Terms of Use
                </a>{" "}
                and confirm you have read our{" "}
                <a href="#" className="underline">
                  Privacy and Cookie Statement
                </a>
                .
              </p>
            </div>
          </>) : (<>
            <div className="w-full max-w-xl">
              <div className="mb-6">
                <button onClick={() => setShowAdditional(false)} className="text-white">
                  &lt; Back
                </button>
              </div>
              <h2 className="text-3xl text-center mb-10">Additional Information(Optional)</h2>
              <div className="mb-10">
                <Input type="phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full h-10 border-none rounded-md text-base px-4 md:px-10 block mx-auto"/>
              </div>
              <div className="mb-12">
                <div className="flex items-center justify-center space-x-6 text-white">
                  <label className="flex items-center">
                    <input type="radio" id="male" name="gender" value="M" onChange={(e) => setGender(e.target.value)} className="form-radio text-white"/>
                    <span className="ml-2">Male</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" id="female" name="gender" value="F" onChange={(e) => setGender(e.target.value)} className="form-radio text-white"/>
                    <span className="ml-2">Female</span>
                  </label>
                </div>
              </div>
              <div className="w-full flex flex-col items-center gap-4 md:flex-row md:justify-center">
                <button className="bg-white text-black px-6 py-3 uppercase rounded-md hover:bg-gray-200 min-w-[160px]" onClick={async () => {
                const success = await handleVerification();
                if (success) {
                    onOpen();
                }
            }}>
                  Create
                </button>
                <a href={URL.SignIn} className="hover:text-gray-200 text-center">
                  Log in your account ➡
                </a>
              </div>
              <div className="text-center mt-4 min-h-[24px]">{errorMessage}</div>
            </div>
          </>)}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {() => (<>
              <ModalHeader className="flex flex-col gap-1">Verify your account</ModalHeader>
              <ModalBody>
                <p>6-digit code has been sent to your email account</p>
                <Input type="text" label="Code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)}/>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={() => handleVerificationCode(Number(verificationCode))}>
                  Verify
                </Button>
              </ModalFooter>
            </>)}
        </ModalContent>
      </Modal>
    </div>);
}
