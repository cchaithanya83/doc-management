
import * as React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const docTypes: DocType[] = [
    { id: "1", label: "KYC" },
    { id: "2", label: "Accounting" },
    { id: "3", label: "Legal" },
  ];

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
      setTimeout(() => navigate("/login"), 2000);
    }
  }, [navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "doc_type_id" ? { subtype_id: "" } : {}),
    }));
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
        setMessage("All required fields must be filled.");
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
      setFormData({
        category_id: "",
        doc_type_id: "",
        subtype_id: "",
        doc_date: "",
        party_main_account: "",
        party_sub_account: "",
        uploaded_by: formData.uploaded_by,
        remarks: "",
      });
      setFile(null);
      setTimeout(() => navigate("/"), 2000); // Redirect to dashboard after 2 seconds
    } catch (error: any) {
      console.error("Upload error:", error.response?.data || error.message);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Upload Document</h2>

        {message && (
          <p className={`text-sm text-center mb-4 p-2 rounded ${message.includes("success") ? "text-green-600 bg-green-50" : "text-red-500 bg-red-50"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
              Select File
            </label>
            <input
              id="file"
              type="file"
              onChange={handleFileChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
          </div>
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
              Category ID
            </label>
            <input
              id="category_id"
              type="text"
              name="category_id"
              placeholder="Enter Category ID"
              value={formData.category_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="doc_type_id" className="block text-sm font-medium text-gray-700 mb-1">
              Document Type
            </label>
            <select
              id="doc_type_id"
              name="doc_type_id"
              value={formData.doc_type_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
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
          </div>
          <div>
            <label htmlFor="subtype_id" className="block text-sm font-medium text-gray-700 mb-1">
              Subtype
            </label>
            <select
              id="subtype_id"
              name="subtype_id"
              value={formData.subtype_id}
              onChange={handleInputChange}
              required
              disabled={!formData.doc_type_id}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors disabled:bg-gray-200"
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
          </div>
          <div>
            <label htmlFor="doc_date" className="block text-sm font-medium text-gray-700 mb-1">
              Document Date
            </label>
            <input
              id="doc_date"
              type="date"
              name="doc_date"
              value={formData.doc_date}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="party_main_account" className="block text-sm font-medium text-gray-700 mb-1">
              Main Account
            </label>
            <input
              id="party_main_account"
              type="text"
              name="party_main_account"
              placeholder="Enter Main Account"
              value={formData.party_main_account}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="party_sub_account" className="block text-sm font-medium text-gray-700 mb-1">
              Sub Account
            </label>
            <input
              id="party_sub_account"
              type="text"
              name="party_sub_account"
              placeholder="Enter Sub Account"
              value={formData.party_sub_account}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              id="remarks"
              name="remarks"
              placeholder="Enter remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={uploading || !formData.uploaded_by}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              "Upload"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadDocument;
