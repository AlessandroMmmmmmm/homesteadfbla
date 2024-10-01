"use client";
import React, { useState, useEffect } from 'react';
import { getFirestore, doc, updateDoc, getDoc, setDoc, increment, runTransaction } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import Nav from '@/components/nav';
import Footer from '@/components/footer';
import Image from 'next/image';
import Officers from "../../../public/static/officers.jpg";
import debounce from 'lodash/debounce';
import Link from "next/link";

export default function PointsPage() {
  const [user, loading, error] = useAuthState(auth);
  const [secretCode, setSecretCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [usedCodes, setUsedCodes] = useState([]);
  const [pointCodes, setPointCodes] = useState([]);
  const [writtenPointCodes, setWrittenPointCodes] = useState([]);
  const [permanentCodes, setPermanentCodes] = useState([]);
  const [authType, setAuthType] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [activityName, setActivityName] = useState('');
  const [pointType, setPointType] = useState('regular');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pastCodes, setPastCodes] = useState([]);
  const [showPastCodes, setShowPastCodes] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [selectedPointType, setSelectedPointType] = useState('');
  const [pointsValue, setPointsValue] = useState(0);

  const fetchData = async () => {
    if (user) {
      const db = getFirestore();
      const userRef = doc(db, 'activityPoints', user.uid);
      const writtenUserRef = doc(db, 'writtenActivityPoints', user.uid);
      const userData = doc(db, 'users', user.displayName);
      const userDataSnap = await getDoc(userData);
      const userSnap = await getDoc(userRef);
      const writtenUserSnap = await getDoc(writtenUserRef);

      if (userSnap.exists() || writtenUserSnap.exists()) {
        const generalUserData = userDataSnap.data();
        setAuthType(generalUserData.authType);
        setUsedCodes((userSnap.exists() ? userSnap : writtenUserSnap).data().usedCodes || []);
      }

      const pointCodesCollection = doc(db, 'pointCodes', 'Current Codes');
      const pointCodesSnapshot = await getDoc(pointCodesCollection);
      if (pointCodesSnapshot.exists()) {
        const codesData = pointCodesSnapshot.data();
        setPointCodes(codesData.codes);
        setWrittenPointCodes(codesData.writtenCodes);
        setPermanentCodes(codesData.permanentCodes);
      }

      const pastCodesRef = doc(db, 'pointCodes', 'Past Codes (Do not use again)');
      const pastCodesSnapshot = await getDoc(pastCodesRef);
      if (pastCodesSnapshot.exists()) {
        setPastCodes(pastCodesSnapshot.data()["past codes"] || []);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const verifyCode = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (usedCodes.includes(secretCode)) {
      setErrorMessage('This code has been used already');
    } else {
      const codesList = pointType === 'regular' ? pointCodes : writtenPointCodes;
      const matchedCode = codesList.find(code => code.code === secretCode) || permanentCodes.find(code => code.code === secretCode);

      if (matchedCode) {
        setCodeVerified(true);
        setPointsValue(matchedCode.points);
        setErrorMessage('');
      } else {
        setErrorMessage('Invalid code');
      }
    }
    setIsSubmitting(false);
  };

  const addActivityPoint = async () => {
    if (isSubmitting || !user) return;
    setIsSubmitting(true);

    const db = getFirestore();
    const userRef = doc(db, pointType === 'regular' ? 'activityPoints' : 'writtenActivityPoints', user.uid);

    try {
      await runTransaction(db, async (transaction) => {
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          transaction.set(userRef, {
            name: user.displayName,
            activityPoints: 0,
            usedCodes: [],
            email: user.email,
          });
        }

        const usedCodes = userSnap.exists() ? userSnap.data().usedCodes || [] : [];
        if (usedCodes.includes(secretCode)) throw new Error('Code already used.');

        transaction.update(userRef, {
          activityPoints: increment(pointsValue),
          usedCodes: [...usedCodes, secretCode],
        });
      });
      setCodeVerified(false);
      setSecretCode('');
    } catch (e) {
      setErrorMessage(e.message);
    }
    setIsSubmitting(false);
  };

  const debounceVerifyCode = debounce(verifyCode, 100);
  const debounceAddActivityPoint = debounce(addActivityPoint, 100);

  const generateRandomCode = async () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result;
    do {
      result = '';
      for (let i = 0; i < 4; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    } while (pastCodes.includes(result));
    return result;
  };

  const addNewCodeToFirestore = async () => {
    if (!activityName.trim() || pointsValue <= 0) {
      setErrorMessage('Activity name and a positive point value are required');
      return;
    }

    const newCode = await generateRandomCode();
    const combinedCode = `${activityName.toUpperCase()}-${newCode}`;
    const db = getFirestore();
    const pointCodesRef = doc(db, 'pointCodes', 'Current Codes');

    try {
      const pointCodesSnap = await getDoc(pointCodesRef);
      let currentCodes = pointCodesSnap.exists() ? pointCodesSnap.data().codes || [] : [];
      let writtenCurrentCodes = pointCodesSnap.exists() ? pointCodesSnap.data().writtenCodes || [] : [];
      let permanentCodes = pointCodesSnap.exists() ? pointCodesSnap.data().permanentCodes || [] : [];

      if (selectedPointType === 'permanent') {
        permanentCodes.push({ code: combinedCode, points: pointsValue });
      } else if (pointType === 'regular') {
        currentCodes.push({ code: combinedCode, points: pointsValue });
      } else {
        writtenCurrentCodes.push({ code: combinedCode, points: pointsValue });
      }

      await setDoc(pointCodesRef, { codes: currentCodes, writtenCodes: writtenCurrentCodes, permanentCodes }, { merge: true });
      setGeneratedCode(combinedCode);
    } catch (e) {
      setErrorMessage(e.message);
    }
  };

  const toggleVisibility = (setter) => setter(prev => !prev);

  return (
    <main className="flex flex-col min-h-screen">
      <Image src={Officers} className="fixed blur-sm bg-scroll object-cover opacity-10 h-[100vh] z-[-10]" draggable={false} />
      <Nav />
      {user ? (
        <div className="flex flex-col text-center items-center justify-center flex-grow py-12 px-5 md:px-20 space-y-6 lg:space-y-12">
          <div className="container flex flex-col items-center mx-auto p-6 bg-red-violet/60 rounded-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 border-2 border-watermelon-red/40 shadow-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">Get Activity Points!</h1>
            {!codeVerified ? (
              <div className="flex flex-col items-center space-y-4 w-full">
                <select onChange={(e) => setPointType(e.target.value)} className="border p-2 rounded text-black w-full bg-red-100/90">
                  <option value="regular">Regular Meeting Points</option>
                  <option value="written">Written Competitor Points</option>
                </select>
                <input type="text" placeholder="Enter code" value={secretCode} onChange={(e) => setSecretCode(e.target.value)} className="border p-2 rounded text-black w-full bg-red-100/90" />
                <button onClick={debounceVerifyCode} disabled={isSubmitting} className="p-2 bg-watermelon-red/75 text-white rounded-lg w-full hover:bg-watermelon-red/90">
                  Verify Code
                </button>
              </div>
            ) : (
              <button onClick={debounceAddActivityPoint} disabled={isSubmitting} className="p-2 bg-watermelon-red text-white rounded-lg w-full hover:scale-105 duration-200">
                Click this to Receive Activity Points!
              </button>
            )}
            {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
            {(authType === 'officer' || authType === 'tech') && (
              <div className="container flex flex-col bg-red-violet/40 mt-8 px-5 py-6 rounded-lg shadow-xl">
                <h1 className="text-center mb-1 text-2xl sm:text-3xl font-bold text-white">Generate Code</h1>
                <input type="text" placeholder="ex. CSPM1 or GM1" value={activityName} onChange={(e) => setActivityName(e.target.value.replace(/\s/g, ''))} className="border p-2 rounded text-black w-full bg-red-100/90" />
                <select className="border p-2 rounded text-black w-full bg-red-100/90" value={selectedPointType} onChange={(e) => setSelectedPointType(e.target.value)}>
                  <option value="" disabled>--Point Value--</option>
                  <option value="2-regular">Regular GM/PM (2)</option>
                  <option value="2-lunch">Lunch Workshop (2)</option>
                  <option value="2-on-campus">On Campus School Event (2)</option>
                  <option value="3-off-campus">Off Campus School Event (3)</option>
                  <option value="5-fbla-week">FBLA-PBL Week Activity (5 per hour)</option>
                  <option value="20-bay">Bay Section Leadership Conference (20)</option>
                  <option value="30-state">State Leadership Conference (30)</option>
                  <option value="35-national">National Leadership Conference (35)</option>
                  <option value="other">Other (choose point value)</option>
                  <option value="permanent">Permanent Code (choose point value)</option>
                </select>
                {(selectedPointType === 'other' || selectedPointType === 'permanent') && (
                  <input type="number" placeholder="Enter custom point value" value={pointsValue} onChange={(e) => setPointsValue(Number(e.target.value))} className="border p-2 rounded text-black w-full bg-red-100/90" min="1" />
                )}
                <button onClick={addNewCodeToFirestore} className="p-2 bg-red-violet text-white rounded w-full shadow-lg hover:scale-105">
                  Generate new code
                </button>
                {generatedCode && <p className="text-white mt-2">New code generated: <strong>{generatedCode}</strong></p>}
                <button onClick={() => toggleVisibility(setShowCodes)} className="p-2 bg-red-violet text-white rounded w-full shadow-lg hover:scale-105 mt-4">
                  {showCodes ? 'Hide Codes' : 'Show Codes'}
                </button>
                {showCodes && (
                  <div className="text-white mt-4 w-full">
                    <h2 className="text-lg font-bold">Regular Codes:</h2>
                    <ul className="list-disc pl-4">{pointCodes.map((code, index) => <li key={index}>{code.code}</li>)}</ul>
                    <hr className="border-t border-watermelon-red/60 my-4 w-full" />
                    <h2 className="text-lg font-bold">Permanent Activity Codes:</h2>
                    <ul className="list-disc pl-4">{permanentCodes.map((code, index) => <li key={index}>{code.code}</li>)}</ul>
                    <hr className="border-t border-watermelon-red/60 my-4 w-full" />
                    <h2 className="text-lg font-bold">Written Competitor Codes:</h2>
                    <ul className="list-disc pl-4">{writtenPointCodes.map((code, index) => <li key={index}>{code.code}</li>)}</ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col text-center items-center justify-center flex-grow py-12 px-5 md:px-20 space-y-6 lg:space-y-12">
          <div className="container flex flex-col items-center mx-auto p-6 bg-red-violet/60 rounded-lg w-full sm:w-3/4 md:w-1/2 lg:w-1/3 border-2 border-watermelon-red/40 shadow-2xl text-3xl">
            <p>You are not logged in. Please login to get Activity Points!</p>
            <Link href="./login" className="border-2 border-watermelon-red hover:bg-watermelon-red ease-linear duration-200 cursor-pointer w-fit p-3 text-xl rounded-xl mt-8">Go to Login Page</Link>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
}
