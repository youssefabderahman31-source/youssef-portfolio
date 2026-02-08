"use client";

import React, { useActionState } from "react";
import { login } from "@/lib/actions";
import { Loader2 } from "lucide-react";

const initialState = {
    message: "",
};

export default function AdminLogin() {
    const [state, formAction, isPending] = useActionState(login, initialState);

    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-6">
            <div className="w-full max-w-md space-y-8 border border-white/10 p-10 bg-neutral-900/50 backdrop-blur-sm">
                <div className="text-center">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-brand-yellow">System Access</h1>
                    <p className="mt-2 text-gray-400 text-sm">Restricted Area</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div>
                        <label className="sr-only">Password</label>
                        <input
                            type="password"
                            name="password"
                            required
                            placeholder="Enter Access Key"
                            className="w-full bg-black border border-white/20 p-4 text-center tracking-widest focus:outline-none focus:border-brand-yellow transition-colors text-xl"
                        />
                    </div>

                    {state?.message && (
                        <p className="text-red-500 text-center text-sm">{state.message}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-white text-black py-4 font-bold uppercase tracking-wider hover:bg-brand-yellow transition-colors disabled:opacity-50 flex justify-center"
                    >
                        {isPending ? <Loader2 className="animate-spin" /> : "Authenticate"}
                    </button>
                </form>
            </div>
        </div>
    );
}
