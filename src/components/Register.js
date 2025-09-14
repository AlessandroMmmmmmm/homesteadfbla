"use client";

import { useState } from 'react';
import { db } from "src/app/firebase.js"; // Make sure the path is correct
import { collection, query, where, getDocs, doc, setDoc } from "firebase/firestore";
import TextField from '@mui/material/TextField';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { red } from '@mui/material/colors';
// import { makeStyles } from '@mui/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ffffff',
    },
  },
  components: {
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#a0aec0',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: '#ffffff',
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        underline: {
          '&:before': {
            borderBottomColor: '#a0aec0',
          },
          '&:hover:not(.Mui-disabled):before': {
            borderBottomColor: '#a0aec0',
          },
          '&:after': {
            borderBottomColor: '#ffffff',
          },
        },
      },
    },
  },
});

function containsUppercase(str) {
  return /[A-Z]/.test(str);
}

function containsFirstUppercase(str) {
  return /[A-Z]/.test(str.slice(0,1));
}

export default function Register() {
  const [state, setState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    id: "",
    key: "",
    buttonText: "Get Started"
  });

  // const validKeys = ["7799774850", "9078422944", "3407372254", "2909954248"];
    const validKeys = ["9078422944"];
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setState({
      ...state,
      [name]: value,
    });
  };

  const isFormValid = () => {
    return (
      state.firstName &&
      state.lastName &&
      state.email &&
      state.id &&
      state.key &&
      validKeys.includes(state.key) &&
      state.email.includes(".fuhsd.org") &&
      state.id.length == 7 && 
      !containsUppercase(state.email) &&
      containsFirstUppercase(state.firstName)&&
      containsFirstUppercase(state.lastName)
    );
  };

  const handleClick = async () => {
    if (!isFormValid()) {
      if (!state.email.includes('.fuhsd.org') && state.email != "") {
        setState({
          ...state,
          buttonText: "Please use an FUHSD Email",
        });
      } else if (!validKeys.includes(state.key) && state.key != "") {
        setState({
          ...state,
          buttonText: "Please use a valid login key",
        });
      } else if (!(state.id.length == 7)){
        setState({
          ...state,
          buttonText: "Please use a valid student ID",
        });
      }else if(containsUppercase(state.email)){
        setState({
          ...state,
          buttonText: "Email must be all lowercase",
        });
      }else if(!containsFirstUppercase(state.firstName)|| !containsFirstUppercase(state.lastName)){
        setState({
          ...state,
          buttonText: "First and last name must be capitalized",
        });
      }else {
        setState({
          ...state,
          buttonText: "Invalid or missing fields",
        });
      }
      return;
    }

    setState({
      ...state,
      buttonText: "Registering...",
    });

    try {
      const res = await registerDatabase(
        state.firstName,
        state.lastName,
        state.email,
        state.id,
        state.key
      );
      setState({
        ...state,
        buttonText: res,
      });
    } catch (error) {
      console.error("Registration error:", error);
      setState({
        ...state,
        buttonText: "An error occurred. Try again?",
      });
    }
  };

  const registerDatabase = async (firstName, lastName, email, id, key) => {
    const usersCollection = collection(db, "users");

    // Check if email or student ID already exists
    const emailQuery = query(usersCollection, where("email", "==", email));
    const idQuery = query(usersCollection, where("id", "==", id));

    const emailSnapshot = await getDocs(emailQuery);
    const idSnapshot = await getDocs(idQuery);

    if (!emailSnapshot.empty || !idSnapshot.empty) {
      return "Email or student ID already in use.";
    }

    try {
      const userDoc = doc(usersCollection, `${firstName} ${lastName}`);
      await setDoc(userDoc, {
        // firstName,
        // lastName,
        email,
        id,
        authLevel: "member"
      });
      return "Account Created! You can now sign in with Google via the login page.";
    } catch (error) {
      console.error("Error adding document: ", error);
      throw error;
    }
  };

  return (
    <main className="flex justify-center">
    <ThemeProvider theme={theme}>
      <div className="bg-red-violet p-5 rounded-3xl w-50 flex flex-col justify-center bg-opacity-60 gap-y-0 w-96 h-[650px] border-4 border-red-800 border-opacity-60 py-0 px-8 mt-8">
        <h1 className="text-center pb-3 text-4xl lg:text-4xl font-semibold lg:w-auto px-8 z-50 my-0 bg-transparent">
            Register
        </h1>
        <p className="mt-0 text-center text-gray-300 text-base mb-4">
          Sign up for Homestead FBLA!
        </p>
        <div className="flex flex-col space-y-8 justify-center px-4 p-2">
          <TextField
            className='textfield'
            label="First Name"
            variant="standard"
            InputLabelProps={{ className: 'textfield__label' }}
            name="firstName"
            onChange={handleInputChange}
          />
          <TextField
            className='textfield'
            label="Last Name"
            variant="standard"
            InputLabelProps={{ className: 'textfield__label' }}
            name="lastName"
            onChange={handleInputChange}
          />
          <TextField
            className='textfield'
            label="FUHSD Email"
            variant="standard"
            InputLabelProps={{ className: 'textfield__label' }}
            name="email"
            onChange={handleInputChange}
          />
          <TextField
            className='textfield'
            label="7 Digit Student ID"
            variant="standard"
            InputLabelProps={{ className: 'textfield__label' }}
            name="id"
            onChange={handleInputChange}
          />
          <TextField
            className='textfield'
            label="Registration Key"
            variant="standard"
            InputLabelProps={{ className: 'textfield__label' }}
            name="key"
            onChange={handleInputChange}
          />
          <button
            className=" bg-red-violet/70 font-semibold flex justify-center cursor-pointer p-3 rounded-xl text-lg hover:bg-watermelon-red ease-linear duration-200 border-2 border-watermelon-red "
            onClick={handleClick}
          >
            {state.buttonText}
          </button>
        </div>
        <div className="flex flex-row justify-center text-sm mt-2">
          <p className="">Already have an account?  </p>
          <p className="text-transparent">l</p>
          <a href="/login" className="text-red-400 underline">Login here!</a>
        </div>
      </div>
    </ThemeProvider>
    </main>
  );
}
