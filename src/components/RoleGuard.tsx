"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function RoleGuard({ allowedRoles, children }: { allowedRoles: string[], children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const checkAccess = () => {
            const userStr = localStorage.getItem("urjalink-user");
            if (!userStr) {
                router.push("/login"); // Force login if not authenticated
                return;
            }

            try {
                const user = JSON.parse(userStr);
                // Fallback to user_type alias if role isn't explicitly set yet
                const role = user.role || (user.user_type === "admin" ? "Admin" :
                    user.user_type === "company" ? "Company" : "Customer");

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
    }, [pathname, allowedRoles, router]);

    if (!authorized) return null; // Render completely transparent while resolving

    return <>{children}</>;
}
