import React, { useState } from "react";
import "./App.css";
const App = () => {
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [imageSizeHeight, setImageSizeHeight] = useState("");
  console.log("imageSizeHeighttt", imageSizeHeight.height);
  const [imageSizeWidth, setImageSizeWidth] = useState("");
  console.log("imageSizeWidth", imageSizeWidth.width);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageSelected, setImageSelected] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!url.trim()) {
        throw new Error("URL cannot be empty");
      }
      const pikwyToken = "ff232fc438acf59c74dfb0595189327e8bb27118c18cd9d8";
      const pikwyApiUrl = `https://api.pikwy.com/?token=${pikwyToken}&url=${url}&fullPage=true`;

      const pikwyResponse = await fetch(pikwyApiUrl);

      if (!pikwyResponse.ok) {
        throw new Error("Failed to generate thumbnail");
      }

      const contentType = pikwyResponse.headers.get("content-type");
      let pikwyImageUrl, pikwyTimestamp, pikwyImageSize;

      if (contentType && contentType.includes("application/json")) {
        const pikwyData = await pikwyResponse.json();
        console.log("Pikwy Response:", pikwyData);

        pikwyImageUrl = pikwyData.screenshot;
        pikwyTimestamp = new Date().toISOString();
        pikwyImageSize = pikwyData.size;
      } else {
        const pikwyImageBlob = await pikwyResponse.blob();
        pikwyImageUrl = URL.createObjectURL(pikwyImageBlob);
        pikwyTimestamp = new Date().toISOString();
      }

      setThumbnailUrl(pikwyImageUrl);
      setTimestamp(pikwyTimestamp);

      const formData = new FormData();
      formData.append(
        "file",
        await fetch(pikwyImageUrl).then((res) => res.blob())
      );
      formData.append("upload_preset", "setmjglw");
      const cloudinaryData = await fetch(
        "https://api.cloudinary.com/v1_1/djbmffy5d/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      if (cloudinaryData.ok) {
        const responseData = await cloudinaryData.json();
        setImageSelected(responseData);
        console.log("responseee", responseData);
        setImageSizeHeight(responseData);
        setImageSizeWidth(responseData);
      } else {
        throw new Error("Failed to upload image to Cloudinary");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <div>
          <form className="InputText" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="inputFile"
            />
            <button className="SubmitButton" type="submit" disabled={loading}>
              {loading ? "Generating Thumbnail..." : "Generate Thumbnail"}
            </button>
          </form>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {thumbnailUrl && (
            <div
              className="Image-Styles"
              style={{ height: "200px", width: "400px" }}
            >
              <img
                style={{ height: "100%", width: "100%" }}
                src={thumbnailUrl}
                alt="Website Thumbnail"
                className="thumbNail"
              />
              <p>Timestamp: {new Date(timestamp).toLocaleString()}</p>
              <p>
                Image Size: {imageSizeHeight?.width} × {imageSizeWidth?.height}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
