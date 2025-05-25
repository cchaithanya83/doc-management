import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

interface FormData {
  category_id: string;
  doc_type_id: string;
  subtype_id: string;
  doc_date: string;
  party_main_account: string;
  party_sub_account: string;
  uploaded_by: string;
  remarks: string;
}

interface DocType {
  id: string;
  label: string;
}

interface Subtype {
  id: string;
  label: string;
}

const UploadDocument: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState<FormData>({
    category_id: "",
    doc_type_id: "",
    subtype_id: "",
    doc_date: "",
    party_main_account: "",
    party_sub_account: "",
    uploaded_by: "",
    remarks: "",
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  // Define document types with IDs and labels
  const docTypes: DocType[] = [
    { id: "1", label: "KYC" },
    { id: "2", label: "Accounting" },
    { id: "3", label: "Legal" },
  ];

  // Define subtypes with IDs per document type
  const subtypes: { [key: string]: Subtype[] } = {
    "1": [
      { id: "1", label: "Aadhar" },
      { id: "2", label: "Pan" },
      { id: "3", label: "DL" },
      { id: "4", label: "Application Form" },
      { id: "5", label: "Bank Guarantee" },
    ],
    "2": [
      { id: "1", label: "Bills" },
      { id: "2", label: "Receipts" },
      { id: "3", label: "CN" },
      { id: "4", label: "DN" },
    ],
    "3": [
      { id: "1", label: "Notices" },
      { id: "2", label: "Reminder" },
    ],
  };

  // Fetch uid from localStorage on mount
  useEffect(() => {
    const storedUid = localStorage.getItem("user_id");
    if (storedUid) {
      setFormData((prev) => ({ ...prev, uploaded_by: storedUid }));
    } else {
      setMessage("No user ID found. Please log in.");
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "doc_type_id") {
        return { ...prev, [name]: value, subtype_id: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }
    if (!formData.uploaded_by) {
      setMessage("User ID is required. Please log in.");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      if (
        !formData.category_id ||
        !formData.doc_type_id ||
        !formData.subtype_id ||
        !formData.doc_date ||
        !formData.party_main_account ||
        !formData.party_sub_account
      ) {
        setMessage("All fields are required.");
        setUploading(false);
        return;
      }

      const params = new URLSearchParams(
        formData as unknown as Record<string, string>
      ).toString();
      const formDataToSend = new FormData();
      formDataToSend.append("file", file);

      const response = await axios.post(
        `http://127.0.0.1:8000/documents/upload?${params}`,
        formDataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessage(`Upload successful: ${response.data.file_name}`);
      // Reset form after successful upload
      setFormData({
        category_id: "",
        doc_type_id: "",
        subtype_id: "",
        doc_date: "",
        party_main_account: "",
        party_sub_account: "",
        uploaded_by: formData.uploaded_by, // Keep uid
        remarks: "",
      });
      setFile(null);
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      setMessage("Upload failed. Check the console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-gray-800 text-white rounded-lg shadow-md min-h-screen flex items-center">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-4 text-center">Upload Document</h2>

        {message && (
          <p className="mb-4 text-yellow-400 text-center">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="file"
            onChange={handleFileChange}
            required
            className="block w-full text-gray-200"
          />

          <input
            type="text"
            name="category_id"
            placeholder="Category ID"
            value={formData.category_id}
            onChange={handleInputChange}
            required
            className="w-full p-2 bg-gray-700 rounded text-gray-200"
          />

          <select
            name="doc_type_id"
            value={formData.doc_type_id}
            onChange={handleInputChange}
            required
            className="w-full p-2 bg-gray-700 rounded text-gray-200"
          >
            <option value="" disabled>
              Select Document Type
            </option>
            {docTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            name="subtype_id"
            value={formData.subtype_id}
            onChange={handleInputChange}
            required
            disabled={!formData.doc_type_id}
            className="w-full p-2 bg-gray-700 rounded text-gray-200"
          >
            <option value="" disabled>
              Select Subtype
            </option>
            {formData.doc_type_id &&
              subtypes[formData.doc_type_id]?.map((subtype) => (
                <option key={subtype.id} value={subtype.id}>
                  {subtype.label}
                </option>
              ))}
          </select>

          <input
            type="date"
            name="doc_date"
            value={formData.doc_date}
            onChange={handleInputChange}
            required
            className="w-full p-2 bg-gray-700 rounded text-gray-200"
          />
          <input
            type="text"
            name="party_main_account"
            placeholder="Main Account"
            value={formData.party_main_account}
            onChange={handleInputChange}
            required
            className="w-full p-2 bg-gray-700 rounded text-gray-200"
          />
          <input
            type="text"
            name="party_sub_account"
            placeholder="Sub Account"
            value={formData.party_sub_account}
            onChange={handleInputChange}
            required
            className="w-full p-2 bg-gray-700 rounded text-gray-200"
          />
          {/* <input
            type="text"
            name="uploaded_by"
            placeholder="Uploaded By"
            value={formData.uploaded_by}
            readOnly
            className="w-full p-2 bg-gray-700 rounded text-gray-200 cursor-not-allowed"
          /> */}
          <textarea
            name="remarks"
            placeholder="Remarks (Optional)"
            value={formData.remarks}
            onChange={handleInputChange}
            className="w-full p-2 bg-gray-700 rounded text-gray-200"
          ></textarea>

          <button
            type="submit"
            disabled={uploading || !formData.uploaded_by}
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 disabled:cursor-not-allowed transition"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
