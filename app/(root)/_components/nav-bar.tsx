"use client"

import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
} from "@/components/ui/navigation-menu"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { signOut, useSession } from "@/lib/auth-client"
import { usePathname, useRouter } from "next/navigation"
import { User } from "lucide-react"

// Simple logo component for the navbar
const Logo = (props: React.SVGAttributes<SVGElement>) => {
    return (
        <svg
            aria-label="Logo"
            role="img"
            fill="none"
            height="1em"
            viewBox="0 0 324 323"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
            {...(props as any)}
        >
            <rect fill="currentColor" height="323" rx="161.5" width="323" x="0.5" />
            <circle cx="162" cy="161.5" fill="white" r="60" className="dark:fill-black" />
        </svg>
    )
}

// Hamburger icon component
const HamburgerIcon = ({ className, ...props }: React.SVGAttributes<SVGElement>) => (
    <svg
        aria-label="Menu"
        className={cn("pointer-events-none", className)}
        fill="none"
        height={16}
        role="img"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={16}
        xmlns="http://www.w3.org/2000/svg"
        {...(props as any)}
    >
        <path
            className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
            d="M4 12L20 12"
        />
        <path
            className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
            d="M4 12H20"
        />
        <path
            className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
            d="M4 12H20"
        />
    </svg>
)

// Types
export interface NavbarNavLink {
    href: string
    label: string
    active?: boolean
}

export interface ServerSessionUser {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
    serverSession?: { user: ServerSessionUser } | null
    logo?: React.ReactNode
    logoHref?: string
    navigationLinks?: NavbarNavLink[]
    signInText?: string
    signInHref?: string
    ctaText?: string
    ctaHref?: string
    onSignInClick?: () => void
    onCtaClick?: () => void
}

// Default navigation links (active state derived from pathname in component)
const defaultNavigationLinks: NavbarNavLink[] = [
    { href: "/", label: "Home" },
    { href: "/courts", label: "Courts" },
    { href: "/sessions", label: "Sessions" },
    
]

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
    (
        {
            className,
            serverSession = null,
            logo = <Logo />,
            logoHref = "/",
            navigationLinks = defaultNavigationLinks,
            signInText = "Sign In",
            signInHref = "/login",
            ctaText = "Get Started",
            ctaHref = "/signup",
            onSignInClick,
            onCtaClick,
            ...props
        },
        ref,
    ) => {
        const [isMobile, setIsMobile] = useState(false)
        const [logoError, setLogoError] = useState(false)
        const containerRef = useRef<HTMLElement>(null)

        const session = useSession()
        const router = useRouter()
        const pathname = usePathname()
        const isSignedIn = !!(serverSession ?? session?.data)

        const isLinkActive = (href: string) =>
            href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

        useEffect(() => {
            const checkWidth = () => {
                if (containerRef.current) {
                    const width = containerRef.current.offsetWidth
                    setIsMobile(width < 768) // 768px is md breakpoint
                }
            }

            checkWidth()

            const resizeObserver = new ResizeObserver(checkWidth)
            if (containerRef.current) {
                resizeObserver.observe(containerRef.current)
            }

            return () => {
                resizeObserver.disconnect()
            }
        }, [])

        // Combine refs
        const combinedRef = React.useCallback(
            (node: HTMLElement | null) => {
                containerRef.current = node
                if (typeof ref === "function") {
                    ref(node)
                } else if (ref) {
                    ref.current = node
                }
            },
            [ref],
        )

        return (
            <header
                className={cn(
                    "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6 [&_*]:no-underline",
                    className,
                )}
                ref={combinedRef}
                {...(props as any)}
            >
                <div className="container mx-auto flex h-16 max-w-screen-2xl items-center justify-between gap-4">
                    {/* Left side */}
                    <div className="flex items-center gap-2">
                        {/* Mobile menu trigger */}
                        {isMobile && (
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        className="group h-9 w-9 hover:bg-accent hover:text-accent-foreground"
                                        size="icon"
                                        variant="ghost"
                                    >
                                        <HamburgerIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-48 p-2">
                                    <NavigationMenu className="max-w-none">
                                        <NavigationMenuList className="flex-col items-start gap-1">
                                            {navigationLinks.map((link, index) => (
                                                <Link href={link.href} key={index}>
                                                    <NavigationMenuItem className="w-full" key={index}>
                                                        <button
                                                            type="button"
                                                            className={cn(
                                                                "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 hover:bg-accent hover:text-accent-foreground cursor-pointer no-underline",
                                                                isLinkActive(link.href)
                                                                    ? "bg-accent text-accent-foreground"
                                                                    : "text-foreground/80",
                                                            )}
                                                        >
                                                            {link.label}
                                                        </button>
                                                    </NavigationMenuItem>
                                                </Link>
                                            ))}
                                        </NavigationMenuList>
                                    </NavigationMenu>
                                </PopoverContent>
                            </Popover>
                        )}
                        {/* Main nav */}
                        <div className="flex items-center gap-6">
                            {/* <button
                                type="button"
                                className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors cursor-pointer"
                                onClick={e => e.preventDefault()}
                            >
                                <div className="text-2xl">{logo}</div>
                                <span className="hidden font-bold text-xl sm:inline-block">BAM B(ball)</span>
                            </button> */}
                            <Button asChild variant="ghost" className="transition-colors duration-200">
                                <Link href="/" className="flex items-center gap-2">
                                    {!logoError ? (
                                        <img
                                            src="/logo.png"
                                            alt="BamBi"
                                            className="h-8 w-8 object-contain"
                                            onError={() => setLogoError(true)}
                                        />
                                    ) : (
                                        <div className="text-2xl">{logo}</div>
                                    )}
                                    <span className="text-xl font-semibold">BamBi</span>
                                </Link>
                            </Button>
                            {/* Navigation menu */}
                            {!isMobile && (
                                <NavigationMenu className="flex">
                                    <NavigationMenuList className="gap-1">
                                        {navigationLinks.map((link, index) => (
                                            <Link href={link.href} key={index}>
                                                <NavigationMenuItem key={index}>
                                                    <button
                                                        type="button"
                                                        className={cn(
                                                            "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer no-underline",
                                                            isLinkActive(link.href)
                                                                ? "bg-accent text-accent-foreground"
                                                                : "text-foreground/80 hover:text-foreground",
                                                        )}
                                                    >
                                                        {link.label}
                                                    </button>
                                                </NavigationMenuItem>
                                            </Link>
                                        ))}
                                    </NavigationMenuList>
                                </NavigationMenu>
                            )}
                        </div>
                    </div>
                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        {session.data && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full h-9 w-9 transition-colors duration-200"
                                        aria-label="Profile menu"
                                    >
                                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground ring-1 ring-border">
                                            <User className="h-4 w-4" />
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="min-w-[160px]">
                                    <DropdownMenuItem disabled className="text-muted-foreground">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onClick={async () => {
                                            await signOut({
                                                fetchOptions: {
                                                    onSuccess: () => {
                                                        router.push("/login");
                                                    },
                                                },
                                            });
                                        }}
                                    >
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                        {!session.data && (
                            <Button
                                variant="ghost"
                                asChild
                            >
                                <Link href={signInHref}>
                                    {signInText}
                                </Link>
                            </Button>
                        )}
                        {!session.data && (
                            <Button asChild>
                                <Link href={ctaHref}>
                                    {ctaText}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </header>
        )
    },
)

Navbar.displayName = "Navbar"

export { Logo, HamburgerIcon }

// Demo
export function Demo() {
    return (
        <div className="fixed inset-0">
            <Navbar />
        </div>
    )
}
