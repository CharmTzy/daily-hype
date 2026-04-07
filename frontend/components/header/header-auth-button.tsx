// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { URL } from "@/enums/global-enums";
import { Button } from "@nextui-org/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HeaderAuthButton({ toShow }: { toShow: boolean }) {
  const router = useRouter();

  return (
    <>
      {toShow && (
        <>
          <Link href={URL.SignIn} className="text-small hover:text-custom-color2 laptop-3xl:text-medium laptop-3xl:ms-9 laptop-2xl:ms-7 laptop-xl:ms-6">
            Sign In
          </Link>
          <Button
            size="md"
            onClick={() => {
              router.push(URL.SignUp);
            }}
            className="text-white bg-gradient-to-r from-custom-color1 to-custom-color2 laptop-3xl:ms-9 laptop-3xl:text-medium laptop-2xl:ms-7 laptop-xl:ms-6"
          >
            Register
          </Button>
        </>
      )}
    </>
  );
}
