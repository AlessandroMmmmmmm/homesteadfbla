import Nav from "@/components/nav";
import OfficerCard from "@/components/officerCard.js";
import officers from "../../data/officers.js";
import Footer from "@/components/footer.js";
import officersPic from "../../../public/static/officers.jpg"
import Image from "next/image";

export default function Officers() {
  return (
    <>
        <Image src={officersPic} className="fixed blur-sm bg-scroll object-cover opacity-10 h-[100vh] w-[100vw] z-[-10]" draggable={false}/>
        <Nav />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-10 my-10 gap-4">
            <div className="border-2  rounded-md border-blue-600 bg-blue-600 bg-opacity-10 px-4 py-3">
                <h1 className="text-lg font-bold text-blue-600">Executive Team</h1>
                <p className="text-md font-light text-blue-400">The Executive Team is composed of seasoned officers who oversee the Operations, Competitions, and Projects subteams. With a rich history in leading initiatives, mentoring team members, and steering committee decisions, they provide the overall strategic direction for the organization.</p>
            </div>
            <div className="border-2  rounded-md border-purple-600 bg-purple-600 bg-opacity-10 px-4 py-3">
                <h1 className="text-lg font-bold text-purple-600">Operations Team</h1>
                <p
                 className="text-md font-light text-purple-400">The Operations Team is responsible for managing both internal and external communications for the club. They handle logistical tasks like coordinating conferences, overseeing finances, and planning events. Known for their approachable demeanor, they serve as a friendly point of contact within Homestead FBLA.</p>
            </div>
            <div className="border-2  rounded-md border-yellow-600 bg-yellow-600 bg-opacity-10 px-4 py-3">
                <h1 className="text-lg font-bold text-yellow-600">Competitions Team</h1>
                <p className="text-md font-light text-yellow-400">The Competitions Team specializes in managing all competition-related activities throughout the year. This includes conducting tryouts, organizing vetting sessions, and hosting mentorship workshops. Each officer on this team is an expert in a specific type of competition, ensuring a high level of expertise.</p>
            </div>
            <div className="border-2  rounded-md border-orange-600 bg-orange-600 bg-opacity-10 px-4 py-3">
                <h1 className="text-lg font-bold text-orange-600">Project Chairs</h1>
                <p className="text-md font-light text-orange-400">The Projects Chairs focus on leading a variety of initiatives designed to expose members to different aspects of business. They oversee the execution of their respective projects, providing regular updates and specific areas of focus through our individual project pages.</p>
            </div>
        </div>
        <div className="px-10 ">
            {/* <h1 className="text-4xl font-bold my-10">Meet our Team!</h1> */}

            
            <div className="my-10 bg-blue-600 bg-opacity-20 border-2 rounded-lg border-blue-600 px-8 py-6">  
              <h2 className="text-blue-600 text-2xl font-bold mb-6">Executive Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {officers.exec.map((officer) => (
                <OfficerCard
                    key={officer.name}
                    {...officer}
                    objectPosition="50% 30%"
                />
                ))}
                </div>
            </div>
            
            <div className="my-10 bg-purple-600 bg-opacity-20 border-2 rounded-lg  border-purple-600 px-8 py-6">  
                <h2 className="text-purple-600 text-2xl font-bold mb-6">Operations Team</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {officers.ops.map((officer) => (
                    <OfficerCard key={officer.name} {...officer} />
                    ))}
                </div>
            </div>
            
            <div className="my-10 bg-yellow-600 bg-opacity-20 border-2 rounded-lg  border-yellow-600 px-8 py-6">  
                <h2 className="text-yellow-600 text-2xl font-bold mb-6">Competitions Team</h2>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {officers.comps.map((officer) => (
                    <OfficerCard key={officer.name} {...officer} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-4 my-10">
            {["cs", "sv", "pwb", "ml", "mrpd"].map((teamKey) => (
                <div key={teamKey} className=" mb-6 bg-orange-600 bg-opacity-20 border-2 rounded-lg  border-orange-600 px-8 py-6">
                <h2 className="text-orange-600 text-2xl font-bold mb-6">{getTeamTitle(teamKey)}</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {officers.projects[teamKey].map((officer) => (
                        <OfficerCard key={officer.name} {...officer} />
                        ))}
                    </div>
                </div>
            ))}
            </div>
            
        </div>
        <Footer />
    </>
    
  );
}

// Function to get readable team titles
function getTeamTitle(key) {
  const titles = {
    cs: "Project Chairs | Community Service",
    sv: "Project Chairs | Software Ventures",
    pwb: "Project Chairs | Partnership with Business",
    ml: "Middle Level Chairs",
    mrpd: "Member Relations & Professional Development Chairs",
  };
  return titles[key];
}
