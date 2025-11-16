import React from "react";
import "./UploadPDF.css";

type UploadPDFProps = {
  onUpload: (file: File) => void;
};

const UploadPDF: React.FC<UploadPDFProps> = ({ onUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
      e.target.value = "";
    }
  };

  return (
    <div className="upload-pdf" onClick={handleClick} title="Upload PDF">
      <span className="plus">+</span>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleChange}
      />
    </div>
  );
};

export default UploadPDF;
