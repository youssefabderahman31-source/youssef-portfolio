"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface EditModeContextType {
    isEditMode: boolean;
    toggleEditMode: () => void;
    isAdmin: boolean;
    setIsAdmin: (value: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: React.ReactNode }) {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);


    useEffect(() => {
        // Check if user is admin (has token)
        const checkAdmin = async () => {
            try {
                const response = await fetch('/api/check-admin');
                const data = await response.json();
                setIsAdmin(data.isAdmin);
            } catch {
                setIsAdmin(false);
            }
        };
        checkAdmin();
    }, []);

    const toggleEditMode = () => {
        if (isAdmin) {
            setIsEditMode(!isEditMode);
        }
    };

    return (
        <EditModeContext.Provider value={{ isEditMode, toggleEditMode, isAdmin, setIsAdmin }}>
            {children}
        </EditModeContext.Provider>
    );
}

export function useEditMode() {
    const context = useContext(EditModeContext);
    if (context === undefined) {
        throw new Error("useEditMode must be used within EditModeProvider");
    }
    return context;
}
