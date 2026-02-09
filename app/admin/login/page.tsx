"use client";

import React, { useState } from "react";
import { useActionState } from "react";
import { login } from "@/lib/actions";
import { Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <button
            type="submit"
            disabled={isPending}
            className="w-full bg-brand-yellow text-black font-bold py-3 px-6 uppercase tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
            {isPending ? (
                <>
                    <Loader2 size={18} className="animate-spin" />
                    Verifying...
                </>
            ) : (
                <>
                    Enter Admin
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
            )}
        </button>
    );
}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(login, null);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-brand-yellow/10 rounded-full">
                            <Lock className="w-8 h-8 text-brand-yellow" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight">Admin Access</h1>
                    <p className="text-white/40 text-sm">Enter your password to access the admin dashboard</p>
                </div>

                {/* Login Form */}
                <form action={formAction} className="space-y-6 bg-neutral-900 border border-white/10 p-8 rounded-lg">
                    <div className="space-y-3">
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-widest text-gray-400">
                            Admin Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            autoFocus
                            placeholder="••••••••"
                            className="w-full bg-black border border-white/10 rounded px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-yellow transition-colors"
                        />
                    </div>

                    {state?.message && (
                        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-400 text-sm font-medium">
                            {state.message}
                        </div>
                    )}

                    <SubmitButton isPending={isPending} />
                </form>

                {/* Footer */}
                <div className="text-center mt-8">
                    <Link href="/" className="text-white/40 hover:text-white text-xs uppercase tracking-widest transition-colors">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
