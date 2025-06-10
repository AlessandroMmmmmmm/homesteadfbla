"use client";
import Image from "next/image";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { useState, useEffect, useCallback } from "react";
import Arnav from "../../public/static/officers.jpg";
import Link from "next/link";
import firebase from "./firebase";
import { BiRightArrowAlt } from "react-icons/bi";
import { BiPencil, BiTrash } from "react-icons/bi";
import About from "@/components/timeline";
import { getFirestore, collection, query, orderBy, getDocs, addDoc, deleteDoc, doc, updateDoc, setDoc, where } from 'firebase/firestore';
import ContactForm from "@/components/ContactForm";
import { Button, Modal, Box, TextField } from "@mui/material";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [eventsData, setEventsData] = useState([]);
  const [pastEventsData, setPastEventsData] = useState([]);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', description: '' });
  const [editingEvent, setEditingEvent] = useState(null);
  const [user, setUser] = useState(null);
  const [authType, setAuthType] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchAuthType(currentUser.email);
      } else {
        setAuthType(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAuthType = async (email) => {
    const db = getFirestore();
    const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
    if (!userDoc.empty) {
      setAuthType(userDoc.docs[0].data().authType);
    }
  };

  const fetchEvents = useCallback(async () => {
    const db = getFirestore();
    const upcomingEventsRef = query(collection(db, 'upcomingEvents', 'upcoming', 'events'), orderBy('date', 'asc'));
    const upcomingQuerySnapshot = await getDocs(upcomingEventsRef);
    const upcomingEvents = upcomingQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setEventsData(upcomingEvents);
  }, []);

  const fetchPastEvents = useCallback(async () => {
    const db = getFirestore();
    const pastEventsRef = query(collection(db, 'upcomingEvents', 'past', 'events'), orderBy('date', 'asc'));
    const pastQuerySnapshot = await getDocs(pastEventsRef);
    const pastEvents = pastQuerySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setPastEventsData(pastEvents);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setNewEvent({ title: event.title, date: event.date, description: event.description });
    } else {
      setEditingEvent(null);
      setNewEvent({ title: '', date: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setNewEvent({
      ...newEvent,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    const db = getFirestore();

    if (editingEvent) {
      const eventRef = doc(db, 'upcomingEvents', 'upcoming', 'events', editingEvent.id);
      await updateDoc(eventRef, newEvent);
      setEventsData(prev => prev.map(e => (e.id === editingEvent.id ? { ...newEvent, id: editingEvent.id } : e)));
    } else {
      if (authType === "officer" || authType === "tech") {
        const newEventRef = await addDoc(collection(db, 'upcomingEvents', 'upcoming', 'events'), newEvent);
        setEventsData(prev => [{ ...newEvent, id: newEventRef.id }, ...prev]);
      }
    }

    handleCloseModal();
  };

  const handleDelete = async (eventId) => {
    const db = getFirestore();
    await deleteDoc(doc(db, 'upcomingEvents', 'upcoming', 'events', eventId));
    setEventsData(prev => prev.filter(e => e.id !== eventId));
  };

  const moveEventToPast = useCallback(async (event) => {
    const db = getFirestore();
    const pastEventsRef = doc(db, 'upcomingEvents', 'past', 'events', event.id);
    await setDoc(pastEventsRef, event);
    await deleteDoc(doc(db, 'upcomingEvents', 'upcoming', 'events', event.id));
    setEventsData(prev => prev.filter(e => e.id !== event.id));
  }, []);

  useEffect(() => {
    const checkAndMoveEvents = () => {
      const currentDate = new Date();
      eventsData.forEach(async (event) => {
        const eventDate = new Date(event.date);
        const eventDatePlusOne = new Date(eventDate);
        eventDatePlusOne.setDate(eventDate.getDate() + 1);
        if (eventDatePlusOne <= currentDate) {
          await moveEventToPast(event);
        }
      });
    };
    checkAndMoveEvents();
  }, [eventsData, moveEventToPast]);

  const handleTogglePastEvents = () => {
    if (!showPastEvents) {
      fetchPastEvents();
    }
    setShowPastEvents(!showPastEvents);
  };

  const EventCard = ({ event, isPastEvent }) => (
    <div className="bg-red-violet bg-opacity-90 p-8 rounded-lg mb-4 transform hover:scale-[1.02] ease-linear duration-150 relative group">
      <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
      <p className="text-gray-200 mt-2">{new Date(event.date).toLocaleDateString()}</p>
      <p className="text-gray-100 mt-4">{event.description}</p>
      {(authType === "officer" || authType === "tech") && !isPastEvent && (
        <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <BiPencil 
            className="text-white hover:text-gray-200 cursor-pointer hover:scale-110 duration-200" 
            size={20} 
            onClick={() => handleOpenModal(event)} 
          />
          <BiTrash 
            className="text-white hover:text-gray-200 cursor-pointer hover:scale-110 duration-200" 
            size={20} 
            onClick={() => handleDelete(event.id)} 
          />
        </div>
      )}
    </div>
  );

  return (
    <main className="mx-auto space-y-[-6px] lg:px-0 min-h-screen">
      <Image
        src={Arnav}
        className="fixed blur-sm bg-scroll object-cover opacity-10 h-[100vh] z-[-10]"
        draggable={false}
      />
      <Nav />
      <main className="lg:flex flex-cols-2 justify-evenly">
        <div className="flex flex-col text-center items-center lg:items-start lg:text-left justify-center h-[50vh] lg:min-h-[80vh] py-2 px-5 md:px-20 space-y-5">
          <h1 className="text-4xl lg:text-6xl font-bold">Homestead FBLA</h1>
          <p className="text-xl lg:text-3xl font-medium">
            The #1 Chapter in the Nation
          </p>
          <div className="flex flex-row space-x-4">
            <Link
              className="rounded-md bg-red-violet w-fit px-4 py-2 hover:brightness-90 transition ease-linear 
              duration-300 flex flex-row group my-auto"
              href="https://www.youtube.com/watch?v=fNxKm-bBoY8&feature=youtu.be&ab_channel=TimothyBeckmann"
              target="_blank"
            >
              Watch Video{" "}
              <BiRightArrowAlt className="mt-[5px] scale-[1.25] ml-1 group-hover:translate-x-1 ease-linear duration-150" />
            </Link>
          </div>
        </div>
        <div className="rounded-lg hidden w-[40%] lg:flex flex-col text-center lg:text-left justify-center h-[50vh] lg:min-h-[80vh] py-2 gap-x-10 pr-10">
          <Image src={Arnav} className="object-cover h-full my-16 rounded-lg" />
        </div>
      </main>

      {/* Upcoming Events Section */}
      <section className="py-10 px-10 lg:px-16 bg-red-violet bg-opacity-20">
        <div className="flex justify-between items-center mb-7">
          <h1 className="text-3xl font-bold">Upcoming Events</h1>
          <div className="flex space-x-4">
            {(authType === "officer" || authType === "tech") && (
              <Button 
                variant="contained" 
                sx={{
                  backgroundColor: '#B23A48', 
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#B23A48',
                  },
                }}  
                onClick={() => handleOpenModal()}
              >
                Create New Event
              </Button>
            )}
            <Button 
              variant="contained" 
              sx={{
                backgroundColor: '#B23A48', 
                color: 'white',
                '&:hover': {
                  backgroundColor: '#B23A48',
                },
              }} 
              onClick={handleTogglePastEvents}
            >
              {showPastEvents ? "Hide Past Events" : "Show Past Events"}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {eventsData.length === 0 ? (
            <p>No upcoming events at the moment. Stay tuned!</p>
          ) : (
            eventsData.map((event, index) => (
              <EventCard key={index} event={event} isPastEvent={false} />
            ))
          )}
        </div>

        {showPastEvents && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Past Events</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pastEventsData.length === 0 ? (
                <p>No past events.</p>
              ) : (
                pastEventsData.map((event, index) => (
                  <EventCard key={index} event={event} isPastEvent={true} />
                ))
              )}
            </div>
          </div>
        )}

        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="event-modal-title"
        >
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}>
            <h2 id="event-modal-title" className="text-2xl font-bold mb-4 text-black">
              {editingEvent ? "Edit Event" : "Create New Event"}
            </h2>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={newEvent.title}
              onChange={handleInputChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={newEvent.date}
              onChange={handleInputChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newEvent.description}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={4}
            />
            <Button 
              variant="contained"
              sx={{
                backgroundColor: '#B23A48', 
                color: 'white',
                mt: 2,
                '&:hover': {
                  backgroundColor: '#B23A48',
                },
              }}
              onClick={handleSubmit}
            >
              {editingEvent ? "Update Event" : "Create Event"}
            </Button>
          </Box>
        </Modal>
      </section>

      <section className="py-10 px-10 lg:px-16 bg-red-violet bg-opacity-20">
        <h1 className="text-3xl font-bold mb-5">About Us</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div
            className="rounded-lg border-2 border-red-violet bg-red-violet bg-opacity-30 
              px-8 py-6 pb-9"
          >
            <h1 className="text-xl font-semibold">Competitions</h1>
            <p className="text-gray-300 mt-2 mb-[48px]">
              Homestead FBLA competes at Bay Section, States, and Nationals
              every year. We currently have 27 consecutive Bay Section
              Championships, 25 consecutive state championships, and 22 national
              championships.
            </p>

            <Link
              href="/compHistory"
              className="border-2  border-watermelon-red hover:bg-watermelon-red 
              ease-linear duration-200 cursor-pointer w-fit p-3 lg:text-[15px] text-sm rounded-xl"
            >
              View Our Competitive History
            </Link>
          </div>

          <div
            className="rounded-lg border-2 border-watermelon-red bg-watermelon-red bg-opacity-30 
              px-8 py-6 pb-9"
          >
            <h1 className="text-xl font-semibold">Projects</h1>
            <p className="text-gray-300 mt-2 mb-9">
              Homestead FBLA currently has 4 projects; American Enterprise, 
              Community Service, Partnership with Business, and 
              Software Ventures Project. Each of them aims to develop valuable business and 
              leadership skills among students.
            </p>

            <div className="lg:grid-cols-4 lg:gap-x-3 gap-x-3 gap-y-3 lg:justify-between grid grid-cols-2 lg:gap-0">
              <Link
                href="/projects/american-enterprise"
                className="border-2 border-watermelon-red hover:bg-watermelon-red ease-linear duration-200 flex justify-center cursor-pointer p-3 
                  text-[15px] rounded-xl"
              >
                AE
              </Link>

              <Link
                href="/projects/community-service"
                className="border-2 border-watermelon-red hover:bg-watermelon-red ease-linear duration-200 cursor-pointer flex justify-center p-3 
                  text-[15px] rounded-xl"
              >
                CS
              </Link>

              <Link
                href="/projects/partnership-with-business"
                className="border-2 border-watermelon-red hover:bg-watermelon-red ease-linear duration-200 flex justify-center cursor-pointer p-3 
                  text-[15px] rounded-xl"
              >
                PWB
              </Link>

              <Link
                href="/projects/software-ventures"
                className="border-2 border-watermelon-red hover:bg-watermelon-red ease-linear duration-200 flex justify-center cursor-pointer p-3 
                  text-[15px] rounded-xl"
              >
                SV
              </Link>
            </div>
          </div>

          <div
            className="rounded-lg border-2 border-melon bg-melon bg-opacity-30 
              px-8 py-6 pb-9">
            <h1 className="text-xl font-semibold">Officers</h1>
            <p className="text-gray-300 mt-2 mb-[45px]">
              Homestead FBLA&apos;s leadership consists of Teams setting
              strategy, handling logistics and events, and Project Chairs
              leading business initiatives. The officers provide direction,
              organization, and execution of the chapter&apos;s activities.
            </p>

            <Link
              href="/officers"
              className="border-2 border-red-300 hover:bg-red-300 
                hover:text-white ease-linear duration-200 
                cursor-pointer w-fit p-3 lg:text-[15px] text-sm rounded-xl"
            >
              Meet our Officer Team
            </Link>
          </div>
        </div>
      </section>

      {/* <ContactForm /> */}
      
      <Footer />
    </main>
  );
}