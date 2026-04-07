// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { Image, Modal, ModalContent, ModalBody, ModalFooter, useDisclosure, Button, ModalHeader } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAppState } from "@/app/app-provider";
import { CurrentActivePage } from "@/enums/global-enums";

const teams = [
  {
    name: "Zay Yar Tun",
    image: "https://media.licdn.com/dms/image/C5603AQE8-3PT94K_aw/profile-displayphoto-shrink_400_400/0/1661916306898?e=1708560000&v=beta&t=Nxbq5C7qEXEePDC9PX-MQ40i76_qrwX9wtibeP_6Hso",
    position: `2<sup>nd</sup> Year DIT student`,
    description: `I am currently studying Information Technology in Singapore Polytechnic and interested in building Full Stack websites. Here is what I have learnt and built during my study.

  <b>Modules Learnt: </b>
  1. Enterprise Systems Development
  2. Java Application Development
  3. Application Development Studio (Current Project DailyHype)
  4. Android Development
  5. Mobile Application Development
  6. Backend Web Development
  7. Frontend Web Development

  <b>Projects: </b>
  1. Mental Bot
  2. BookHaven
  3. TT Calendar
  
  <b>My Portfolio Website:</b> <a href="https://www.facebook.com">https://www.facebook.com</a>`,
  },
  {
    name: "Wai Yan Aung",
    image: "https://res.cloudinary.com/dcrv5rnoy/image/upload/v1701608292/Design/xlu4rhgcqlhgqb07c3d2.jpg",
    position: `2<sup>nd</sup> Year DIT student`,
    description: ` I am currently studying at Singapore Polytechnic with a keen interest in building full-stack websites. I thrive on the balance between technology and creativity, constantly seeking new ways to blend my technical skills with my love for music and gaming.

    <b>Modules Learnt: </b>
    1. Enterprise Systems Development
    2. Java Application Development
    3. Application Development Studio (Current Project DailyHype)
    4. Android Development
    5. Mobile Application Development
    6. Backend Web Development
    7. Frontend Web Development 
    
    <b>My Portfolio Website:</b> <a href="https://charmtzy.github.io/portfoilio.github.io/">CharmTzy</a>`,
  },
  { name: "Ang Wei Liang", image: "", position: `2<sup>nd</sup> Year DIT student`, description: "" },
  { name: "Thu Htet San", image: "", position: `2<sup>nd</sup> Year DIT student`, description: "" },
  { name: "Angie", image: "", position: `2<sup>nd</sup> Year DIT student`, description: "" },
];

export default function Page() {
  const { theme } = useTheme();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const { setCurrentActivePage } = useAppState();

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.None);
  }, []);

  return (
    <>
      <Modal size="2xl" isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-lg font-bold">{teams[selectedIndex].name}</ModalHeader>
              <ModalBody>
                <label className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: teams[selectedIndex].description }}></label>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <div className="flex flex-col max-w-full mx-28 my-10">
        <h2 className="before:border-2 before:me-3 before:border-black before:dark:border-white text-xl font-bold capitalize tracking-wider">About DailyHype</h2>
        <p className="mt-4 leading-8">
          Welcome to DailyHype, created by 2<sup>nd</sup> year students at Singapore Polytechnic. We&apos;re more than just a clothing e-commerce site; we&apos;re a fusion of style and innovation. Discover curated fashion with a tech-forward twist. Join us on this chic journey where fashion meets technology!
        </p>
        <h2 className="before:border-2 before:me-3 before:border-black before:dark:border-white mt-12 text-xl font-bold capitalize tracking-wider">Meet Our Teams</h2>
        <div className="flex justify-between mt-8 mb-5">
          {teams.map((team, index) => {
            return (
              <div key={index} className="flex flex-col items-center">
                <div
                  className="w-32 h-32 rounded-full border-1 overflow-hidden border-slate-500 flex justify-center items-center"
                  onClick={() => {
                    setSelectedIndex(index);
                    onOpen();
                  }}
                >
                  <Image src={!team.image ? (theme === "dark" ? "/icons/user-dark.svg" : "/icons/user.svg") : team.image} width={150} alt={team.name} />
                </div>
                <label className="mt-3 font-semibold">{team.name}</label>
                <label className="mt-2 text-small text-slate-700 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: team.position }}></label>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
