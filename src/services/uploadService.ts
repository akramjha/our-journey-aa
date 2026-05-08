export const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "checklist_upload");

  const isPdf = file.type === "application/pdf";
  const endpoint = isPdf ? "raw" : "image";

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/drqnbwdzs/" + endpoint + "/upload",
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    name: file.name,
    type: file.type
  };
};