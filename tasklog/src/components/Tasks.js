import React, { useState, useEffect } from "react";
import bannerImage from '../assets/banner.jpg'
import "../Styles/Tasks.css";

export default function Tasks() {
  const [jellyList, setJellyList] = useState([]);
  const [ritzzhList, setRitzzhList] = useState([]);
  const [jelly, setJelly] = useState("");
  const [ritzzh, setRitzzh] = useState("");
  const [today, setToday] = useState("");

  useEffect(() => {
    const localDate = () => {
      const date = new Date();
      const formattedDate = date.toISOString().split("T")[0];
      setToday(formattedDate);
    };

    fetchDataFromBackend();
    localDate();
  }, []);

  const handleAddTask = (list, setList, task) => {
    if (task === "") {
      alert("Please enter a task");
    } else {
      const updatedList = [...list];
      const dateEntry = updatedList.find((entry) => entry.date === today);

      if (dateEntry) {
        dateEntry.tasks.push(task);
      } else {
        updatedList.push({ date: today, tasks: [task] });
      }

      setList(updatedList);
      if (jellyList.length > 0 || ritzzhList.length > 0) {
        sendDataToBackend();
      }
      setJelly("");
      setRitzzh("");
    }
  };

  const fetchDataFromBackend = async () => {
    try {
      const response = await fetch(
        "https://studylog-backend-5w28.onrender.com/getdata"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else {
        const data = await response.json();
        setJellyList(data.jellyList || []);
        setRitzzhList(data.ritzzhList || []);
      }
    } catch (error) {
      console.error("Error fetching data from backend:", error);
    }
  };

  const sendDataToBackend = async () => {
    try {
      const response = await fetch(
        "https://studylog-backend-5w28.onrender.com/data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jellyList, ritzzhList }),
        }
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log("Data sent successfully:", data);
    } catch (error) {
      console.error("Error sending data to backend:", error);
    }
  };


  return (
    <div className="container">
      <div className="banner">
        <img src={bannerImage} alt="Banner" className="banner-img" />
        <h1 className="banner-text">TaskLog</h1>
      </div>
      <div className="hero">
        <div className="left">
          <div className="field">
            <p className="name-text">Ritzzh</p>
            <input
              className="input"
              onChange={(e) => setRitzzh(e.target.value)}
              value={ritzzh}
            />
            <button
              className="btn"
              onClick={() => handleAddTask(ritzzhList, setRitzzhList, ritzzh)}
            >
              Add
            </button>
          </div>
          <div className="list-container">
            {ritzzhList.map((entry, index) => (
              <div key={index} className="task-box">
                <p className="date-text">{entry.date}</p>
                {entry.tasks.map((task, i) => (
                  <p key={i} className="list-item">
                    {i + 1}. {task}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="right">
          <div className="field">
            <p className="name-text">Jelly</p>
            <input
              className="input"
              onChange={(e) => setJelly(e.target.value)}
              value={jelly}
            />
            <button
              className="btn"
              onClick={() => handleAddTask(jellyList, setJellyList, jelly)}
            >
              Add
            </button>
          </div>
          <div className="list-container">
            {jellyList.map((entry, index) => (
              <div key={index} className="task-box">
                <p className="date-text">{entry.date}</p>
                {entry.tasks.map((task, i) => (
                  <p key={i} className="list-item">
                    {i + 1}. {task}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
