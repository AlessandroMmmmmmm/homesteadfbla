
import advisers from "../../data/advisers.js";
import Footer from "@/components/footer.js";
import advisersPic from "../../../public/static/advisers.jpg"
import Image from "next/image";
import Nav from "@/components/nav";
import OfficerCard from "@/components/officerCard.js";

export default function Officers() {
  
  return (
    <>
        <Image alt="advisers" src={advisersPic} className="fixed blur-sm bg-scroll object-cover object-bottom opacity-10 h-[100vh] w-[100vw] z-[-10]" draggable={false}/>
        <Nav />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-10 my-10 gap-4">
            
        </div>
        <div className="px-10">
                <h2 className="text-watermelon-red text-2xl font-bold mb-6">Our Advisers ❤️</h2>
                <p className="text-lg italic font-light">Several people inquire about the secret behind our success at the Regional, State, and National levels. Our answer is straightforward: there is no hidden formula. Instead, we attribute our achievements to a trio of exceptionally dedicated advisers. These individuals have devoted significant portions of their careers to nurturing the next generation of business leaders.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-10">
                    {advisers.map((adviser) => (
                    <OfficerCard key={adviser.name} {...adviser} />
                    ))}
                </div>
        </div>
        <Footer />
    </>
    
  );
}