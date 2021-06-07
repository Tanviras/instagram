import { Button } from "@material-ui/core";
import React, { useState } from "react";
import firebase from "firebase";
import { storage, db } from "./firebase";
import "./ImageUpload.css";

const ImageUpload = ({ username }) => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const uploadTask = storage.ref(`images/${image.name}`).put(image);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        //progress function...
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      (error) => {
        console.log(error);
        alert(error.message);
      },
      () => {
        storage
          .ref("images")
          .child(image.name)
          .getDownloadURL()
          .then((url) => {
            setUrl(url);

            //post image inside db
            db.collection("posts").add({
              imageUrl: url,
              caption: caption,
              username: username,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });

            setProgress(0);
            setCaption("");
            setImage(null);
          });
      }
    );
  };

  return (
    <div className="imageUpload">
      <h3>Post A New Photo...</h3>
      <br />
      <progress
        className="imageUpload__progress"
        value={progress}
        max="100"
      ></progress>
      <input
        className="imageUpload__input"
        placeholder="Enter a Caption..."
        onChange={(event) => setCaption(event.target.value)}
        value={caption}
      ></input>
      <br />
      <input type="file" onChange={handleChange}></input>
      <br />

      <Button
        variant="contained"
        color="primary"
        className="imageUpload__button"
        onClick={handleUpload}
      >
        Upload
      </Button>
    </div>
  );
};

export default ImageUpload;
