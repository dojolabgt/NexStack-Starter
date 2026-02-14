import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/image-utils";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    user?: {
        name?: string;
        profileImage?: string;
    } | null;
    size?: "sm" | "default" | "lg" | "xl";
    className?: string;
    fallbackClassName?: string;
}

const sizeClasses = {
    sm: "h-6 w-6",
    default: "h-9 w-9",
    lg: "h-10 w-10",
    xl: "h-28 w-28",
};

const fallbackTextSizes = {
    sm: "text-xs",
    default: "text-xs",
    lg: "text-sm",
    xl: "text-3xl",
};

/**
 * UserAvatar Component
 * 
 * A wrapper around shadcn/ui Avatar that handles user profile images
 * with automatic fallback to user initials.
 * 
 * @example
 * ```tsx
 * <UserAvatar 
 *   user={user} 
 *   size="default" 
 *   className="border border-gray-200"
 *   fallbackClassName="bg-zinc-900 text-white"
 * />
 * ```
 */
export function UserAvatar({
    user,
    size = "default",
    className,
    fallbackClassName,
}: UserAvatarProps) {
    const userName = user?.name || "User";
    const userImage = user?.profileImage;

    // Get first letter of name for fallback
    const fallbackText = userName.charAt(0).toUpperCase();

    return (
        <Avatar
            className={cn(sizeClasses[size], className)}
            size={size === "sm" ? "sm" : size === "lg" ? "lg" : "default"}
        >
            <AvatarImage
                src={getImageUrl(userImage)}
                alt={`${userName} Avatar`}
            />
            <AvatarFallback
                className={cn(
                    fallbackTextSizes[size],
                    fallbackClassName
                )}
            >
                {fallbackText}
            </AvatarFallback>
        </Avatar>
    );
}
