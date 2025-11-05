import React from "react";
import { Routes, Route } from "react-router";
import { SignIn, SignUp, SignedIn, SignedOut, UserButton } from "@clerk/react-router";

function App() {
  return (
    <header>
      < SignedOut>
        <SignedInButton />
      </SignedOut>
      < SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}

export default App;
