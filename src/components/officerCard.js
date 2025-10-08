"use client"
import Image from "next/image";
import { useEffect, useState } from "react";
import { auth } from "../app/firebase"; 


export default function OfficerCard({
  name,
  position,
  bio,
  quote,
  image,
  zoom = 100, // default zoom
  objectPosition = "center", // default position
}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const imageSrc = `/static/headshots/${image}.JPG`;

  return (
    <figure className="md:flex bg-white bg-opacity-5 rounded-xl p-8 md:p-0">
      <div className="pt-6 md:p-8 text-center md:text-left space-y-4 h-fit">
        <Image
          draggable={false}
          width={500}
          height={500}
          src={imageSrc}
          alt=""
        style={{
            objectPosition: objectPosition,
        }}
        className="object-cover h-96 opacity-90 rounded-lg mx-auto transition-transform"
        />
        <figcaption className="font-medium">
          <div className="font-bold text-xl text-watermelon-red">
            {name}
          </div>
          <div className="text-md text-slate-300">
            {position}
          </div>
        </figcaption>
        <blockquote>
          <p className="text-md">{bio}</p>
        </blockquote>
        <blockquote>
          <p className="text-sm font-light italic">{quote}</p>
        </blockquote>
      </div>
    </figure>
  );
}

