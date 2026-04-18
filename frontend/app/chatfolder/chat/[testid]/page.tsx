"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from "@nextui-org/react";
import { Socket, io } from "socket.io-client";
import { URL } from "@/enums/global-enums";
import {
    getAllMessages,
    getCurrentUserId,
    getDeliveryDetail,
    updatechatleavestatus,
} from "@/functions/deliv-functions";

interface ChatMessage {
    text: string;
    messagedatetime: Date;
    speakerid: number;
    roomId?: string;
}

interface DeliveryItem {
    image: string;
    name: string;
    quantity: number;
    colour: string;
    size: string;
    price: string;
}

interface DeliverySummary {
    deliveryId: string;
    deliveryTime: string;
    deliveryAddress: string;
    deliveryStatusDetail: string;
    trackingNumber: string;
    items: DeliveryItem[];
}

function formatMessageTime(value: Date) {
    return new Intl.DateTimeFormat("en-SG", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
    }).format(value);
}

function getProgressValue(statusDetail: string) {
    switch (statusDetail) {
        case "Order confirmed":
            return 25;
        case "Ready for pickup by company":
            return 50;
        case "On the way":
            return 75;
        case "Product delivered":
            return 99;
        default:
            return 0;
    }
}

export default function ChatRoomPage() {
    const { testid } = useParams<{ testid: string }>();
    const searchParams = useSearchParams();
    const deliveryId = searchParams.get("data");
    const roomId = useMemo(() => String(testid || ""), [testid]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [deliveryDetails, setDeliveryDetails] = useState<DeliverySummary | null>(null);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        if (!roomId || roomId === "undefined" || roomId === "null") {
            setIsLoading(false);
            setErrorMessage("Chat room not found.");
            return;
        }

        setIsLoading(true);
        setErrorMessage("");

        Promise.all([
            getCurrentUserId(),
            getAllMessages(roomId),
            deliveryId ? getDeliveryDetail(deliveryId) : Promise.resolve([]),
            updatechatleavestatus(roomId, true),
        ])
            .then(([userData, messageData, deliveryData]) => {
                setCurrentUserId(Number(userData[0]));
                setCurrentUserRole(userData[1].rolename || "");
                setMessages(messageData || []);
                setDeliveryDetails((deliveryData && deliveryData[0]) || null);
            })
            .catch((error) => {
                console.error(error);
                setErrorMessage("Unable to load this chat right now.");
            })
            .finally(() => {
                setIsLoading(false);
            });

        const handleBeforeUnload = () => {
            updatechatleavestatus(roomId, false).catch((error) => {
                console.error(error);
            });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            updatechatleavestatus(roomId, false).catch((error) => {
                console.error(error);
            });
        };
    }, [deliveryId, roomId]);

    useEffect(() => {
        if (!roomId || roomId === "undefined" || roomId === "null") {
            return;
        }

        const socketUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL_SOCKET || process.env.BACKEND_URL || "";
        const socket = io(`${socketUrl}/chat`, {
            transports: ["websocket"],
            query: { roomId },
        });

        socketRef.current = socket;
        socket.emit("join-room", roomId);

        socket.on("message", (messageData: { text: string; speakerId: number; messagedatetime?: string; roomId?: string }) => {
            if (String(messageData.roomId || roomId) !== roomId) {
                return;
            }

            setMessages((prevMessages) => [
                ...prevMessages,
                {
                    text: messageData.text,
                    speakerid: Number(messageData.speakerId),
                    messagedatetime: messageData.messagedatetime
                        ? new Date(messageData.messagedatetime)
                        : new Date(),
                    roomId,
                },
            ]);
        });

        return () => {
            socket.emit("leave-room", roomId);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [roomId]);

    const handleSendMessage = async () => {
        const trimmedMessage = messageInput.trim();

        if (!trimmedMessage || !currentUserId || !roomId) {
            return;
        }

        setIsSending(true);
        setErrorMessage("");

        const timestamp = new Date().toISOString();

        try {
            const response = await fetch(`${process.env.BACKEND_URL}/api/addNewMessage`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messagedatetime: timestamp,
                    msgcontent: trimmedMessage,
                    roomid: roomId,
                    speakerid: currentUserId,
                }),
            });
            const result = await response.json();

            if (!response.ok || result.error) {
                throw new Error(result.error || "Failed to send message");
            }

            socketRef.current?.emit("message", {
                roomId,
                text: trimmedMessage,
                speakerId: currentUserId,
                messagedatetime: timestamp,
            });

            setMessageInput("");
        } catch (error) {
            console.error(error);
            setErrorMessage("Message could not be sent.");
        } finally {
            setIsSending(false);
        }
    };

    const backHref = currentUserRole === "admin" ? URL.DeliveryList : URL.Delivery;
    const backLabel = currentUserRole === "admin" ? "Back to Admin Deliveries" : "Back to My Deliveries";

    if (isLoading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
                    <p className="mt-4 text-sm text-slate-500">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
                <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <Link
                                href={backHref}
                                className="text-sm font-medium text-slate-500 underline underline-offset-4"
                            >
                                {backLabel}
                            </Link>
                            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                                Customer and Admin Chat
                            </h1>
                            <p className="mt-2 text-sm text-slate-500">
                                Real-time updates are delivered through the live websocket room for this delivery.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {deliveryDetails ? (
                                <Button
                                    className="h-11 rounded-full border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700"
                                    onClick={() => setIsDetailsOpen(true)}
                                >
                                    View Delivery Details
                                </Button>
                            ) : null}
                            <span className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-50 px-5 text-sm font-semibold text-emerald-700">
                                Live room #{roomId}
                            </span>
                        </div>
                    </div>
                </div>

                {errorMessage ? (
                    <div className="border-b border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-700 sm:px-8">
                        {errorMessage}
                    </div>
                ) : null}

                <div className="max-h-[560px] space-y-4 overflow-y-auto bg-slate-50 px-6 py-6 sm:px-8">
                    {messages.length === 0 ? (
                        <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white px-6 py-8 text-center">
                            <p className="text-lg font-medium text-slate-900">No messages yet</p>
                            <p className="mt-2 text-sm text-slate-500">
                                Start the conversation with the first message.
                            </p>
                        </div>
                    ) : (
                        messages.map((message, index) => {
                            const isOwnMessage = currentUserId === message.speakerid;

                            return (
                                <div
                                    key={`${message.speakerid}-${message.messagedatetime.toISOString()}-${index}`}
                                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-[1.5rem] px-4 py-3 ${
                                            isOwnMessage
                                                ? "bg-slate-900 text-white"
                                                : "border border-slate-200 bg-white text-slate-700"
                                        }`}
                                    >
                                        <p className="text-sm leading-6">{message.text}</p>
                                        <p
                                            className={`mt-2 text-xs ${
                                                isOwnMessage ? "text-slate-300" : "text-slate-400"
                                            }`}
                                        >
                                            {formatMessageTime(message.messagedatetime)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-slate-200 bg-white px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(event) => setMessageInput(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            placeholder="Type your message..."
                            className="h-12 flex-1 rounded-full border border-slate-200 px-5 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                        />
                        <Button
                            className="h-12 rounded-full bg-slate-900 px-8 text-sm font-semibold text-white"
                            onClick={handleSendMessage}
                            isDisabled={isSending || messageInput.trim().length === 0}
                        >
                            {isSending ? "Sending..." : "Send"}
                        </Button>
                    </div>
                </div>
            </div>

            <Modal isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Delivery Details</ModalHeader>
                    <ModalBody>
                        {deliveryDetails ? (
                            <>
                                <p>
                                    <strong>Delivery #:</strong> {deliveryDetails.deliveryId}
                                </p>
                                <p>
                                    <strong>Estimated delivery date:</strong>{" "}
                                    {new Date(deliveryDetails.deliveryTime).toDateString()}
                                </p>
                                <p>
                                    <strong>Address:</strong> {deliveryDetails.deliveryAddress}
                                </p>
                                <p>
                                    <strong>Status:</strong> {deliveryDetails.deliveryStatusDetail}
                                </p>
                                <Progress
                                    label={`${getProgressValue(deliveryDetails.deliveryStatusDetail)}% Progress`}
                                    value={getProgressValue(deliveryDetails.deliveryStatusDetail)}
                                    className="max-w-md"
                                />
                                <p>
                                    <strong>Tracking number:</strong> {deliveryDetails.trackingNumber}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {deliveryDetails.items.map((item, index) => (
                                        <div key={index} className="rounded-[1rem] border border-slate-200 p-3">
                                            <div className="relative mb-3 h-28 w-full overflow-hidden rounded-lg">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 220px"
                                                    className="object-cover"
                                                />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {item.name} x {item.quantity}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                {item.colour}, {item.size}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-700">${item.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : null}
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onPress={() => setIsDetailsOpen(false)}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
}
