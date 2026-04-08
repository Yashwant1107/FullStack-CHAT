const LEGACY_AVATAR_HOSTS = new Set(["i.pravatar.cc", "avatar.iran.liara.run"]);

export const generateAvatar = (gender) => {
    const normalizedGender = gender === "female" ? "female" : "male";
    const seed = `${normalizedGender}-${Math.random().toString(36).slice(2, 10)}`;

    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&gender=${normalizedGender}`;
};

export const isLegacyAvatar = (url = "") => {
    try {
        const parsedUrl = new URL(url);

        return LEGACY_AVATAR_HOSTS.has(parsedUrl.hostname);
    } catch {
        return !url;
    }
};

export const isDicebearAvatar = (url = "") => {
    try {
        const parsedUrl = new URL(url);

        return parsedUrl.hostname === "api.dicebear.com" && parsedUrl.pathname === "/7.x/avataaars/svg";
    } catch {
        return false;
    }
};
