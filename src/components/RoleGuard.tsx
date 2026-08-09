"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function RoleGuard({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push("/login");
                return;
            }

            try {
                const userExt = session.user.user_metadata;
                // Default to Customer if individual, Company if company, etc.
                const role = userExt.user_type === "admin" ? "Admin" :
                    userExt.user_type === "company" ? "Company" : "Customer";

                if (allowedRoles.includes("All") || allowedRoles.includes(role) || role === "SuperAdmin") {
                    setAuthorized(true);
                } else {
                    router.push("/"); // Redirect home if unauthorized
                }
            } catch (e) {
                router.push("/login");
            }
        };

        checkAccess();

        // Listen for logouts to kick users out interactively
        const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                router.push("/login");
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        }
    }, [pathname, allowedRoles, router]);

    if (!authorized) return null; // Render transparent while checking

    return <>{children}</>;
}
