import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./Firebase";

function Google() {
  const [user] = useAuthState(auth);

  const connectGoogle = () => {
    window.location.href =
      "http://localhost:8080/google/auth" + "?token=" + user?.uid;
  };

  return (
    <div>
      <button onClick={connectGoogle}>Connect</button>
    </div>
  );
}

export default Google;
