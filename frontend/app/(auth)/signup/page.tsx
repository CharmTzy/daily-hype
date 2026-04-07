// Name: Wai Yan Aung
// Admin No: 2234993
// Class: DIT/FT/2B/02
"use client";
import React, { useEffect, useState } from "react";
import { Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Button } from "@nextui-org/react";
import Image from "next/image";
import { URL } from "@/enums/global-enums";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppState } from "@/app/app-provider";
import { getCart } from "@/functions/cart-functions";
import { error } from "console";
import Head from "next/head";
import { userInfo } from "os";

declare global {
  interface Window {
    FB: any;
  }
}
interface FacebookAuthResponse {
  authResponse: {
    accessToken: string;
  };
}

interface FacebookUser {
  id: string;
  name: string;
  email: string;
  verified_email: boolean;
  picture: {
    data: {
      url: string;
    };
  };
}
export default function Page() {
  const { setUserInfo, setCart, userInfo } = useAppState();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [isValidEmail, setIsValidEmail] = useState(true);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showAdditional, setShowAdditional] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [showVerification, setShowVerification] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [timer, setTimer] = useState<number>(300);
  const { isOpen, onOpenChange } = useDisclosure();
  const [user, setUser] = useState<TokenResponse[]>([]);
  const [verificationCode, setVerificationCode] = useState<string>("");

  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;

  const isPasswordValid = passwordRegex.test(password);
  const doPasswordsMatch = password === confirmPassword;

  const handleNextButtonClick = () => {
    if (name && email && isPasswordValid && doPasswordsMatch) {
      fetch(`${process.env.BACKEND_URL}/api/checkExistingUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })
        .then((response) => {
          if (response.ok) {
            setShowAdditional(true);
            setErrorMessage("");
          } else {
            setErrorMessage("Email already exists.Please login");
          }
        })
        .catch((error) => {
          console.error("Error checking existing user:", error);
          setErrorMessage("Server Error");
        });
    } else {
      let errorMessage = "";
      if (!name || !email || !password || !confirmPassword) {
        errorMessage = "Please fill in all fields";
      } else if (!doPasswordsMatch) {
        errorMessage = "Password do not match";
      } else if (!isPasswordValid) {
        errorMessage = "Password must have at least 8 characters with one number and special character";
      }
      setErrorMessage(errorMessage);
    }
  };

  const router = useRouter();
  const login = useGoogleLogin({
    onSuccess: (codeResponse: TokenResponse) => setUser([codeResponse]),
    onError: (error) => console.log("Login Failed:", error),
  });

  useEffect(() => {
    let token = localStorage.getItem("token");
    if (token) {
      router.push(URL.Dashboard);
    }
  }, []);

  useEffect(() => {
    if (user.length > 0) {
      const currentUser = user[0];

      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${currentUser.access_token}`, {
          headers: {
            Authorization: `Bearer ${currentUser.access_token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          console.log("This is profile");
          console.log(res.data);

          const res_id = res.data.id;
          const res_name = res.data.name;
          const res_email = res.data.email;
          const res_verified_email = res.data.verified_email;
          const res_picture = res.data.picture;

          fetch(`${process.env.BACKEND_URL}/api/signupGoogle`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ res_id, res_name, res_email, res_verified_email, res_picture }),
            credentials: "include",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              console.log(data);
              const user = data.user;
              localStorage.setItem("user", JSON.stringify({ id: user.userid, method: "google", name: user.name, email: user.email, image: user.url, role: user.rolename }));
              setUserInfo({ id: user.userid, name: user.name, email: user.email, image: user.url, method: "google", role: user.rolename });
              getCart()
                .then((result) => {
                  if (result.error) {
                  } else {
                    const data = result.data || [];
                    setCart(data);
                    localStorage.setItem("cart", JSON.stringify(data));
                    router.push(URL.Home);
                  }
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
        })
        .catch((err) => {
          console.error("Error fetching user info:", err);
          alert("Sign In failed!");
        });
    }
  }, [user]);

  const isValidEmailFn = (email: string) => {
    // Regular expression for a basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailValid = isValidEmailFn(email);

  if (isEmailValid) {
    console.log("Valid email address");
  } else {
    console.log("Invalid email address");
  }
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setIsValidEmail(isValidEmailFn(newEmail));
  };

  const handleVerification = () => {
    const payload = {
      email: email,
    };

    fetch(`${process.env.BACKEND_URL}/api/signup`, {
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
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((signupData) => {
        // Handle successful signup response
        console.log("Signup response:", signupData);
      })
      .catch((signupError) => {
        console.error("Error during signup:", signupError.message);
      });

    setShowVerification(false);
    clearInterval(timer);
  };

  const handleVerificationCode = (code: number) => {
    fetch(`${process.env.BACKEND_URL}/api/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        code,
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
        router.push(URL.SignIn);
      })
      .catch((error) => {
        alert("Verification code is wrong");
        console.error("Error during verification:", error.message);
      });
  };

  useEffect(() => {
    // Load Facebook SDK script
    const script = document.createElement("script");
    script.async = true;
    script.defer = true;
    script.crossOrigin = "anonymous";
    script.src = "https://connect.facebook.net/en_US/sdk.js";
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize Facebook SDK
      window.FB.init({
        appId: "324443653926221",
        cookie: true,
        xfbml: true,
        version: "v14.0",
      });

      // Check login status or other initialization actions
      // window.FB.getLoginStatus(handleFacebookLoginStatus);
    };

    // Clean up the script on unmount
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (userInfo !== null && userInfo.method === "facebook" && window.FB) {
      window.FB.getLoginStatus(handleFacebookLoginStatus);
    }
    console.log(userInfo);
  }, [userInfo]);

  const handleFacebookLoginStatus = (response: { status: string }) => {
    if (response.status === "connected") {
      handleFacebookLogin();
    } else {
      // User is not connected, or not authorized; handle accordingly
      console.log("User is not connected or not authorized.");
    }
  };

  const handleFacebookLogin = () => {
    window.FB.login(
      function (response: FacebookAuthResponse) {
        if (response.authResponse) {
          // User authenticated successfully
          const accessToken = response.authResponse.accessToken;

          // Retrieve user information
          window.FB.api("/me", { fields: "id,name,email,picture" }, function (fbUser: FacebookUser) {
            const { id, name, email, verified_email, picture } = fbUser;

            console.log("Facebook User Information:", fbUser); // Log user information

            // Make a request to your backend signupFacebook endpoint
            fetch(`${process.env.BACKEND_URL}/api/signupFacebook`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                res_id: id,
                res_name: name,
                res_email: email,
                res_verified_email: verified_email,
                res_picture: picture ? picture.data.url : null, // Check if 'picture' is available
              }),
              credentials: "include",
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then((data) => {
                console.log("Signup Response:", data);
                const user = data.user;
                localStorage.setItem("user", JSON.stringify({ id: user.userid, method: "facebook", name: user.name, email: user.email, image: user.url, role: user.rolename }));
                setUserInfo({ id: user.userid, name: user.name, email: user.email, method: "facebook", image: user.url, role: user.rolename });
                getCart()
                  .then((result) => {
                    if (result.error) {
                    } else {
                      const data = result.data || [];
                      setCart(data);
                      localStorage.setItem("cart", JSON.stringify(data));
                      router.push(URL.Home);
                    }
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
          });
        } else {
          // User cancelled login or did not fully authorize
          console.log("Facebook login failed or cancelled.");
        }
      },
      { scope: "public_profile,email" }
    ); // Specify additional permissions if needed
  };

  return (
    <>
      <Head>
        <script async defer crossOrigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js"></script>
      </Head>
      <div className="w-full min-h-screen grid grid-cols-1 sm:grid-cols-2">
        {!showAdditional && (
          <div className="left w-full min-h-screen flex flex-col justify-center items-center gap-10 bg-[#FB6050] text-white" id="initialFields">
            <h2 className="text-3xl text-center">Create your account</h2>
            <div className="w-full">
              <div className="mb-12">
                <Input isRequired type="email" label="Email" value={email} onChange={handleEmailChange} className={`w-full sm:w-[85%] h-10 border-none rounded-md text-base px-4 sm:px-24 block mx-auto ${isValidEmail ? "" : "border-red-500"}`} />
              </div>
              <div className="mb-12">
                <Input isRequired type="name" label="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full sm:w-[85%] h-10 border-none rounded-md text-base px-4 sm:px-24 block mx-auto " />
              </div>
              <div className="mb-12">
                <Input isRequired type="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full sm:w-[85%] h-10 border-none rounded-md text-base px-4 sm:px-24 block mx-auto ${isPasswordValid ? "" : "border-red-500"}`} />
              </div>
              <div className="mb-16">
                <Input isRequired type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full sm:w-[85%] h-10 border-none rounded-md text-base px-4 sm:px-24 block mx-auto ${doPasswordsMatch ? "" : "border-red-500"}`} />
              </div>

              <div className="mb-4 w-full flex flex-col items-center sm:flex-row sm:justify-center">
                <button className="bg-white text-black px-6 py-3 uppercase rounded-md hover:bg-gray-200 mb-2 sm:mb-0 sm:mr-4 md:mr-8 lg:mr-12 xl:mr-16 2xl:mr-48" onClick={handleNextButtonClick}>
                  Next
                </button>
                <a href={URL.SignIn} className="mt-2 sm:mt-0 hover:text-gray-200">
                  Log in your account ➡
                </a>
              </div>
              <div className="text-center 2xl:mr-72">{errorMessage}</div>
            </div>
            <div className="grid ">
              <button onClick={() => login()} className="group  h-12 px-9 border-2 border-gray-300 rounded-full transition duration-300 hover:border-blue-400 focus:bg-blue-50 active:bg-blue-100 bg-white">
                <div className="relative flex items-center space-x-6 justify-center">
                  <Image src="https://tailus.io/sources/blocks/social/preview/images/google.svg" width={20} height={20} alt="Google Logo" />
                  <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-blue-600 sm:text-base">Continue with Google</span>
                </div>
              </button>
            </div>

            <div className="grid ">
              <button onClick={() => handleFacebookLogin()} className="group w-68 h-12 px-6 border-2 border-gray-300 rounded-full transition duration-300 hover:border-blue-400 focus:bg-blue-50 active:bg-blue-100 bg-white">
                <div className="relative flex items-center justify-center">
                  <Image src="https://www.logo.wine/a/logo/Facebook/Facebook-f_Logo-Blue-Logo.wine.svg" width={45} height={45} alt="Facebook Logo" />
                  <span className="block w-max font-semibold tracking-wide text-gray-700 text-sm transition duration-300 group-hover:text-blue-600 sm:text-base">Continue with Facebook</span>
                </div>
              </button>
            </div>

            <div className="space-y-3 text-black text-center sm:-mb-8">
              <p className="text-xs">
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
          </div>
        )}

        {showAdditional && (
          <div className="left w-full min-h-screen flex justify-center  gap-10 bg-[#FB6050] text-white" id="additionalFields">
            <div className="additional w-full flex flex-col justify-center items-center mt-25vh gap-10">
              <div className="left w-full flex flex-col justify-start items-start gap-10">
                <button onClick={() => setShowAdditional(false)} className="text-white">
                  &lt; Back
                </button>
              </div>
              <h2 className="text-3xl text-center">Additional Information(Optional)</h2>
              <div className="w-full">
                <div className="mb-12">
                  <Input type="phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full sm:w-[80%] h-10 border-none rounded-md text-base px-4 sm:px-24 block mx-auto" />
                </div>

                <div className="mb-12">
                  <div className="flex items-center justify-center space-x-4 text-white">
                    <label className="flex items-center">
                      <input type="radio" id="male" name="gender" value="M" onChange={(e) => setGender(e.target.value)} className="form-radio text-white" />
                      <span className="ml-2">Male</span>
                    </label>

                    <label className="flex items-center">
                      <input type="radio" id="female" name="gender" value="F" onChange={(e) => setGender(e.target.value)} className="form-radio text-white" />
                      <span className="ml-2">Female</span>
                    </label>
                  </div>
                </div>  

                <div className="w-full flex flex-col items-center sm:flex-row sm:justify-center">
                  <button
                    className="bg-white text-black px-6 py-3 uppercase rounded-md hover:bg-gray-200 mb-2 sm:mb-0 sm:mr-4 md:mr-8 lg:mr-12 xl:mr-16 2xl:mr-48"
                    onClick={() => {
                      handleVerification();
                      onOpenChange();
                      setShowVerificationModal(true);
                    }}
                  >
                    Create
                  </button>
                  <a href={URL.SignIn} className="mt-2 sm:mt-0 hover:text-gray-200">
                    Log in your account ➡
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {showVerificationModal && (
          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">Verify your account</ModalHeader>
                  <ModalBody>
                    <p>6-digit code has been sent to your email account</p>
                    <Input type="text" label="Code" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" onPress={() => handleVerificationCode(Number(verificationCode))}>
                      Verify
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
        )}

        <div className="right w-full h-screen flex flex-col justify-center items-center bg-[#0c0f38] text-white">
          <a href={URL.Home} className="logo-box">
            <Image src="/images/logo-light.png" priority={true} alt="Logo" width={300} height={150} />
          </a>
          <p className="text-center mt-4">True comfort in style!!</p>
        </div>
      </div>
    </>
  );
}
