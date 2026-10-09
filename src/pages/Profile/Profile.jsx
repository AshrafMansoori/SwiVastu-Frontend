import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Camera, Check, LockKeyhole, MapPin, Save, UserRound } from "lucide-react";

import AuthNavbar from "../../components/Layout/AuthNavbar.jsx";
import { getCurrentUser } from "../../features/auth/authSlice.js";
import { apiRequest } from "../../services/api.js";

export default function Profile() {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);
    const avatarInput = useRef(null);
    const [fullname, setFullname] = useState(user?.fullname || "");
    const [email, setEmail] = useState(user?.email || "");
    const [contactNumber, setContactNumber] = useState(user?.contactNumber || "");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileNotice, setProfileNotice] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordNotice, setPasswordNotice] = useState("");

    async function submitProfile(event) {
        event.preventDefault();
        setProfileError("");
        setProfileNotice("");
        const normalizedName = fullname.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedContact = contactNumber.trim();

        if (!normalizedName) {
            setProfileError("Enter your name.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setProfileError("Enter a valid email address.");
            return;
        }
        if (normalizedContact && !/^\d{10}$/.test(normalizedContact)) {
            setProfileError("Contact number must contain exactly 10 digits.");
            return;
        }

        setSavingProfile(true);
        try {
            if (normalizedName !== (user?.fullname || "")) {
                await apiRequest("/users/update-fullname", {
                    method: "PATCH",
                    body: { fullname: normalizedName },
                });
            }
            if (normalizedEmail !== (user?.email || "").toLowerCase()) {
                await apiRequest("/users/update-email", {
                    method: "PATCH",
                    body: { email: normalizedEmail },
                });
            }
            if (normalizedContact && normalizedContact !== (user?.contactNumber || "")) {
                await apiRequest("/users/update-contact-number", {
                    method: "PATCH",
                    body: { contactNumber: normalizedContact },
                });
            }
            await dispatch(getCurrentUser()).unwrap();
            setProfileNotice("Your profile has been updated.");
        } catch (error) {
            setProfileError(error.message || "Unable to update your profile.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function updateAvatar(event) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setProfileError("Choose a JPG, PNG, or WEBP image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setProfileError("Profile photo must be 5 MB or smaller.");
            return;
        }

        setProfileError("");
        setProfileNotice("");
        setUploadingAvatar(true);
        try {
            const form = new FormData();
            form.append("avatar", file);
            await apiRequest("/users/update-profile-image", {
                method: "PATCH",
                body: form,
            });
            await dispatch(getCurrentUser()).unwrap();
            setProfileNotice("Your profile photo has been updated.");
        } catch (error) {
            setProfileError(error.message || "Unable to upload your photo.");
        } finally {
            setUploadingAvatar(false);
        }
    }

    async function submitPassword(event) {
        event.preventDefault();
        setPasswordError("");
        setPasswordNotice("");

        if (newPassword.length < 8) {
            setPasswordError("Choose a new password with at least 8 characters.");
            return;
        }
        if (oldPassword === newPassword) {
            setPasswordError("Your new password must be different.");
            return;
        }

        setSavingPassword(true);
        try {
            const result = await apiRequest("/users/change-password", {
                method: "POST",
                body: { oldPassword, newPassword },
            });
            setPasswordNotice(result?.message || "Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
        } catch (error) {
            setPasswordError(error.message || "Unable to update password.");
        } finally {
            setSavingPassword(false);
        }
    }

    const initial = (user?.fullname || "U").trim().charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50">
            <AuthNavbar />
            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Account settings</p>
                    <h1 className="mt-2 text-3xl font-extrabold text-slate-950">Your profile</h1>
                    <p className="mt-2 text-sm text-slate-600">Keep your details current so your community knows who they are connecting with.</p>
                </div>

                <div className="mt-7 grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                        <div className="relative mx-auto h-28 w-28">
                            {user?.profileImage ? (
                                <img src={user.profileImage} alt={`${user?.fullname || "Your"} profile`} className="h-28 w-28 rounded-full border border-slate-200 object-cover" />
                            ) : (
                                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-50 text-4xl font-bold text-blue-700">{initial}</div>
                            )}
                            <button
                                type="button"
                                onClick={() => avatarInput.current?.click()}
                                disabled={uploadingAvatar}
                                aria-label="Change profile photo"
                                className="absolute bottom-0 right-0 rounded-full bg-blue-700 p-2.5 text-white shadow hover:bg-blue-800 disabled:opacity-60"
                            >
                                <Camera size={17} />
                            </button>
                            <input ref={avatarInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" onChange={updateAvatar} />
                        </div>
                        <h2 className="mt-4 text-lg font-bold text-slate-900">{user?.fullname || "SwiVastu member"}</h2>
                        <p className="mt-1 break-all text-sm text-slate-500">{user?.email || ""}</p>
                        <div className="mt-5 grid grid-cols-2 gap-3 text-left">
                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">Trust score</p>
                                <p className="mt-1 font-bold text-slate-900">{Number(user?.trustScore || 0).toFixed(1)} / 5</p>
                            </div>
                            <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">Member</p>
                                <p className="mt-1 font-bold text-slate-900">{user?.isVerified ? "Verified" : "Community"}</p>
                            </div>
                        </div>
                        {uploadingAvatar && <p className="mt-3 text-xs font-medium text-blue-700">Uploading photo…</p>}
                    </aside>

                    <div className="space-y-5">
                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-3">
                                <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700"><UserRound size={19} /></span>
                                <div>
                                    <h2 className="font-bold text-slate-900">Personal information</h2>
                                    <p className="text-xs text-slate-500">Edit your account details.</p>
                                </div>
                            </div>
                            {profileError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{profileError}</p>}
                            {profileNotice && <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"><Check size={16} />{profileNotice}</p>}
                            <form onSubmit={submitProfile} className="mt-5 space-y-4">
                                <div>
                                    <label htmlFor="profile-fullname" className="form-label">Full name</label>
                                    <input id="profile-fullname" className="form-input" value={fullname} onChange={(event) => setFullname(event.target.value)} maxLength={100} required autoComplete="name" />
                                </div>
                                <div>
                                    <label htmlFor="profile-email" className="form-label">Email</label>
                                    <input id="profile-email" className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required autoComplete="email" />
                                </div>
                                <div>
                                    <label htmlFor="profile-contact" className="form-label">10-digit contact number</label>
                                    <input id="profile-contact" className="form-input" type="tel" inputMode="numeric" value={contactNumber} onChange={(event) => setContactNumber(event.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} autoComplete="tel" />
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <MapPin size={16} className="shrink-0 text-blue-700" />
                                        {user?.locationName || "Location not set"}
                                    </div>
                                </div>
                                <button type="submit" disabled={savingProfile} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 sm:w-auto">
                                    <Save size={16} />{savingProfile ? "Saving…" : "Save changes"}
                                </button>
                            </form>
                        </section>

                        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                            <div className="flex items-center gap-3">
                                <span className="rounded-xl bg-violet-50 p-2.5 text-violet-700"><LockKeyhole size={19} /></span>
                                <div>
                                    <h2 className="font-bold text-slate-900">Password & security</h2>
                                    <p className="text-xs text-slate-500">Use a strong password you do not use elsewhere.</p>
                                </div>
                            </div>
                            {passwordError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{passwordError}</p>}
                            {passwordNotice && <p role="status" className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{passwordNotice}</p>}
                            <form onSubmit={submitPassword} className="mt-5 space-y-4">
                                <div>
                                    <label htmlFor="old-password" className="form-label">Current password</label>
                                    <input id="old-password" className="form-input" type="password" value={oldPassword} onChange={(event) => setOldPassword(event.target.value)} autoComplete="current-password" required />
                                </div>
                                <div>
                                    <label htmlFor="new-password" className="form-label">New password</label>
                                    <input id="new-password" className="form-input" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} autoComplete="new-password" required />
                                </div>
                                <button type="submit" disabled={savingPassword} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 sm:w-auto">
                                    <LockKeyhole size={16} />{savingPassword ? "Updating…" : "Update password"}
                                </button>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
