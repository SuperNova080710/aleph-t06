"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";

type Props = ComponentProps<typeof Link> & {
    href: string;
};

export function TransitionLink({ href, children, onClick, ...props }: Props) {
    const router = useRouter();

    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;

        // 새 탭/수정 키 클릭은 기본 동작 유지
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
            return;
        }

        e.preventDefault();

        const navigate = () => router.push(href);

        // 브라우저 지원 시 View Transition 실행
        const doc = document as Document & {
            startViewTransition?: (cb: () => void) => void;
        };

        if (typeof doc.startViewTransition === "function") {
            doc.startViewTransition(() => {
                navigate();
            });
        } else {
            navigate();
        }
    };

    return (
        <Link href={href} onClick={handleClick} {...props}>
            {children}
        </Link>
    );
}