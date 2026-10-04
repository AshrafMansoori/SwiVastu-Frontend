import { Link } from "react-router-dom";
import Navbar from "../../components/Layout/LandingNavbar.jsx";
import {
    FaInstagram,
    FaLinkedinIn,
    FaGithub,
    FaXTwitter,
} from "react-icons/fa6";
import {
    ArrowRight,
    ArrowLeftRight,
    ShoppingBag,
    KeyRound,
    Gift,
} from "lucide-react";

function Landing() {
    return (
        <div className="min-h-screen bg-white text-gray-900">

            <Navbar />

            {/* ================= HERO ================= */}
            <section
                id="home"
                className="overflow-hidden bg-gray-50"
            >
                <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 pt-6 pb-20 md:grid-cols-2 md:pt-8 md:pb-22">

                    {/* Left */}
                    <div>

                        <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                            A smarter way to exchange
                        </div>

                        <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
                            Give your unused things
                            <span className="text-blue-600"> a new purpose.</span>
                        </h1>

                        <p className="mt-6 max-w-xl text-lg leading-8 text-gray-600">
                            SwiVastu connects people to buy, sell, exchange, rent,
                            or give away items they no longer need.
                        </p>

                        {/* Buttons */}
                        <div className="mt-8 flex flex-wrap gap-4">

                            <Link
                                to="/home"
                                className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                            >
                                Explore Items

                                <ArrowRight
                                    size={19}
                                    className="transition group-hover:translate-x-1"
                                />
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-xl border border-gray-300 bg-white px-6 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-100"
                            >
                                Get Started
                            </Link>

                        </div>

                        {/* Small Stats */}
                        <div className="mt-10 flex flex-wrap gap-8">

                            <div>
                                <p className="text-2xl font-bold">Buy</p>
                                <p className="text-sm text-gray-500">What you need</p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold">Sell</p>
                                <p className="text-sm text-gray-500">What you don't</p>
                            </div>

                            <div>
                                <p className="text-2xl font-bold">Exchange</p>
                                <p className="text-sm text-gray-500">What you can share</p>
                            </div>

                        </div>

                    </div>

                    {/* Right Hero Visual */}
                    <div className="relative">

                        <div className="relative mx-auto max-w-lg">

                            {/* Main Card */}
                            <div className="rounded-3xl bg-blue-600 p-8 shadow-2xl">

                                <div className="rounded-2xl bg-white p-6">

                                    <div className="flex items-center justify-between">

                                        <div>
                                            <p className="text-sm text-gray-500">
                                                Available near you
                                            </p>

                                            <h3 className="mt-1 text-xl font-bold">
                                                Find what you need
                                            </h3>
                                        </div>

                                        <div className="rounded-xl bg-blue-100 p-3 text-blue-600">
                                            <ShoppingBag size={25} />
                                        </div>

                                    </div>

                                    {/* Fake Item Cards */}
                                    <div className="mt-6 space-y-4">

                                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">

                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 text-2xl">
                                                💻
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-semibold">
                                                    Laptop
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    Like New · Electronics
                                                </p>
                                            </div>

                                            <span className="text-sm font-semibold text-blue-600">
                                                Exchange
                                            </span>

                                        </div>

                                        <div className="flex items-center gap-4 rounded-xl bg-gray-50 p-4">

                                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-100 text-2xl">
                                                🚲
                                            </div>

                                            <div className="flex-1">
                                                <p className="font-semibold">
                                                    Bicycle
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    Good · Vehicles
                                                </p>
                                            </div>

                                            <span className="text-sm font-semibold text-green-600">
                                                Sell
                                            </span>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* Floating Exchange Icon */}
                            <div className="absolute -right-5 -top-5 rounded-2xl bg-white p-4 shadow-xl">
                                <ArrowLeftRight
                                    size={28}
                                    className="text-blue-600"
                                />
                            </div>

                        </div>

                    </div>

                </div>
            </section>


            {/* ================= HOW IT WORKS ================= */}
            <section
                id="how-it-works"
                className="px-6 py-24"
            >

                <div className="mx-auto max-w-7xl">

                    <div className="mx-auto max-w-2xl text-center">

                        <p className="font-semibold text-blue-600">
                            Simple Process
                        </p>

                        <h2 className="mt-3 text-4xl font-bold">
                            How SwiVastu Works
                        </h2>

                        <p className="mt-4 text-gray-600">
                            Turn unused items into something useful in just a few steps.
                        </p>

                    </div>


                    <div className="mt-16 grid gap-6 md:grid-cols-3">

                        <WorkCard
                            number="01"
                            title="List"
                            description="Add your item, upload photos and choose whether you want to sell, exchange, rent or give it away."
                        />

                        <WorkCard
                            number="02"
                            title="Discover"
                            description="Explore items around you and find something that matches your needs."
                        />

                        <WorkCard
                            number="03"
                            title="Connect & Exchange"
                            description="Send a request, connect with the owner and complete your transaction."
                        />

                    </div>

                </div>

            </section>


            {/* ================= WHAT YOU CAN DO ================= */}
            <section className="bg-gray-50 px-6 py-24">

                <div className="mx-auto max-w-7xl">

                    <div className="text-center">

                        <p className="font-semibold text-blue-600">
                            One Platform
                        </p>

                        <h2 className="mt-3 text-4xl font-bold">
                            Do More With Your Items
                        </h2>

                    </div>


                    <div className="mt-14 grid gap-6 md:grid-cols-4">

                        <ActionCard
                            icon={<ShoppingBag size={28} />}
                            title="Buy"
                            description="Find useful items at great prices."
                        />

                        <ActionCard
                            icon={<ArrowLeftRight size={28} />}
                            title="Exchange"
                            description="Trade your item for something you need."
                        />

                        <ActionCard
                            icon={<KeyRound size={28} />}
                            title="Rent"
                            description="Rent items instead of buying them."
                        />

                        <ActionCard
                            icon={<Gift size={28} />}
                            title="Give Away"
                            description="Give unused items a second life."
                        />

                    </div>

                </div>

            </section>


            {/* ================= CATEGORIES ================= */}
            <section
                id="categories"
                className="px-6 py-24"
            >

                <div className="mx-auto max-w-7xl">

                    <div className="text-center">

                        <p className="font-semibold text-blue-600">
                            Explore
                        </p>

                        <h2 className="mt-3 text-4xl font-bold">
                            Popular Categories
                        </h2>

                    </div>


                    <div className="mt-14 grid grid-cols-2 gap-5 md:grid-cols-4">

                        <Category icon="💻" name="Electronics" />
                        <Category icon="📚" name="Books" />
                        <Category icon="🚲" name="Vehicles" />
                        <Category icon="🛋️" name="Furniture" />
                        <Category icon="👕" name="Fashion" />
                        <Category icon="🎮" name="Gaming" />
                        <Category icon="🏠" name="Home" />
                        <Category icon="📦" name="Other" />

                    </div>

                </div>

            </section>


            {/* ================= WHY SWIVASTU ================= */}
            <section
                id="why-swivastu"
                className="bg-gray-50 px-6 py-24"
            >

                <div className="mx-auto max-w-7xl">

                    <div className="grid gap-14 md:grid-cols-2 md:items-center">

                        <div>

                            <p className="font-semibold text-blue-600">
                                Why SwiVastu?
                            </p>

                            <h2 className="mt-3 text-4xl font-bold leading-tight">
                                More than a marketplace.
                                <br />
                                It's a community.
                            </h2>

                            <p className="mt-6 leading-8 text-gray-600">
                                SwiVastu is designed to make exchanging and reusing
                                items simple, convenient and trustworthy.
                            </p>

                        </div>


                        <div className="grid gap-5 sm:grid-cols-2">

                            <Benefit
                                title="Nearby Items"
                                description="Discover items available around your location."
                            />

                            <Benefit
                                title="Multiple Options"
                                description="Buy, sell, exchange, rent or give away."
                            />

                            <Benefit
                                title="Trusted Users"
                                description="Build trust through profiles and reviews."
                            />

                            <Benefit
                                title="Simple Experience"
                                description="A clean and easy way to connect with people."
                            />

                        </div>

                    </div>

                </div>

            </section>



            {/* ================= About ================= */}
            <section
                id="about"
                className="bg-gray-50 px-6 py-24 md:py-32"
            >
                <div className="mx-auto max-w-7xl">

                    {/* Main Heading */}
                    <div className="mx-auto max-w-4xl text-center">

                        <p className="font-semibold text-blue-600">
                            Why SwiVastu?
                        </p>

                        <h2 className="mt-3 text-4xl font-bold leading-tight text-gray-900 md:text-6xl">
                            What if the things we
                            <span className="text-blue-600"> don't need</span>
                            could help someone else?
                        </h2>

                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Every day, useful products are left unused, stored away,
                            or eventually thrown away simply because their owners
                            no longer need them.
                        </p>

                        <p className="mt-4 text-lg leading-8 text-gray-600">
                            SwiVastu gives those products another opportunity by
                            connecting people who have something with people who
                            need it.
                        </p>

                    </div>


                    {/* Real World Evidence */}
                    <div className="mt-20">

                        <div className="mb-10">

                            <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                The real-world problem
                            </p>

                            <h3 className="mt-2 text-3xl font-bold text-gray-900 md:text-4xl">
                                The amount of waste is massive.
                            </h3>

                            <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-600">
                                Around the world, huge amounts of materials and products
                                enter waste streams every year. Extending the useful life
                                of products through reuse can help reduce unnecessary waste.
                            </p>

                        </div>


                        {/* Evidence Cards */}
                        <div className="grid gap-6 md:grid-cols-2">

                            {/* Textile */}
                            <div className="rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">

                                <p className="text-5xl font-bold text-blue-600">
                                    92M
                                </p>

                                <h4 className="mt-3 text-xl font-bold text-gray-900">
                                    tonnes of textile waste every year
                                </h4>

                                <p className="mt-4 leading-7 text-gray-600">
                                    Around 92 million tonnes of textile waste are generated
                                    globally every year. Clothes that are no longer wanted
                                    by one person can potentially continue to be useful
                                    to someone else.
                                </p>

                                <div className="mt-6 border-t border-gray-100 pt-4">
                                    <p className="text-xs text-gray-400">
                                        Source: United Nations Environment Programme
                                    </p>
                                </div>

                            </div>


                            {/* E-Waste */}
                            <div className="rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">

                                <p className="text-5xl font-bold text-blue-600">
                                    1M+
                                </p>

                                <h4 className="mt-3 text-xl font-bold text-gray-900">
                                    tonnes of e-waste generated in India
                                </h4>

                                <p className="mt-4 leading-7 text-gray-600">
                                    India's estimated e-waste generation from notified
                                    electrical and electronic equipment reached about
                                    1.01 million tonnes in 2019–20. Some electronics may
                                    still be usable, repairable, or valuable to another user
                                    before becoming waste.
                                </p>

                                <div className="mt-6 border-t border-gray-100 pt-4">
                                    <p className="text-xs text-gray-400">
                                        Source: Central Pollution Control Board
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>


                    {/* SwiVastu Approach */}
                    <div className="mt-24 grid gap-12 lg:grid-cols-2 lg:items-center">

                        {/* Left Content */}
                        <div>

                            <p className="font-semibold text-blue-600">
                                Our Approach
                            </p>

                            <h3 className="mt-3 text-4xl font-bold leading-tight text-gray-900 md:text-5xl">
                                Don't throw it away.
                                <br />
                                <span className="text-blue-600">
                                    Pass it on.
                                </span>
                            </h3>

                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                A laptop you no longer use could help another student.
                                A bicycle sitting unused in your garage could be useful
                                to someone nearby.
                            </p>

                            <p className="mt-5 text-lg leading-8 text-gray-600">
                                Books, furniture, clothes, electronics and many other
                                products can continue their journey instead of remaining
                                unused.
                            </p>

                            <p className="mt-5 text-lg leading-8 text-gray-600">
                                SwiVastu makes it easier to list, discover and exchange
                                these products with people who actually need them.
                            </p>

                        </div>


                        {/* SwiVastu Cycle */}
                        <div className="rounded-3xl bg-blue-600 p-8 text-white md:p-10">

                            <p className="text-sm font-semibold uppercase tracking-wider text-blue-200">
                                The SwiVastu Cycle
                            </p>

                            <h4 className="mt-3 text-2xl font-bold">
                                Give useful things another chance.
                            </h4>


                            <div className="mt-8 space-y-4">

                                {/* Step 01 */}
                                <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
                                        01
                                    </div>

                                    <div>
                                        <p className="font-semibold">
                                            You stop using an item
                                        </p>

                                        <p className="mt-1 text-sm text-blue-100">
                                            It is still useful, but no longer useful to you.
                                        </p>
                                    </div>

                                </div>


                                {/* Step 02 */}
                                <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
                                        02
                                    </div>

                                    <div>
                                        <p className="font-semibold">
                                            You list it on SwiVastu
                                        </p>

                                        <p className="mt-1 text-sm text-blue-100">
                                            Add your item and choose how you want to pass it on.
                                        </p>
                                    </div>

                                </div>


                                {/* Step 03 */}
                                <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
                                        03
                                    </div>

                                    <div>
                                        <p className="font-semibold">
                                            Someone discovers it
                                        </p>

                                        <p className="mt-1 text-sm text-blue-100">
                                            Another person finds something they actually need.
                                        </p>
                                    </div>

                                </div>


                                {/* Step 04 */}
                                <div className="flex items-center gap-4 rounded-xl bg-white/10 p-4">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600">
                                        04
                                    </div>

                                    <div>
                                        <p className="font-semibold">
                                            The item gets a new life
                                        </p>

                                        <p className="mt-1 text-sm text-blue-100">
                                            A useful product continues to serve someone else.
                                        </p>
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="px-6 py-10 md:py-12">
                <div className="mx-auto max-w-5xl">

                    <div className="relative overflow-hidden rounded-2xl bg-blue-600 px-5 py-7 md:px-8 md:py-8">

                        {/* Background Decoration */}
                        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

                        <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10" />

                        {/* Content */}
                        <div className="relative mx-auto max-w-xl text-center">

                            <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-100">
                                Start with SwiVastu
                            </p>

                            <h2 className="mt-2 text-2xl font-bold leading-tight text-white md:text-3xl">
                                Have something you don't need anymore?
                            </h2>

                            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-blue-100 md:text-base">
                                Don't let useful things sit unused. List them on
                                SwiVastu and give someone else the opportunity to use them.
                            </p>

                            {/* Buttons */}
                            <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">

                                <Link
                                    to="/register"
                                    className="w-full rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-blue-600 transition hover:bg-gray-100 sm:w-auto"
                                >
                                    Get Started
                                </Link>

                                <Link
                                    to="/home"
                                    className="w-full rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-white/20 sm:w-auto"
                                >
                                    Explore SwiVastu
                                </Link>

                            </div>

                            <p className="mt-4 text-[11px] text-blue-100">
                                Exchange • Buy • Rent • Give Away
                            </p>

                        </div>

                    </div>

                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer className="border-t border-gray-200 bg-white px-6 py-12">
                <div className="mx-auto max-w-7xl">

                    <div className="grid gap-10 md:grid-cols-4">

                        {/* Brand */}
                        <div className="md:col-span-1">

                            <Link
                                to="/"
                                className="text-2xl font-bold text-blue-600"
                            >
                                SwiVastu
                            </Link>

                            <p className="mt-4 max-w-xs text-sm leading-6 text-gray-600">
                                Give useful things another chance. Exchange, buy,
                                rent, or give away products with people who need them.
                            </p>

                        </div>


                        {/* Explore */}
                        <div>

                            <h3 className="text-sm font-semibold text-gray-900">
                                Explore
                            </h3>

                            <div className="mt-4 flex flex-col gap-3">

                                <a
                                    href="#home"
                                    className="text-sm text-gray-600 transition hover:text-blue-600"
                                >
                                    Home
                                </a>

                                <a
                                    href="#how-it-works"
                                    className="text-sm text-gray-600 transition hover:text-blue-600"
                                >
                                    How It Works
                                </a>

                                <a
                                    href="#categories"
                                    className="text-sm text-gray-600 transition hover:text-blue-600"
                                >
                                    Categories
                                </a>

                                <a
                                    href="#about"
                                    className="text-sm text-gray-600 transition hover:text-blue-600"
                                >
                                    About
                                </a>

                            </div>

                        </div>


                        {/* Account */}
                        <div>

                            <h3 className="text-sm font-semibold text-gray-900">
                                Account
                            </h3>

                            <div className="mt-4 flex flex-col gap-3">

                                <Link
                                    to="/login"
                                    className="text-sm text-gray-600 transition hover:text-blue-600"
                                >
                                    Login
                                </Link>

                                <Link
                                    to="/register"
                                    className="text-sm text-gray-600 transition hover:text-blue-600"
                                >
                                    Create Account
                                </Link>

                                <Link
                                    to="/home"
                                    className="text-sm text-gray-600 transition hover:text-blue-600"
                                >
                                    Explore Items
                                </Link>

                            </div>

                        </div>


                        {/* Social */}
                        <div>

                            <h3 className="text-sm font-semibold text-gray-900">
                                Follow Us
                            </h3>

                            <p className="mt-4 text-sm leading-6 text-gray-600">
                                Stay connected with SwiVastu.
                            </p>

                            <div className="mt-5 flex gap-3">

                                <a
                                    href="#"
                                    aria-label="Instagram"
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                    <FaInstagram size={18} />
                                </a>

                                <a
                                    href="#"
                                    aria-label="LinkedIn"
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                    <FaLinkedinIn size={18} />
                                </a>

                                <a
                                    href="#"
                                    aria-label="GitHub"
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                    <FaGithub size={18} />
                                </a>

                                <a
                                    href="#"
                                    aria-label="X"
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                    <FaXTwitter size={18} />
                                </a>

                            </div>

                        </div>

                    </div>


                    {/* Bottom */}
                    <div className="mt-10 flex flex-col gap-3 border-t border-gray-200 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">

                        <p>
                            © {new Date().getFullYear()} SwiVastu. All rights reserved.
                        </p>

                        <p>
                            Give useful things a new life.
                        </p>

                    </div>

                </div>
            </footer>

        </div>
    );
}


/* ================= COMPONENTS ================= */

function WorkCard({ number, title, description }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

            <span className="text-sm font-bold text-blue-600">
                {number}
            </span>

            <h3 className="mt-5 text-2xl font-bold">
                {title}
            </h3>

            <p className="mt-3 leading-7 text-gray-600">
                {description}
            </p>

        </div>
    );
}


function ActionCard({ icon, title, description }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                {icon}
            </div>

            <h3 className="text-xl font-bold">
                {title}
            </h3>

            <p className="mt-3 leading-7 text-gray-600">
                {description}
            </p>

        </div>
    );
}


function Category({ icon, name }) {
    return (
        <div className="cursor-pointer rounded-2xl border border-gray-200 bg-white p-8 text-center transition hover:-translate-y-1 hover:shadow-lg">

            <div className="text-4xl">
                {icon}
            </div>

            <h3 className="mt-4 font-semibold">
                {name}
            </h3>

        </div>
    );
}


function Benefit({ title, description }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">

            <h3 className="font-bold">
                {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-600">
                {description}
            </p>

        </div>
    );
}


export default Landing;