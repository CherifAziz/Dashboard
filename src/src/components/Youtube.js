import axios from "axios";
import React, { useEffect, useState } from "react";
import { tokens } from "../theme";
import { useLocation } from "react-router-dom";
import { auth, db } from "./Firebase";
import { collection, getDoc, doc, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import { useTheme } from "@mui/material";

const YoutubeWidget = ({ refresh }) => {
  const { state } = useLocation();
  const [stats, setStats] = useState([]);
  const [videoId, setVideoId] = useState([]);
  const [info, setInfo] = useState([]);
  const [user] = useAuthState(auth);
  const [isYoutube, setYoutube] = useState(false);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const disableWidget = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Google",
      "Widgets"
    );
    const docRef = doc(servicesRef, "Youtube");
    updateDoc(docRef, { state: false })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        setYoutube(false);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  const enableWidget = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Google",
      "Widgets"
    );
    const docRef = doc(servicesRef, "Youtube");
    updateDoc(docRef, { state: true })
      .then(() => {
        console.log("Document mis à jour avec succès!");
        setYoutube(true);
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/google/GetYoutubeVideo",
          {
            params: {
              uid: user?.uid,
              id: videoId,
              info: info,
            },
          }
        );
        if (response.data.status != "error") setStats(response.data);
        console.log(stats);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEmails();
    if (stats?.status == "error") fetchEmails();
  }, [user, videoId, info, refresh]);

  useEffect(() => {
    console.log(stats);
  }, [stats]);

  useEffect(() => {
    console.log(videoId);
    console.log(info);
  }, [videoId, info]);

  useEffect(() => {
    const getParams = async () => {
      const servicesRef = collection(
        db,
        "Users",
        user?.uid,
        "Services",
        "Google",
        "Widgets"
      );
      const docRef = doc(servicesRef, "Youtube");
      const docSnapshot = await getDoc(docRef);
      const data = docSnapshot.data();
      setVideoId(data?.videoId);
      setInfo(data?.info);
      setYoutube(data?.state);
    };
    getParams();
  }, [user]);

  function youtube_parser(url) {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : "";
  }

  const setData = () => {
    const servicesRef = collection(
      db,
      "Users",
      user?.uid,
      "Services",
      "Google",
      "Widgets"
    );
    const docRef = doc(servicesRef, "Youtube");
    updateDoc(docRef, { info: info, videoId: youtube_parser(videoId) })
      .then(() => {
        console.log("Document mis à jour avec succès!");
      })
      .catch((error) => {
        console.error("Erreur lors de la mise à jour du document:", error);
      });
  };

  return (
    <div class="widget-box">
      {state ? (
        <div className="center">
          <input
            type="text"
            placeholder="Youtube Video"
            className="city"
            onChange={(e) => setVideoId(e.target.value)}
          />
          <label>info :</label>
          <select
            style={{ marginLeft: 10 + "px" }}
            name="idaction"
            id="idaction"
            className="form-control"
            value={info}
            onChange={(e) => setInfo(e.target.value)}
          >
            <option disabled selected>
              -- Select Info --
            </option>
            <option value="views">views</option>
            <option value="likes">likes</option>
          </select>
          <div className="infos">
            {isYoutube === false ? (
              <ToggleOffIcon
                onClick={() => enableWidget()}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.neutral[100] }}
              />
            ) : (
              <ToggleOnIcon
                onClick={() => disableWidget()}
                fontSize="large"
                sx={{ cursor: "pointer", color: colors.primary[100] }}
              />
            )}
            <a
              style={{ fontSize: 17 + "px", cursor: "pointer" }}
              class="select"
              onClick={setData}
            >
              Set Youtube
            </a>
          </div>
        </div>
      ) : (
        <div>
          {stats.views != undefined ? <h1>Views</h1> : <h1>Likes</h1>}
          <div class="widget-container">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/1024px-YouTube_full-color_icon_%282017%29.svg.png"
              alt="icon"
              style={{ height: 40 + "px", marginBottom: 10 + "px" }}
            />
            {stats.views != undefined ? (
              <p class="temperature">{stats?.views}</p>
            ) : (
              <p class="temperature">{stats?.likes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default YoutubeWidget;
