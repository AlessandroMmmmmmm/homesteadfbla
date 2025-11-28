"use client";

import React, { useState, useEffect, useCallback } from 'react';   
import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, getDocs, where } from 'firebase/firestore';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from '@mui/lab/TabPanel';
import TabContext from '@mui/lab/TabContext';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useMediaQuery, MenuItem, FormControl, Select, InputLabel } from '@mui/material';

const ProfileCard = () => {
  const [user, setUser] = useState(null);
  const [authType, setAuthType] = useState(null);
  const [value, setValue] = useState("1");
  const [leaderboardType, setLeaderboardType] = useState('regular');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userPlacement, setUserPlacement] = useState(null);
  const [userPoints, setUserPoints] = useState(0);

  const [page, setPage] = useState(0);
  const pageSize = 5;

  const isMobile = useMediaQuery('(max-width:600px)');

  const milestones = [
    { name: 'Bronze Member', points: 10, color: '#CD7F32', prize: 'Candy' },
    { name: 'Silver Member', points: 20, color: '#A8A8A8', prize: 'Undetermined' },
    { name: 'Gold Member', points: 30, color: '#FFD700', prize: 'Merch' },
    { name: 'Platinum Member', points: 40, color: '#E5E4E2', prize: 'Choose room at SLC' },
    { name: 'Diamond Member', points: 50, color: '#00BFFF', prize: 'Choose room at NLC' }
  ];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
      else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchAuthType = async () => {
      if (!user) return;
      const db = getFirestore();
      const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
      if (!userDoc.empty) setAuthType(userDoc.docs[0].data().authType);
    };
    fetchAuthType();
  }, [user]);

  const fetchLeaderboardData = useCallback(async () => {
    if (!user) return;
    const db = getFirestore();
    const allUsersSnapshot = await getDocs(
      query(collection(db, 'activityPoints2026'), orderBy('activityPoints2026', 'desc'))
    );
    const allUsers = allUsersSnapshot.docs.map(doc => ({
      name: doc.data().name,
      activityPoints: doc.data().activityPoints2026,
      email: doc.data().email
    }));
    setLeaderboardData(allUsers);

    const userRank = allUsers.findIndex(u => u.email === user.email) + 1;
    const userData = allUsers.find(u => u.email === user.email);
    if (userData && !allUsers.slice(0, 5).some(u => u.email === user.email))
      setUserPlacement({ ...userData, rank: userRank });
    else setUserPlacement(null);
  }, [user]);

  useEffect(() => {
    if (leaderboardType === 'regular') fetchLeaderboardData();
  }, [leaderboardType, fetchLeaderboardData]);

  useEffect(() => {
    setPage(0);
  }, [leaderboardType]);

  useEffect(() => {
    const fetchUserPoints = async () => {
      if (!user) return;
      const db = getFirestore();
      const pointsSnapshot = await getDocs(
        query(collection(db, 'activityPoints2026'), where('email', '==', user.email))
      );
      if (!pointsSnapshot.empty) setUserPoints(pointsSnapshot.docs[0].data().activityPoints2026 || 0);
    };
    fetchUserPoints();
  }, [user]);

  const handleChange = (event, newValue) => setValue(newValue);

  const getCurrentMilestone = () => {
    const achieved = milestones.filter(m => userPoints >= m.points);
    return achieved[achieved.length - 1] || null;
  };

  const getNextMilestone = () => {
    return milestones.find(m => userPoints < m.points) || milestones[milestones.length - 1];
  };

  const paginatedLeaderboard = leaderboardData.slice(
    page * pageSize,
    page * pageSize + pageSize
  );

  return (
    <div className="flex flex-col items-center p-0 rounded-lg pb-0">
      {user ? (
        <div className="flex flex-col items-center w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 2xl:w-7/12 h-5/6 rounded-lg pt-10 mt-5 shadow-2xl border-4 border-red-violet bg-watermelon-red bg-opacity-70">
          <div className="flex justify-center">
            <img src={user.photoURL} className="w-24 h-24 rounded-full border-2 border-dark-chocolate border-opacity-30 shadow-md" />
          </div>
          <div className="text-center mt-4">
            <h2 className="text-2xl font-semibold text-gray-200">{user.displayName}</h2>
            <p className="text-gray-300">{user.email}</p>
          </div>

          <div className="w-full mt-6">
            <TabContext value={value}>
              <Box>
                <Tabs 
                  value={value} 
                  onChange={handleChange} 
                  variant={isMobile ? "scrollable" : "fullWidth"}
                  scrollButtons={isMobile ? "auto" : "false"}
                  textColor="primary" 
                  indicatorColor="primary"
                  sx={{
                    '& .MuiTabs-indicator': { backgroundColor: 'white' },
                    '& .MuiTab-root': { color: '#a0aec0', minWidth: 120, whiteSpace: 'nowrap' },
                    '& .Mui-selected': { color: 'white !important' }
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
                    <InputLabel id="leaderboard-type-label" sx={{ color: 'white' }}>Leaderboard Type</InputLabel>
                    <Select
                      labelId="leaderboard-type-label"
                      value={leaderboardType}
                      onChange={(e) => setLeaderboardType(e.target.value)}
                      sx={{
                        color: 'white',
                        '.MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '.MuiSvgIcon-root': { color: 'white' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
                        '& .MuiSelect-select': { color: 'white' }
                      }}
                      MenuProps={{ PaperProps: { sx: { color: 'black' }}}}
                    >
                      <MenuItem value="regular">Activity Points</MenuItem>
                    </Select>
                  </FormControl>

                  <div className="space-y-3 mt-4">

                    <div className="flex justify-between items-center mb-3">
                      <Button 
                        variant="contained"
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        sx={{ backgroundColor: "#882e39", color: "white", minWidth: "40px" }}
                      >
                        {"<"}
                      </Button>

                      <span className="text-white text-sm">
                        Page {page + 1} / {Math.ceil(leaderboardData.length / pageSize)}
                      </span>

                      <Button 
                        variant="contained"
                        disabled={(page + 1) * pageSize >= leaderboardData.length}
                        onClick={() => setPage(page + 1)}
                        sx={{ backgroundColor: "#882e39", color: "white", minWidth: "40px" }}
                      >
                        {">"}
                      </Button>
                    </div>

                    {paginatedLeaderboard.map((item, index) => (
                      <div 
                        key={index}
                        className={`flex justify-between p-2 ${
                          item.email === user.email ? 'bg-red-400 bg-opacity-30' : 'bg-red-violet'
                        } text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25`}
                      >
                        <span><strong>{page * pageSize + index + 1}</strong> - {item.name}</span>
                        <span>{item.activityPoints} pts</span>
                      </div>
                    ))}

                    {userPlacement && (
                      <>
                        <div className="flex justify-center">
                          <span className="text-gray-300">• • •</span>
                        </div>
                        <div className="flex justify-between p-2 bg-red-400 bg-opacity-30 text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                          <span><strong>{userPlacement.rank}</strong> - {userPlacement.name}</span>
                          <span>{userPlacement.activityPoints} pts</span>
                        </div>
                      </>
                    )}
                  </div>
                </TabPanel>

                <TabPanel value="2">
                  <div className="space-y-6 text-center text-white">
                    <h2 className="text-2xl font-bold">Your Progress</h2>
                    <p className="text-lg">You have: <span className="font-bold">{userPoints}</span> points</p>
                    {getNextMilestone() !== getCurrentMilestone() && (
                      <p className="text-lg text-gray-300">Next milestone: {getNextMilestone().name} at {getNextMilestone().points} points</p>
                    )}
                  </div>
                </TabPanel>

                <TabPanel value="3">
                  <div className="space-y-3">
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>President:</strong> <a href="mailto:dorie2188@gmail.com">dorie2188@gmail.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Officers:</strong> <a href="mailto:officers@homesteadfbla.com">officers@homesteadfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Competitions:</strong> <a href="mailto:comps@homesteadfbla.com">comps@homesteadfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Community Service:</strong> <a href="mailto:cs@homesteadfbla.com">cs@homesteadfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Software Ventures:</strong> <a href="mailto:sv@homesteadfbla.com">sv@homesteadfbla.com</a></span>
                    </div>
                    <div className="flex justify-between p-2 bg-red-violet text-white rounded-lg shadow-lg border border-dark-chocolate border-opacity-25">
                      <span><strong>Community Engagement:</strong> <a href="mailto:ce@homesteadfbla.com">ce@homesteadfbla.com</a></span>
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
