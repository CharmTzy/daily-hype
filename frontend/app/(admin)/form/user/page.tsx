//Name: Wai Yan Aung
//Admission No: 2234993
//Class :DIT/FT/2B/02

"use client";

import {useAppState} from "@/app/app-provider";
import {CurrentActivePage} from "@/enums/global-enums";
import {useEffect, useState} from "react";
import {
  Button,
  RadioGroup,
  Radio,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Input,
  image,
} from "@nextui-org/react";

export default function Page() {
  const {setCurrentActivePage} = useAppState();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.UserForm);
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("male");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isValidEmail, setIsValidEmail] = useState(true);
  const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
  const isPasswordValid = passwordRegex.test(password);
  const doPasswordsMatch = password === confirmPassword;
  const [errorMessage, setErrorMessage] = useState<string>("");
  const roles = ["customer", "admin", "manager"];
  const [selectedRole, setSelectedRole] = useState("customer");
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    const file = event.target.files?.[0];

    if (file) {
      console.log("File selected:", file);
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string | null;
        if (result) {
          console.log("New image data URL:", result);
          setSelectedImage(result);
        }
      };

      reader.readAsDataURL(file);
      setFile(file);
    }
  };

  const handleSignUp = (file: File | null) => {
    console.log("Entering handleSignUp");
    console.log(selectedRole);
    console.log(name, email, password, confirmPassword, phone, gender, image, file);
    if (name && email && isPasswordValid && doPasswordsMatch && isEmailValid) {
      fetch(`${process.env.BACKEND_URL}/api/checkExistingUser`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })
        .then((response) => {
          console.log("Response from checkExistingUser:", response);
          if (response.ok) {
            setErrorMessage("");
            // Prepare form data
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("phone", phone);
            formData.append("gender", gender);
            formData.append("role",selectedRole);
            if (file) {
              formData.append("photo", file, file.name);
            }

            // Make POST request using fetch
            fetch(`${process.env.BACKEND_URL}/api/create-user`, {
              method: "POST",
              credentials: "include",
              body: formData,
            })
              .then((response) => response.json())
              .then((data) => {
                console.log("Response from create-user:", data);
                if (data.error) {
                  setErrorMessage("Invalid email");
                }
              })
              .catch((error) => {
                console.error("Error creating user:", error);
              });
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
        errorMessage = "Passwords do not match";
      } else if (!isPasswordValid) {
        errorMessage =
          "Password must have at least 8 characters with one number and special character";
      } else if (!isEmailValid) {
        errorMessage = "Invalid Email";
      }
      console.error("Validation error:", errorMessage);
      setErrorMessage(errorMessage);
    }
  };
  const handleRoleChange = (value:string) => {
    setSelectedRole(value);
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="mx-auto max-w-[350px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">User Form</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Enter user information to create an account
          </p>
        </div>
        <div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Input
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Input
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
              />
              <div />
            </div>
            <div className="space-y-2">
              <Input
                label="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Input
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="mr-2">Gender</div>
                  <div className="ml-4">
                    <div className="flex items-center justify-center space-x-4 text-white">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          id="male"
                          name="gender"
                          value="M"
                          onChange={(e) => setGender(e.target.value)}
                          className="form-radio text-white"
                        />
                        <span className="text-black">Male</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="radio"
                          id="female"
                          name="gender"
                          value="F"
                          onChange={(e) => setGender(e.target.value)}
                          className="form-radio text-white"
                        />
                        <span className="text-black">Female</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="bordered">
                      Role: {selectedRole}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Role Selection">
                    {roles.map((role) => (
                      <DropdownItem key={role} onClick={() => handleRoleChange(role)}>
                        {role}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              </div>

              <div className="space-y-2">
                <input
                  type="file"
                  className="text-center center-block file-upload"
                  id="photoInput"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <Button
                className="bg-black text-white"
                type="submit"
                onClick={() => handleSignUp(file)}
              >
                Sign Up
              </Button>
              <div className="text-center">{errorMessage}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
