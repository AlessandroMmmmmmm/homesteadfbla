"use client";
import Image from "next/image";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import background from "../../../public/static/officers.jpg";
import Link from "next/link";

export default function Competition() {
  return (
    <>
      <Image
        src={background}
        className="fixed blur-sm bg-scroll object-cover opacity-10 h-[100vh] z-[-10]"
        draggable={false}
      />
      <Nav />
      <main className="flex flex-col items-center justify-center py-8 px-4 pt-20 text-white">
        <div className="w-full lg:w-3/4">
          <div className="bg-watermelon-red bg-opacity-50 text-white font-semibold rounded-xl flex flex-col items-center justify-center p-8 shadow-lg">
            <h1 className="text-4xl md:text-5xl mb-4 font-bold text-center">
              Competitive Information
            </h1>
            <p className="text-xl md:text-2xl font-normal max-w-3xl text-center text-gray-300">
              Learn more about our competitive history, upcoming events, and
              resources to help you succeed in FBLA competitions.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-1 justify-items-center mt-10">
            {/** Grid Items */}
            <Link href="/compHistory" className="w-full">
              <div className="bg-red-violet bg-opacity-40 p-8 rounded-xl shadow-md border-2 border-red-violet flex items-center justify-center h-full transform hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-r from-red-800 to-watermelon-red transition-all duration-500 ease-in-out cursor-pointer text-center">
                <span className="text-xl font-semibold text-white">
                  Competitive History
                </span>
              </div>
            </Link>

            {/* <Link href="/countdown" className="w-full">
              <div className="bg-red-violet bg-opacity-40 p-8 rounded-xl shadow-md border-2 border-red-violet flex items-center justify-center h-full transform hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-r from-red-800 to-watermelon-red transition-all duration-500 ease-in-out cursor-pointer text-center">
                <span className="text-xl font-semibold text-white">
                  Tryout Countdown
                </span>
              </div>
            </Link> */}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}