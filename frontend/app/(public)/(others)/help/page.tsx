// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

"use client";

import { useAppState } from "@/app/app-provider";
import { CurrentActivePage, URL } from "@/enums/global-enums";
import { Accordion, AccordionItem, Input, Link } from "@nextui-org/react";
import { useEffect, useState } from "react";

export default function Page() {
  const { setCurrentActivePage } = useAppState();
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    setCurrentActivePage(CurrentActivePage.None);
  }, []);

  return (
    <div className="flex flex-col w-full items-center my-8">
      <label className="text-2xl font-bold mt-4">How can we help you?</label>
      <Input
        isClearable
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="max-w-[60%] mt-8"
        placeholder="Search for topics, questions, ..."
        onClear={() => {
          setSearchText("");
        }}
        variant="faded"
        radius="lg"
        size="lg"
      />
      <div className="flex flex-col items-center mt-20 mb-8">
        <label className="text-xl font-semibold mb-4">Frequently Asked Questions</label>
        <Accordion variant="splitted" className="mt-4 w-[700px]" itemClasses={{ title: "text-medium data-[open=true]:font-semibold" }}>
          <AccordionItem key="1" aria-label="Question 1" title="How long does it take for my order to ship?">
            <p className="pe-8 mb-3">Normally, it will take 1-3 working days to prepare the item. After preparing, we will ship out your order. You can track your order in order list. If it takes longer than estimated delivery date, please contact us for more information.</p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="2" aria-label="Question 2" title="How to check my order status?">
            <p className="pe-8 mb-3">Generally, you can check your order status via &quot;order&quot; under your profile image.</p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="3" aria-label="Question 3" title="What if I received a wrong item?">
            <p className="pe-8 mb-3">We apologize if you received the wrong item. Please feel free to contact us for help.</p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="4" aria-label="Question 4" title="Do you provide invoice?">
            <p className="pe-8 mb-3">
              Yes, we will send the digital invoice to your email once you received the item. You can also download invoice from your <Link href={URL.AllOrder}>order list</Link>.
            </p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="5" aria-label="Question 5" title="How to change shipping address once my order is placed?">
            <p className="pe-8 mb-3">
              Please cancel your order inside your <Link href={URL.AllOrder}>order list</Link> and place new order with correct shipping address.
            </p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="6" aria-label="Question 6" title="Do you offer other payment methods such as Cash on Delivery?">
            <p className="pe-8 mb-3">Sorry, currently we only provide card payment method. We accept visa and master card.</p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="7" aria-label="Question 7" title="How to reset my password?">
            <p className="pe-8 mb-3">
              You can reset your password under your <Link href={URL.Profile}>account management</Link>.
            </p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="8" aria-label="Question 8" title="How to add new delivery address to my account?">
            <p className="pe-8 mb-3">
              You can add new delivery address (up to 5) under your <Link href={URL.Profile}>address book</Link>.
            </p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
          <AccordionItem key="9" aria-label="Question 9" title="I forgot my password! What to do?">
            <p className="pe-8 mb-3">
              You can click on forgot my password under <Link href={URL.SignIn}>sign in</Link> page. You need to provide the code sent to your email to reset your password.
            </p>
            <Link href="" className="mb-4">
              View More
            </Link>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
