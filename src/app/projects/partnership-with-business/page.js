import Image from "next/image"
import Link from "next/link"
import Nav from "@/components/nav"
import Footer from "@/components/footer"
import officersPic from "../../../../public/static/officers.jpg"

export default function PartnershipWithBusiness() {
    return(
        <>
            <Image src={officersPic} className="fixed blur-sm bg-scroll object-cover opacity-10 h-[100vh] w-[100vw] z-[-10]" draggable={false}/>
            <Nav />
            <div className="h-[80vh] border-2 border-dark-chocolate bg-dark-chocolate p-10 m-10 rounded-xl bg-opacity-30">
                <h1 className="text-3xl font-bold">Partnership with Business</h1>
                <p className="mt-3 text-lg">Coming soon!</p>
            </div>

            <Footer />
        </>
    )
}