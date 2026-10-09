
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Search,
    Heart,
    Bell,
    User,
    Menu,
    X,
    LogOut,
} from "lucide-react";

import { logout as logoutRedux } from "../../features/auth/authSlice";
import { API_URL } from "../../services/api.js";
import {
    fetchNotifications,
    getUnreadNotificationCount,
} from "../../services/notifications.js";

const navItems = [
    { name: "Explore", path: "/home" },
    { name: "My Items", path: "/my-items" },
    { name: "Requests", path: "/requests" },
    { name: "Messages", path: "/chat" },
];

function AuthNavbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user } = useSelector((state) => state.auth);
    const userId = user?._id;

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [notificationItems, setNotificationItems] = useState([]);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [searchText, setSearchText] = useState(
        () => new URLSearchParams(window.location.search).get("q") || ""
    );

    const submitSearch = (event) => {
        event.preventDefault();
        const query = searchText.trim();
        navigate(query ? `/home?q=${encodeURIComponent(query)}` : "/home");
        setIsMenuOpen(false);
    };

    const refreshNotifications = useCallback(async () => {
        if (!userId) {
            setNotificationItems([]);
            setUnreadNotifications(0);
            return;
        }
        try {
            const notifications = await fetchNotifications(userId);
            setNotificationItems(notifications);
            setUnreadNotifications(getUnreadNotificationCount(userId, notifications));
        } catch (error) {
            console.error("Unable to refresh notifications:", error);
        }
    }, [userId]);

    useEffect(() => {
        Promise.resolve().then(refreshNotifications);
        const timer = window.setInterval(refreshNotifications, 30000);
        return () => window.clearInterval(timer);
    }, [refreshNotifications]);

    useEffect(() => {
        const onNotificationsRead = (event) => {
            if (event.detail?.userId !== userId) return;

            const notifications = event.detail.notifications || notificationItems;
            setNotificationItems(notifications);
            setUnreadNotifications(getUnreadNotificationCount(userId, notifications));
        };
        window.addEventListener("swivastu-notifications-read", onNotificationsRead);
        return () => {
            window.removeEventListener("swivastu-notifications-read", onNotificationsRead);
        };
    }, [notificationItems, userId]);

    const handleLogout = async () => {
        try {
            await fetch(`${API_URL}/users/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout Error:", error);
        } finally {
            dispatch(logoutRedux());
            setIsMenuOpen(false);
            navigate("/");
        }
    };

    // Desktop navigation link styling
    const desktopLinkClass = ({ isActive }) =>
        `relative flex h-16 items-center text-sm font-medium transition-colors ${
            isActive
                ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-indigo-600"
                : "text-gray-700 hover:text-indigo-600"
        }`;

    // Mobile navigation link styling
    const mobileLinkClass = ({ isActive }) =>
        `relative rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
            isActive
                ? "bg-indigo-50 text-indigo-600 after:absolute after:bottom-2 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-indigo-600"
                : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
        }`;

    return (
        <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* Logo */}
                <Link
                    to="/home"
                    className="shrink-0 text-2xl font-bold tracking-tight text-gray-900"
                >
                    Swi<span className="text-indigo-600">Vastu</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-7 md:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={desktopLinkClass}
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>

                {/* Desktop Right Side */}
                <div className="hidden items-center gap-3 md:flex">

                    <form onSubmit={submitSearch} role="search" className="flex h-10 items-center gap-2 rounded-full border border-gray-200 px-3 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50">
                        <Search size={17} className="shrink-0 text-gray-500" />
                        <input
                            type="search"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Search items"
                            aria-label="Search items"
                            className="w-28 bg-transparent text-sm outline-none placeholder:text-gray-400 lg:w-36"
                        />
                    </form>

                    {/* Wishlist */}
                    <button
                        type="button"
                        onClick={() => navigate("/wishlist")}
                        className="rounded-full p-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                        title="Wishlist"
                        aria-label="Wishlist"
                    >
                        <Heart size={19} />
                    </button>

                    {/* Notifications */}
                    <button
                        type="button"
                        onClick={() => navigate("/notifications")}
                        className="relative rounded-full p-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-indigo-600"
                        title="Notifications"
                        aria-label={unreadNotifications ? `Notifications, ${unreadNotifications} unread` : "Notifications"}
                    >
                        <Bell size={19} />
                        {unreadNotifications > 0 && (
                            <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                                {unreadNotifications > 99 ? "99+" : unreadNotifications}
                            </span>
                        )}
                    </button>

                    {/* Profile */}
                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            `ml-1 flex items-center gap-2 rounded-full border px-3 py-1.5 transition ${
                                isActive
                                    ? "border-indigo-300 bg-indigo-50"
                                    : "border-gray-200 hover:border-indigo-200 hover:bg-indigo-50"
                            }`
                        }
                    >
                        {user?.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt="Profile"
                                className="h-8 w-8 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                <User size={17} />
                            </div>
                        )}

                        <span className="max-w-25 truncate text-sm font-medium text-gray-700">
                            {user?.fullname?.split(" ")[0] || "Profile"}
                        </span>
                    </NavLink>

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
                        title="Logout"
                        aria-label="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    type="button"
                    onClick={() => setIsMenuOpen((prev) => !prev)}
                    className="rounded-lg p-2 text-gray-700 transition hover:bg-gray-100 md:hidden"
                    aria-label={isMenuOpen ? "Close menu" : "Open menu"}
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
                    <div className="flex flex-col gap-1">
                        <form onSubmit={submitSearch} role="search" className="mb-2 flex h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 focus-within:border-indigo-300">
                            <Search size={18} className="shrink-0 text-gray-500" />
                            <input
                                type="search"
                                value={searchText}
                                onChange={(event) => setSearchText(event.target.value)}
                                placeholder="Search items"
                                aria-label="Search items"
                                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                            />
                            <button type="submit" className="text-sm font-semibold text-indigo-600">Search</button>
                        </form>

                        {/* Mobile Navigation Links */}
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end
                                onClick={() => setIsMenuOpen(false)}
                                className={mobileLinkClass}
                            >
                                {item.name}
                            </NavLink>
                        ))}

                        {/* Wishlist */}
                        <NavLink
                            to="/wishlist"
                            onClick={() => setIsMenuOpen(false)}
                            className={mobileLinkClass}
                        >
                            Wishlist
                        </NavLink>

                        {/* Notifications */}
                        <NavLink
                            to="/notifications"
                            onClick={() => setIsMenuOpen(false)}
                            className={mobileLinkClass}
                        >
                            <span className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-2"><Bell size={17} /> Notifications</span>
                                {unreadNotifications > 0 && (
                                    <span className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                                        {unreadNotifications > 99 ? "99+" : unreadNotifications}
                                    </span>
                                )}
                            </span>
                        </NavLink>

                        {/* Profile */}
                        <NavLink
                            to="/profile"
                            onClick={() => setIsMenuOpen(false)}
                            className={({ isActive }) =>
                                `mt-2 flex items-center gap-3 rounded-lg border px-3 py-3 transition ${
                                    isActive
                                        ? "border-indigo-200 bg-indigo-50"
                                        : "border-gray-200 hover:bg-gray-50"
                                }`
                            }
                        >
                            {user?.profileImage ? (
                                <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="h-9 w-9 rounded-full object-cover"
                                />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                    <User size={18} />
                                </div>
                            )}

                            <span className="text-sm font-medium text-gray-800">
                                {user?.fullname || "My Profile"}
                            </span>
                        </NavLink>

                        {/* Logout */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-red-500 transition hover:bg-red-50"
                        >
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default AuthNavbar;
