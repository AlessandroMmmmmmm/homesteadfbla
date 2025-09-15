"use client";

import React, { useState, useEffect, useCallback } from 'react';   
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { getFirestore, collection, query, limit, orderBy, getDocs, where, addDoc, updateDoc, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth } from '@/app/firebase';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Modal from '@mui/material/Modal';
import { BiPencil, BiTrash } from "react-icons/bi";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, MenuItem, FormControl, Select, InputLabel } from '@mui/material';

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const [authType, setAuthType] = useState(null);
  const [value, setValue] = useState("1");
  const [leaderboardType, setLeaderboardType] = useState('regular');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [writtenLeaderboardData, setWrittenLeaderboardData] = useState([]);
  const [userPlacement, setUserPlacement] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  const isMobile = useMediaQuery('(max-width:600px)');

  // Define milestones with prizes
  const milestones = [
    { 
      name: 'Bronze Member', 
      points: 10, 
      color: '#CD7F32', // Rich Bronze
      prize: 'Bronze Prize'
    },
    { 
      name: 'Silver Member', 
      points: 20, 
      color: '#A8A8A8', // Bright Silver
      prize: 'Silver Prize'
    },
    { 
      name: 'Gold Member', 
      points: 30, 
      color: '#FFD700', // Pure Gold
      prize: 'Gold Prize'
    },
    { 
      name: 'Platinum Member', 
      points: 40, 
      color: '#E5E4E2', // Bright Platinum
      prize: 'Platinum Prize'
    },
    { 
      name: 'Diamond Member', 
      points: 50, 
      color: '#00BFFF', // Diamond Blue
      prize: 'Diamond Prize'
    }
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAuthType = async () => {
      if (!user) return;
      const db = getFirestore();
      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
      if (!userDoc.empty) {
        setAuthType(userDoc.docs[0].data().authType);
      }
    };

    fetchAuthType();
  }, [user]);

  const fetchLeaderboardData = useCallback(async () => {
    if (!user) return;
    const db = getFirestore();
    
    // Get all users ordered by points to calculate rank
    const allUsersQuery = query(collection(db, 'activityPoints2026'), orderBy('activityPoints2026', 'desc'));
    const allUsersSnapshot = await getDocs(allUsersQuery);
    const allUsers = allUsersSnapshot.docs.map(doc => ({
      name: doc.data().name,
      activityPoints: doc.data().activityPoints2026,
      email: doc.data().email
    }));

    // Set top 5 for leaderboard
    setLeaderboardData(allUsers.slice(0, 5));

    // Find user's rank
    const userRank = allUsers.findIndex(u => u.email === user.email) + 1;
    const userData = allUsers.find(u => u.email === user.email);
    
    if (userData && !allUsers.slice(0, 5).some(u => u.email === user.email)) {
      setUserPlacement({ ...userData, rank: userRank });
    } else {
      setUserPlacement(null);
    }
  }, [user]);

  const fetchWrittenLeaderboardData = useCallback(async () => {
    if (!user) return;
    const db = getFirestore();
    
    // Get all users ordered by points to calculate rank
    const allUsersQuery = query(collection(db, 'writtenActivityPoints'), orderBy('activityPoints2026', 'desc'));
    const allUsersSnapshot = await getDocs(allUsersQuery);
    const allUsers = allUsersSnapshot.docs.map(doc => ({
      name: doc.data().name,
      activityPoints: doc.data().activityPoints2026,
      email: doc.data().email
    }));

    // Set top 5 for leaderboard
    setWrittenLeaderboardData(allUsers.slice(0, 5));

    // Find user's rank
    const userRank = allUsers.findIndex(u => u.email === user.email) + 1;
    const userData = allUsers.find(u => u.email === user.email);
    
    if (userData && !allUsers.slice(0, 5).some(u => u.email === user.email)) {
      setUserPlacement({ ...userData, rank: userRank });
    } else {
      setUserPlacement(null);
    }
  }, [user]);

  useEffect(() => {
    if (leaderboardType === 'regular') {
      fetchLeaderboardData();
    } else if (leaderboardType === 'written') {
      fetchWrittenLeaderboardData();
    }
  }, [leaderboardType, fetchLeaderboardData, fetchWrittenLeaderboardData]);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return;
      const db = getFirestore();
      const userPointsRef = query(
        collection(db, 'activityPoints2026'),
        where('email', '==', user.email)
      );
      const pointsSnapshot = await getDocs(userPointsRef);
      if (!pointsSnapshot.empty) {
        setUserPoints(pointsSnapshot.docs[0].data().activityPoints2026 || 0);
      }
    };

    fetchUserPoints();
  }, [user]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const getCurrentMilestone = () => {
    const achievedMilestones = milestones.filter(m => userPoints >= m.points);
    return achievedMilestones[achievedMilestones.length - 1] || null;
  };

  const getNextMilestone = () => {
    const nextMilestone = milestones.find(m => userPoints < m.points);
    return nextMilestone || milestones[milestones.length - 1];
  };

  const calculateProgress = (milestone) => {
    const prevMilestonePoints = milestones[milestones.indexOf(milestone) - 1]?.points || 0;
    const progress = ((userPoints - prevMilestonePoints) / (milestone.points - prevMilestonePoints)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="flex flex-col items-center p-0 rounded-lg pb-0">
      {user ? (
        <div className="
          flex flex-col items-center 
          w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-7/12 
          h-5/6 rounded-lg pt-10 mt-5 shadow-2xl 
          border-4 border-red-violet bg-watermelon-red bg-opacity-70">
          <div className="flex justify-center">
            <img src={user.photoURL} alt="Profile" className="w-24 h-24 rounded-full border-2 border-dark-chocolate border-opacity-30 shadow-md" />
          </div>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-semibold text-gray-200">{user.displayName}</h2>
            <p className="text-gray-300">{user.email}</p>
          </div>
          <div className="w-full mt-6">
            <TabContext value={value}>
              <Box className="relative">
                <Tabs 
                  value={value} 
                  onChange={handleChange} 
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : "false"}
                  textColor="primary" 
                  indicatorColor="primary"
                  sx={{
                    '& .MuiTabs-indicator': {
                      backgroundColor: 'white',
                    },
                    '& .MuiTab-root': {
                      color: '#a0aec0', 
                      minWidth: 120, 
                      whiteSpace: 'nowrap',
                    },
                    '& .Mui-selected': {
                      color: 'white !important', 
                    },
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  <Tab label="Activity Points" value="1"/>
                  <Tab label="Milestones" value="2" />
                  <Tab label="Contact Info" value="3" />
                </Tabs>
              </Box>
              <Box className="mt-4">
                <TabPanel value="1">
                  <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                    <InputLabel 
                      id="leaderboard-type-label" 
                      sx={{ 
                        color: 'white',
                        '&.Mui-focused': {
                          color: 'white'
                        },
                      }}
                    >
                      Leaderboard Type
                    </InputLabel>
                    <Select
                      labelId="leaderboard-type-label"
                      id="leaderboard-type"
                      value={leaderboardType}
                      label="Leaderboard Type"
                      onChange={(e) => setLeaderboardType(e.target.value)}
                      sx={{
                        color: 'white',
                        '.MuiOutlinedInput-notchedOutline': {
                          borderColor: 'white',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'white',
                        },
                        '.MuiSvgIcon-root': {
                          color: 'white',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'white',
                        },
                        '& .MuiSelect-select': {
                          color: 'white',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            color: 'black',
                          }
                        }
                      }}
                    >
                      <MenuItem value="regular">Activity Points</MenuItem>
                      <MenuItem value="written">Written Competitor Points</MenuItem>
                    </Select>
                  </FormControl>

                  <div className="space-y-3 mt-4">
                    {leaderboardType === 'regular' ? (
                      leaderboardData.map((item, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between p-2 ${item.email === user.email ? 'bg-red-400 bg-opacity-30' : 'bg-red-violet'} text-white rounded-lg 
                          shadow-lg border border-dark-chocolate border-opacity-25`}
                        >
                          <span><strong>{index + 1}</strong> - {item.name}</span>
                          <span>{item.activityPoints} pts</span>
                        </div>
                      ))
                    ) : (
                      writtenLeaderboardData.map((item, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between p-2 ${item.email === user.email ? 'bg-red-400 bg-opacity-30' : 'bg-red-violet'} text-white rounded-lg 
                          shadow-lg border border-dark-chocolate border-opacity-25`}
                        >
                          <span><strong>{index + 1}</strong> - {item.name}</span>
                          <span>{item.activityPoints} pts</span>
                        </div>
                      ))
                    )}

                    {userPlacement && (
                      <>
                        <div className="flex justify-center">
                          <span className="text-gray-300">• • •</span>
                        </div>
                        <div className="flex justify-between p-2 bg-red-400 bg-opacity-30 text-white rounded-lg shadow-lg
                         border border-dark-chocolate border-opacity-25">
                          <span><strong>{userPlacement.rank}</strong> - {userPlacement.name}</span>
                          <span>{userPlacement.activityPoints} pts</span>
                        </div>
                      </>
                    )}
                  </div>
                </TabPanel>
                <TabPanel value="2">
                  <div className="space-y-6">
                    {/* Current Status */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Your Progress
                      </h2>
                      <p className="mb-1 text-lg">
                        You have: <span className="font-bold">{userPoints} </span> points
                      </p>
                      {getNextMilestone() && getCurrentMilestone() !== getNextMilestone() && (
                        <p className="text-gray-300 text-lg">
                          Next milestone: {getNextMilestone().name} at {getNextMilestone().points} points
                        </p>
                      )}
                    </div>

                    {/* Milestone Progress with Column Layout */}
                    <div className="space-y-8">
                      {/* Progress Bar Section */}
                      <div className="relative">
                        <div className="absolute top-8 left-0 right-0 h-2 bg-gray-700 rounded-full"></div>
                        
                        {/* Progress Line */}
                        <div 
                          className="absolute top-8 left-0 h-2 bg-yellow-400 rounded-full transition-all duration-1000 ease-out shadow-lg"
                          style={{ 
                            width: `${Math.min((userPoints / milestones[milestones.length - 1].points) * 100, 100)}%` 
                          }}
                        ></div>

                        {/* Milestone Points on Progress Bar */}
                        <div className="flex justify-between relative z-10">
                      {milestones.map((milestone, index) => {
                        const isAchieved = userPoints >= milestone.points;
                        const isNext = !isAchieved && userPoints < milestone.points && 
                          (!milestones[index - 1] || userPoints >= milestones[index - 1].points);

                        return (
                          <div 
                            key={milestone.name}
                                className="relative flex flex-col items-center"
                              >
                                {/* Milestone Icon */}
                                <div 
                                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 ${
                                    isAchieved 
                                      ? 'border-white shadow-glow' 
                                      : isNext 
                                      ? 'border-yellow-300 shadow-yellow-300/50' 
                                      : 'border-gray-400'
                                  }`}
                                  style={{ 
                                    backgroundColor: milestone.color,
                                    boxShadow: isAchieved ? `0 0 20px ${milestone.color}80` : 'none'
                                  }}
                                >
                                    {isAchieved ? (
                                    <span className="text-white text-2xl font-bold">✓</span>
                                  ) : (
                                    <span className="text-white text-lg font-bold">{milestone.points}</span>
                                  )}
                                </div>

                                {/* Milestone Label */}
                                <div className="mt-3 text-center">
                                  <h3 className={`text-sm font-bold ${
                                    isAchieved ? 'text-white' : isNext ? 'text-yellow-200' : 'text-gray-400'
                                  }`}>
                                    {milestone.name}
                                  </h3>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {milestone.points} pts
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                              </div>
                            </div>

                      {/* Milestone Columns with Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {milestones.map((milestone, index) => {
                          const isAchieved = userPoints >= milestone.points;
                          const isNext = !isAchieved && userPoints < milestone.points && 
                            (!milestones[index - 1] || userPoints >= milestones[index - 1].points);

                          return (
                            <div 
                              key={milestone.name}
                              className={`bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20 ${
                                isAchieved ? 'opacity-100' : isNext ? 'opacity-90' : 'opacity-60'
                              }`}
                            >
                              {/* Milestone Header */}
                              <div className="text-center mb-6">
                                <h4 className={`text-xl font-bold mb-2 ${
                                  isAchieved ? 'text-white' : isNext ? 'text-yellow-200' : 'text-gray-400'
                                }`}>
                                  {milestone.name}
                                </h4>
                                <p className="text-sm text-gray-400 mb-4">
                                  {milestone.points} points
                                </p>
                                
                                {/* Status Indicator */}
                                <div className="mb-4">
                                  {isAchieved ? (
                                    <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                      ✓ UNLOCKED
                                    </span>
                                  ) : isNext ? (
                                    <span className="inline-block bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                      {milestone.points - userPoints} more points
                                    </span>
                                  ) : (
                                    <span className="inline-block bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                      LOCKED
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Prize Display */}
                              <div className="text-center">
                                <p className="text-sm text-gray-200">
                                  <span className="font-semibold text-white">Prize:</span> {milestone.prize}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                            </div>

                      {/* Current Progress Indicator */}
                      {/* <div className="text-center">
                        <div className="inline-flex items-center space-x-6 bg-white bg-opacity-10 rounded-full px-8 py-4 backdrop-blur-sm">
                          <div className="text-white">
                            <span className="text-2xl font-bold">{userPoints}</span>
                            <span className="text-sm ml-1">points</span>
                          </div>
                          <div className="w-px h-8 bg-gray-400"></div>
                          <div className="text-gray-300">
                            <span className="text-sm">Next: </span>
                            <span className="font-semibold">
                              {getNextMilestone() ? getNextMilestone().name : 'Max Level!'}
                            </span>
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </div>
                </TabPanel>
                <TabPanel value="3">
                  <div className="space-y-3">
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>President:</strong> <a href="mailto:sanghyuk.eric@gmail.com" target="_blank" rel="noopener noreferrer">sanghyuk.eric@gmail.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>General Email:</strong> <a href="mailto:officers@hhsfbla.com" target="_blank" rel="noopener noreferrer">officers@hhsfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Community Service:</strong> <a href="mailto:cs@hhsfbla.com" target="_blank" rel="noopener noreferrer">cs@hhsfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>American Enterprise:</strong> <a href="mailto:ae@hhsfbla.com" target="_blank" rel="noopener noreferrer">ae@hhsfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Partnership with Business:</strong> <a href="mailto:pwb@hhsfbla.com" target="_blank" rel="noopener noreferrer">pwb@hhsfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Software Ventures:</strong> <a href="mailto:sv@hhsfbla.com" target="_blank" rel="noopener noreferrer">sv@hhsfbla.com</a></span>
                    </div>
                  </div>
                </TabPanel>
              </Box>
            </TabContext>
          </div>
        </div>
      ) : (
        <p className="text-black text-opacity-5 text-lg">...</p>
      )}
    </div>
  );
};

export default ProfileCard;