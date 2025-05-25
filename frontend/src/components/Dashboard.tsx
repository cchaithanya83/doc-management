import * as React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Mock api utility (replace with actual import in a real app)
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/documents/",
});

interface Document {
  id: number;
  category_id: number;
  doc_type_id: number;
  subtype_id: number;
  doc_date: string;
  party_main_account: string;
  party_sub_account: string;
  file_path: string;
  file_name: string;
  uploaded_by: string;
  uploaded_date: string;
  modified_by: string;
  modified_date: string;
  remarks: string | null;
}

interface DocType {
  id: string;
  label: string;
}

interface Subtype {
  id: string;
  label: string;
}

interface FilterData {
  category_id: string;
  doc_type_id: string;
  from_date: string;
  to_date: string;
}

interface EditData {
  category_id: string;
  doc_type_id: string;
  subtype_id: string;
  doc_date: string;
  party_main_account: string;
  party_sub_account: string;
  modified_by: string;
  remarks: string;
}

const Dashboard: React.FC = () => {
  const [uid, setUid] = useState<string>("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [editData, setEditData] = useState<EditData>({
    category_id: "",
    doc_type_id: "",
    subtype_id: "",
    doc_date: "",
    party_main_account: "",
    party_sub_account: "",
    modified_by: "",
    remarks: "",
  });
  const [filterData, setFilterData] = useState<FilterData>({
    category_id: "",
    doc_type_id: "",
    from_date: "",
    to_date: "",
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isViewing, setIsViewing] = useState<boolean>(false);
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
      setUid(storedUid);
    } else {
      setMessage("No user ID found in localStorage. Please log in.");
    }
  }, []);

  // Fetch documents when uid changes
  useEffect(() => {
    if (uid) {
      fetchDocs();
    }
  }, [uid]);

  const fetchDocs = async (useFilter: boolean = false) => {
    try {
      let url = `user/${uid}`;
      if (useFilter) {
        const params = new URLSearchParams();
        if (filterData.category_id)
          params.append("category_id", filterData.category_id);
        if (filterData.doc_type_id)
          params.append("doc_type_id", filterData.doc_type_id);
        if (filterData.from_date)
          params.append("from_date", filterData.from_date);
        if (filterData.to_date) params.append("to_date", filterData.to_date);
        url = `user/${uid}/filter?${params.toString()}`;
      }
      const response = await api.get(url);
      setDocuments(Array.isArray(response.data) ? response.data : []);
      setMessage("");
    } catch (error: any) {
      console.error(
        "Error fetching documents:",
        error.response?.data || error.message
      );
      setMessage("Failed to load documents.");
      setDocuments([]);
    }
  };

  const handleDelete = async (docId: number) => {
    try {
      await api.delete(`/${docId}?uid=${uid}`);
      fetchDocs();
      setMessage("Document deleted successfully.");
    } catch (error: any) {
      console.error(
        "Error deleting document:",
        error.response?.data || error.message
      );
      setMessage("Failed to delete document.");
    }
  };

  const handleEditClick = (doc: Document) => {
    setSelectedDoc(doc);
    setEditData({
      category_id: doc.category_id.toString(),
      doc_type_id: doc.doc_type_id.toString(),
      subtype_id: doc.subtype_id.toString(),
      doc_date: doc.doc_date,
      party_main_account: doc.party_main_account,
      party_sub_account: doc.party_sub_account,
      modified_by: doc.uploaded_by,
      remarks: doc.remarks || "",
    });
    setIsEditing(true);
  };

  const handleViewClick = (doc: Document) => {
    setSelectedDoc(doc);
    setIsViewing(true);
  };

  const handleEditChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilterData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "doc_type_id" ? { subtype_id: "" } : {}),
    }));
  };

  const handleEditSubmit = async () => {
    if (!selectedDoc) return;
    try {
      await api.put(`/${selectedDoc.id}`, editData);
      setIsEditing(false);
      setMessage("Document updated successfully.");
      fetchDocs();
    } catch (error: any) {
      console.error(
        "Error updating document:",
        error.response?.data || error.message
      );
      setMessage("Failed to update document.");
    }
  };

  const handleFilterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetchDocs(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Documents</h1>

      {message && <p className="mb-4 text-yellow-400 text-center">{message}</p>}

      {/* Filter Form */}
      <div className="mb-8 bg-gray-700 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Filter Documents</h2>
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="category_id"
              placeholder="Category ID"
              value={filterData.category_id}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-600 rounded text-gray-200"
            />
            <select
              name="doc_type_id"
              value={filterData.doc_type_id}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-600 rounded text-gray-200"
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
            <input
              type="date"
              name="from_date"
              value={filterData.from_date}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-600 rounded text-gray-200"
            />
            <input
              type="date"
              name="to_date"
              value={filterData.to_date}
              onChange={handleFilterChange}
              className="w-full p-2 bg-gray-600 rounded text-gray-200"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition"
          >
            Apply Filter
          </button>
        </form>
      </div>

      {/* Document List */}
      <div className="space-y-4">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow"
            >
              <div className="flex items-center space-x-4">
                <img
                  src={`http://127.0.0.1:8000/documents/file/${doc.id}`}
                  alt={doc.file_name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{doc.file_name}</p>
                  <p className="text-sm text-gray-400">
                    {docTypes.find((t) => t.id === doc.doc_type_id.toString())
                      ?.label || doc.doc_type_id}{" "}
                    -{" "}
                    {subtypes[doc.doc_type_id.toString()]?.find(
                      (s) => s.id === doc.subtype_id.toString()
                    )?.label || doc.subtype_id}
                  </p>
                </div>
              </div>
              <div className="space-x-2">
                <button
                  className="text-blue-400 hover:text-blue-600 font-semibold"
                  onClick={() => handleViewClick(doc)}
                >
                  View
                </button>
                <button
                  className="text-yellow-400 hover:text-yellow-600 font-semibold"
                  onClick={() => handleEditClick(doc)}
                >
                  Edit
                </button>
                <button
                  className="text-red-400 hover:text-red-600 font-semibold"
                  onClick={() => handleDelete(doc.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center">No documents found.</p>
        )}
      </div>

      {/* Floating Upload Button */}
      <button
        className="fixed bottom-6 right-6 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition text-xl"
        onClick={() => navigate("/upload")}
      >
        ➕
      </button>

      {/* Edit Modal */}
      {isEditing && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-white">
            <h2 className="text-xl font-bold mb-4">Edit Document</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-semibold">Category ID:</label>
                <input
                  type="text"
                  name="category_id"
                  value={editData.category_id}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-600 rounded text-gray-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">
                  Document Type:
                </label>
                <select
                  name="doc_type_id"
                  value={editData.doc_type_id}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-600 rounded text-gray-200"
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
                <label className="block mb-1 font-semibold">Subtype:</label>
                <select
                  name="subtype_id"
                  value={editData.subtype_id}
                  onChange={handleEditChange}
                  disabled={!editData.doc_type_id}
                  className="w-full p-2 bg-gray-600 rounded text-gray-200"
                >
                  <option value="" disabled>
                    Select Subtype
                  </option>
                  {editData.doc_type_id &&
                    subtypes[editData.doc_type_id]?.map((subtype) => (
                      <option key={subtype.id} value={subtype.id}>
                        {subtype.label}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-semibold">
                  Document Date:
                </label>
                <input
                  type="date"
                  name="doc_date"
                  value={editData.doc_date}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-600 rounded text-gray-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">
                  Main Account:
                </label>
                <input
                  type="text"
                  name="party_main_account"
                  value={editData.party_main_account}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-600 rounded text-gray-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Sub Account:</label>
                <input
                  type="text"
                  name="party_sub_account"
                  value={editData.party_sub_account}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-600 rounded text-gray-200"
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">Remarks:</label>
                <textarea
                  name="remarks"
                  value={editData.remarks}
                  onChange={handleEditChange}
                  className="w-full p-2 bg-gray-600 rounded text-gray-200"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6 space-x-2">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
                onClick={handleEditSubmit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewing && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-lg text-white">
            <h2 className="text-xl font-bold mb-4">Document Details</h2>
            <div className="space-y-4">
              <img
                src={`http://127.0.0.1:8000/documents/file/${selectedDoc.id}`}
                alt={selectedDoc.file_name}
                className="w-full h-64 object-cover rounded mb-4"
              />
              <p>
                <strong>File Name:</strong> {selectedDoc.file_name}
              </p>
              <p>
                <strong>Category ID:</strong> {selectedDoc.category_id}
              </p>
              <p>
                <strong>Document Type:</strong>{" "}
                {docTypes.find(
                  (t) => t.id === selectedDoc.doc_type_id.toString()
                )?.label || selectedDoc.doc_type_id}
              </p>
              <p>
                <strong>Subtype:</strong>{" "}
                {subtypes[selectedDoc.doc_type_id.toString()]?.find(
                  (s) => s.id === selectedDoc.subtype_id.toString()
                )?.label || selectedDoc.subtype_id}
              </p>
              <p>
                <strong>Document Date:</strong> {selectedDoc.doc_date}
              </p>
              <p>
                <strong>Main Account:</strong> {selectedDoc.party_main_account}
              </p>
              <p>
                <strong>Sub Account:</strong> {selectedDoc.party_sub_account}
              </p>

              <p>
                <strong>Uploaded Date:</strong>{" "}
                {new Date(selectedDoc.uploaded_date).toLocaleString()}
              </p>

              <p>
                <strong>Modified Date:</strong>{" "}
                {new Date(selectedDoc.modified_date).toLocaleString()}
              </p>
              <p>
                <strong>Remarks:</strong> {selectedDoc.remarks || "None"}
              </p>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition"
                onClick={() => setIsViewing(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
