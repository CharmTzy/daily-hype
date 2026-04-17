export const DEFAULT_PROFILE_IMAGE = "/icons/avatar-placeholder.svg";

export function normaliseProfileImage(image?: string | null) {
    if (!image || image === "/customer" || image === "/admin" || image === "http://ssl.gstatic.com/accounts/ui/avatar_2x.png") {
        return DEFAULT_PROFILE_IMAGE;
    }
    return image;
}
