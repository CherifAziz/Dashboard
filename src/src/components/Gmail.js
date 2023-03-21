import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { auth } from "./Firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const EmailWidget = ({ refresh }) => {
  const [emails, setEmails] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/google/ListEmails",
          {
            params: {
              uid: user?.uid,
              max: 10,
            },
          }
        );
        setEmails(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchEmails();
  }, [user, refresh]);

  return (
    <div class="mail-widget">
      <ul class="mail-list">
        {emails.map((email) => (
          <li key={email.id} class="mail-item">
            <span class="mail-from">
              {email.from.substring(0, email.from.indexOf("<"))}
            </span>
            <span class="mail-subject">{email.subject}</span>
            <span class="mail-date">{email.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EmailWidget;
