import Nav from "@/components/nav";
import Image from "next/image";
import officersPic from "../../../public/static/officers.jpg"
import Footer from "@/components/footer";
import pressData from "../../data/press.js";
import PDFCard from "@/components/PDFCard";
import Link from "next/link";
import { BiRightArrowAlt } from "react-icons/bi";

export default function Press() {
  return (
    <main>
      <Image src={officersPic} className="fixed blur-sm bg-scroll object-cover opacity-10 h-[100vh] 
       z-[-10]" draggable={false}/>
       <Nav />
      <div className="border-2 border-dark-chocolate bg-dark-chocolate p-8 m-10 rounded-xl bg-opacity-30">
        <h1 className="text-3xl font-bold">Press</h1>
        <p className="mt-2 mb-4 text-lg">View our past press releases below. For any press related inquiries, email <Link href="mailto:chloewangconnect@gmail.com" className="text-watermelon-red underline inline">chloewangconnect@gmail.com</Link> and our press team will reach out to you within 48 hours.</p>
        {/* <Link href="https://linktr.ee/HHS_FBLA_Press" className="text-warm-beige text-lg px-4 group py-2 font-semibold bg-watermelon-red bg-opacity-85 mt-2
        rounded-md hover:brightness-[1.15] ease-linear duration-150 flex flex-row w-fit" target ="_blank">
          View Linktree
          <BiRightArrowAlt className="mt-[5px] scale-[1.25] ml-1 group-hover:translate-x-1 ease-linear duration-150" />
        </Link> */}

      </div>
      {/* <div className="border-2 border-dark-chocolate bg-dark-chocolate p-10 mb-10 mx-10 rounded-b-xl bg-opacity-30">
        <h1 className="text-3xl font-bold mb-3">Press Linktree</h1>
      </div> */}
      <div className="px-10 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4">
        {pressData.map((press) => (
           <PDFCard key={press.title} {...press} />
        ))}
      </div>
      <Footer />
    </main>
  );
}