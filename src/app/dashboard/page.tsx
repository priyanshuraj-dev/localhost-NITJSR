"use client"
import { UserContext } from "@/context/UserContext";
import { useContext } from "react";

export default function Dashboard(){
    const { userData, setUserData } = useContext(UserContext);
    return (
        <div>Hi</div>
    )
}