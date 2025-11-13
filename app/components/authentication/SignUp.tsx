"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import styles from '@/app/styles/spinner.module.css';
import { encrypt } from "@/app/utils/encryption";
import { post } from "@/app/utils/PostGetData";

// Define interfaces for clarity
interface FormData {
    name: string;
    universityName: string;
    email: string;
    password: string;
    phone: string;
}

interface ApiResponse {
    message?: string;
    error?: string;
}

// Custom spinner CSS

export function SignUp() {
    const router = useRouter();

    // State with proper typing
    const [formData, setFormData] = useState<FormData>({
        name: "",
        universityName: "",
        email: "",
        password: "",
        phone: "",
    });

    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Handle change with proper type
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        
        // Ensure only numbers are allowed in phone number field
        if (id === "phoneNumber") {
            const numericValue = value.replace(/\D/g, ""); // Remove non-numeric characters
            setFormData((prev) => ({ ...prev, phone: numericValue }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: value }));
        }
    };

    const validateForm = (): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{10}$/;

        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address.");
            return false;
        }

        if (!phoneRegex.test(formData.phone)) {
            setError("Please enter a valid 10-digit phone number.");
            return false;
        }

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return false;
        }

        if (!formData.name || !formData.universityName || !formData.email || !formData.password || !formData.phone) {
            setError("All fields are required.");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const { data, error } = await post<{ message: string }>("/api/auth", formData);

            if (data) {
                setSuccess(data.message || "Sign-up successful!");
                
                // Signup email with verification link is already sent by /api/auth
                // No need to send separate verification email
                
                router.push(`/Verification?v=${encrypt({ email: formData.email })}`);
            } else if (error) {
                setError(error?.message || "Something went wrong.");
            }
        } catch (err) {
            setError("Failed to connect to the server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>Sign up</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="universityName">University Name</Label>
                                <Input
                                    id="universityName"
                                    type="text"
                                    placeholder="Full name of university"
                                    value={formData.universityName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    type="text"
                                    placeholder="10-digit phone number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        {error && <p className="text-red-500">{error}</p>}
                        {success && <p className="text-green-500">{success}</p>}
                    </form>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={isLoading ? " opacity-50 cursor-not-allowed" : ""}
                    >
                        {isLoading ? <div className={styles.spinner}></div> : "Sign Up"}
                    </Button>
                </CardFooter>
            </Card>
        </>
    );
}